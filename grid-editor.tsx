"use client"
import { getRandomColor, calculateCellDimensions } from "@/utils/grid-utils" // Added calculateAspectRatio
import { useState, useCallback, useEffect, useRef } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Box } from "@/components/box"
import { ImageUploader } from "@/image-uploader"
import { toast } from "@/components/ui/use-toast"
import { PhotoTray } from "@/components/photo-tray"
import { TOAST_DURATION, MAX_COLUMNS, MIN_COLUMNS, MAX_ROWS, MIN_ROWS, MAX_DIMENSION, MIN_DIMENSION } from "@/constants" // Import new constants
import { Topbar } from "@/components/topbar"
import { Sidebar } from "@/components/sidebar"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { Project, ProjectImage, GridConfig, BoxItem as AppBoxItem } from "@/lib/types"
import type { LayoutTemplate } from "@/layout-templates" // Import LayoutTemplate type
import type { SizePreset } from "@/size-presets" // Import SizePreset type

// Box interface (client-side representation, might differ from DB schema slightly)
interface BoxItem extends AppBoxItem {
  // Add any client-specific fields if needed, e.g., isDragging
}

interface GridEditorProps {
  initialProject: Project
  initialImages: ProjectImage[]
}

export default function GridEditorComponent({ initialProject, initialImages }: GridEditorProps) {
  const supabase = getSupabaseBrowserClient()

  const [project, setProject] = useState<Project>(initialProject)
  const [gridConfig, setGridConfig] = useState<GridConfig>(initialProject.grid_config)

  const transformDbImageToBoxItem = useCallback(
    (dbImage: ProjectImage | AppBoxItem, isTrayImage = false): AppBoxItem => {
      let publicURL = ""
      if (dbImage.storage_path) {
        const { data } = supabase.storage.from("project-files").getPublicUrl(dbImage.storage_path)
        publicURL = data?.publicUrl || "/placeholder.svg?text=Error"
      }
      return {
        ...dbImage,
        id: dbImage.id,
        imageUrl: publicURL,
        content: dbImage.content || `Image ${dbImage.id.slice(0, 5)}`,
        color: dbImage.color || getRandomColor(),
        row_span: dbImage.row_span || 1,
        col_span: dbImage.col_span || 1,
        position: isTrayImage || dbImage.position === null || dbImage.position === undefined ? -1 : dbImage.position,
        inUse: !isTrayImage && dbImage.position !== null && dbImage.position !== undefined && dbImage.position !== -1,
      }
    },
    [supabase.storage],
  )

  const [boxes, setBoxes] = useState<AppBoxItem[]>(() =>
    initialImages
      .filter((img) => img.position !== null && img.position !== undefined && img.position !== -1)
      .map((img) => transformDbImageToBoxItem(img, false)),
  )

  const [trayImages, setTrayImages] = useState<AppBoxItem[]>(
    () => initialImages.map((img) => transformDbImageToBoxItem(img, true)), // All images initially, inUse determined by position
  )

  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null)
  const [isUploaderOpen, setIsUploaderOpen] = useState(false)
  const [isMultiUpload, setIsMultiUpload] = useState(false)
  const [uploadTargetPosition, setUploadTargetPosition] = useState<number | null>(null)
  const [scale, setScale] = useState(1)
  const [manualZoom, setManualZoom] = useState<number | null>(null)
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 })
  const [widthInputValue, setWidthInputValue] = useState(gridConfig.width.toString())
  const [heightInputValue, setHeightInputValue] = useState(gridConfig.height.toString())

  const gridContainerRef = useRef<HTMLDivElement>(null)
  const gridWrapperRef = useRef<HTMLDivElement>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)

  // Sync input values when gridConfig dimensions change programmatically
  useEffect(() => {
    setWidthInputValue(gridConfig.width.toString())
    setHeightInputValue(gridConfig.height.toString())
  }, [gridConfig.width, gridConfig.height])

  const saveGridConfig = useCallback(
    async (newConfig: GridConfig) => {
      setGridConfig(newConfig) // Optimistic update
      const { error } = await supabase
        .from("projects")
        .update({ grid_config: newConfig, updated_at: new Date().toISOString() })
        .eq("id", project.id)
      if (error) {
        toast({ title: "Error saving grid settings", description: error.message, variant: "destructive" })
        // TODO: Revert optimistic update if needed
      }
    },
    [supabase, project.id],
  )

  const addImageToDbAndTray = async (file: File): Promise<AppBoxItem | null> => {
    const { data: userSession } = await supabase.auth.getUser()
    if (!userSession.user) {
      toast({ title: "Authentication Error", description: "User not authenticated.", variant: "destructive" })
      return null
    }

    const fileName = `${crypto.randomUUID()}-${file.name}`
    const filePath = `${userSession.user.id}/${project.id}/images/${fileName}`

    const { error: uploadError } = await supabase.storage.from("project-files").upload(filePath, file)
    if (uploadError) {
      toast({ title: "Storage Upload Failed", description: uploadError.message, variant: "destructive" })
      return null
    }

    const { data: newImageRecord, error: dbError } = await supabase
      .from("project_images")
      .insert({
        project_id: project.id,
        storage_path: filePath,
        original_filename: file.name,
        file_size: file.size,
        mime_type: file.type,
        content: file.name.split(".")[0], // Default content from filename
        // position, row_span, col_span are null for new tray images
      })
      .select()
      .single()

    if (dbError || !newImageRecord) {
      toast({
        title: "Database Error",
        description: `Failed to save image metadata: ${dbError?.message}`,
        variant: "destructive",
      })
      // Consider deleting from storage if DB insert fails
      await supabase.storage.from("project-files").remove([filePath])
      return null
    }

    const newTrayItem = transformDbImageToBoxItem(newImageRecord, true)
    setTrayImages((prev) => [...prev, newTrayItem])
    return newTrayItem
  }

  const handleAddImagesToTray = useCallback(
    async (files: FileList) => {
      if (files.length === 0) return
      let successCount = 0
      for (const file of Array.from(files)) {
        const result = await addImageToDbAndTray(file)
        if (result) successCount++
      }
      if (successCount > 0) {
        toast({ title: `${successCount} image(s) added to tray.`, duration: TOAST_DURATION })
      }
    },
    [supabase, project.id],
  ) // Removed dependency on addImageToDbAndTray

  const deleteBoxFromGrid = useCallback(
    async (boxId: string) => {
      // Renamed from deleteBox to be specific
      const boxToMove = boxes.find((b) => b.id === boxId)
      if (!boxToMove) return

      setBoxes((prev) => prev.filter((b) => b.id !== boxId))
      setTrayImages((prev) => {
        const existingIndex = prev.findIndex((img) => img.id === boxId)
        if (existingIndex !== -1) {
          return prev.map((img) =>
            img.id === boxId ? { ...img, inUse: false, position: -1, row_span: 1, col_span: 1 } : img,
          )
        }
        return [...prev, { ...boxToMove, inUse: false, position: -1, row_span: 1, col_span: 1 }]
      })
      if (selectedBoxId === boxId) setSelectedBoxId(null)

      const { error } = await supabase
        .from("project_images")
        .update({ position: null, row_span: null, col_span: null, placed_at: null })
        .eq("id", boxId)

      if (error) {
        toast({ title: "Error moving image to tray", description: error.message, variant: "destructive" })
        // TODO: Revert UI update
      } else {
        toast({ title: "Image moved to tray", duration: TOAST_DURATION })
      }
    },
    [supabase, boxes, selectedBoxId, trayImages],
  ) // Added trayImages

  const handleRemoveImageFromTray = useCallback(
    async (imageId: string) => {
      const imageToRemove = trayImages.find((img) => img.id === imageId && !img.inUse)
      if (!imageToRemove) {
        toast({ title: "Cannot remove", description: "Image is in use or not found.", variant: "destructive" })
        return
      }

      setTrayImages((prev) => prev.filter((img) => img.id !== imageId))

      if (imageToRemove.storage_path) {
        const { error: storageError } = await supabase.storage
          .from("project-files")
          .remove([imageToRemove.storage_path])
        if (storageError) {
          toast({
            title: "Storage Error",
            description: `Failed to delete image file: ${storageError.message}`,
            variant: "destructive",
          })
          // TODO: Add back to trayImages if storage delete fails?
        }
      }
      const { error: dbError } = await supabase.from("project_images").delete().eq("id", imageId)
      if (dbError) {
        toast({
          title: "Database Error",
          description: `Failed to delete image record: ${dbError.message}`,
          variant: "destructive",
        })
        // TODO: Add back to trayImages if DB delete fails?
      } else {
        toast({ title: "Image removed from tray permanently.", duration: TOAST_DURATION })
      }
    },
    [supabase, trayImages],
  )

  const handleClearTray = useCallback(async () => {
    const imagesToDelete = trayImages.filter((img) => !img.inUse)
    if (imagesToDelete.length === 0) {
      toast({ title: "Tray is already empty.", duration: TOAST_DURATION })
      return
    }

    const pathsToDelete = imagesToDelete.map((img) => img.storage_path).filter(Boolean) as string[]
    const idsToDelete = imagesToDelete.map((img) => img.id)

    setTrayImages((prev) => prev.filter((img) => img.inUse)) // Optimistic UI update

    if (pathsToDelete.length > 0) {
      const { error: storageError } = await supabase.storage.from("project-files").remove(pathsToDelete)
      if (storageError) {
        toast({
          title: "Storage Error",
          description: `Some files might not have been deleted: ${storageError.message}`,
          variant: "destructive",
        })
      }
    }
    const { error: dbError } = await supabase.from("project_images").delete().in("id", idsToDelete)
    if (dbError) {
      toast({
        title: "Database Error",
        description: `Some records might not have been deleted: ${dbError.message}`,
        variant: "destructive",
      })
      // TODO: Revert UI if needed
    } else {
      toast({ title: "Tray cleared.", duration: TOAST_DURATION })
    }
  }, [supabase, trayImages])

  const handleAddColumn = useCallback(() => {
    if (gridConfig.columns < MAX_COLUMNS) {
      saveGridConfig({ ...gridConfig, columns: gridConfig.columns + 1 })
    } else {
      toast({
        title: "Max columns reached",
        description: `Cannot add more than ${MAX_COLUMNS} columns.`,
        duration: TOAST_DURATION,
      })
    }
  }, [gridConfig, saveGridConfig])

  const handleRemoveColumn = useCallback(() => {
    if (gridConfig.columns > MIN_COLUMNS) {
      saveGridConfig({ ...gridConfig, columns: gridConfig.columns - 1 })
      // TODO: Add logic to handle images in the removed column (e.g., move to tray or warn user)
    } else {
      toast({
        title: "Min columns reached",
        description: `Must have at least ${MIN_COLUMNS} column.`,
        duration: TOAST_DURATION,
      })
    }
  }, [gridConfig, saveGridConfig])

  const handleAddRow = useCallback(() => {
    if (gridConfig.rows < MAX_ROWS) {
      saveGridConfig({ ...gridConfig, rows: gridConfig.rows + 1 })
    } else {
      toast({
        title: "Max rows reached",
        description: `Cannot add more than ${MAX_ROWS} rows.`,
        duration: TOAST_DURATION,
      })
    }
  }, [gridConfig, saveGridConfig])

  const handleRemoveRow = useCallback(() => {
    if (gridConfig.rows > MIN_ROWS) {
      saveGridConfig({ ...gridConfig, rows: gridConfig.rows - 1 })
      // TODO: Add logic to handle images in the removed row
    } else {
      toast({ title: "Min rows reached", description: `Must have at least ${MIN_ROWS} row.`, duration: TOAST_DURATION })
    }
  }, [gridConfig, saveGridConfig])

  const updateGridDimensionsValidated = useCallback(
    (newWidthStr: string, newHeightStr: string) => {
      const newWidth = Number.parseInt(newWidthStr, 10)
      const newHeight = Number.parseInt(newHeightStr, 10)
      let updated = false
      const currentConfig = { ...gridConfig }

      if (!isNaN(newWidth) && newWidth >= MIN_DIMENSION && newWidth <= MAX_DIMENSION) {
        currentConfig.width = newWidth
        updated = true
      } else {
        setWidthInputValue(gridConfig.width.toString()) // Revert if invalid
      }
      if (!isNaN(newHeight) && newHeight >= MIN_DIMENSION && newHeight <= MAX_DIMENSION) {
        currentConfig.height = newHeight
        updated = true
      } else {
        setHeightInputValue(gridConfig.height.toString()) // Revert if invalid
      }
      if (updated) {
        saveGridConfig(currentConfig)
      }
    },
    [gridConfig, saveGridConfig],
  )

  const handleApplySizePreset = useCallback(
    (preset: SizePreset) => {
      const newConfig = { ...gridConfig, width: preset.width, height: preset.height }
      // Optional: Adjust rows/columns based on aspect ratio if desired, or leave as is.
      // For now, just updating dimensions.
      saveGridConfig(newConfig)
      setWidthInputValue(preset.width.toString())
      setHeightInputValue(preset.height.toString())
      toast({ title: `Applied preset: ${preset.name}`, duration: TOAST_DURATION })
    },
    [gridConfig, saveGridConfig],
  )

  const handleApplyTemplate = useCallback(
    (template: LayoutTemplate) => {
      const newConfig = {
        ...gridConfig,
        rows: template.rows,
        columns: template.columns,
        width: template.defaultWidth || gridConfig.width, // Use template width or keep current
        height: template.defaultHeight || gridConfig.height, // Use template height or keep current
      }
      saveGridConfig(newConfig)
      // TODO: Clear existing boxes or attempt to map them to the new template structure.
      // For now, it just changes grid dimensions. User has to manually place images.
      setBoxes([]) // Simple approach: clear existing boxes when applying a template
      setTrayImages((prev) => prev.map((img) => ({ ...img, inUse: false, position: -1 }))) // Mark all as not in use
      toast({
        title: `Applied template: ${template.name}`,
        description: "Existing images moved to tray.",
        duration: TOAST_DURATION,
      })
    },
    [gridConfig, saveGridConfig],
  )

  const calculateEmptyGridPositions = useCallback((): number[] => {
    const totalSlots = gridConfig.rows * gridConfig.columns
    const occupiedPositions = new Set(
      boxes.map((box) => box.position).filter((pos) => pos !== null && pos !== undefined && pos !== -1),
    )
    const emptySlots: number[] = []
    for (let i = 0; i < totalSlots; i++) {
      if (!occupiedPositions.has(i)) {
        emptySlots.push(i)
      }
    }
    return emptySlots
  }, [boxes, gridConfig.rows, gridConfig.columns])

  const handlePlaceImageInFirstEmptySlot = useCallback(
    async (imageId: string) => {
      const emptyPositions = calculateEmptyGridPositions()
      if (emptyPositions.length === 0) {
        toast({ title: "Grid is full", description: "No empty slots to place the image.", variant: "destructive" })
        return
      }
      const targetPosition = emptyPositions[0]
      const imageToPlace = trayImages.find((img) => img.id === imageId)
      if (!imageToPlace) return

      const newBox: AppBoxItem = {
        ...imageToPlace,
        position: targetPosition,
        row_span: 1, // Default spans
        col_span: 1,
        inUse: true,
        placed_at: new Date().toISOString(),
      }

      setBoxes((prev) => [...prev, newBox])
      setTrayImages((prev) =>
        prev.map((img) => (img.id === imageId ? { ...img, inUse: true, position: targetPosition } : img)),
      )

      const { error } = await supabase
        .from("project_images")
        .update({
          position: targetPosition,
          row_span: 1,
          col_span: 1,
          placed_at: new Date().toISOString(),
        })
        .eq("id", imageId)

      if (error) {
        toast({ title: "Error placing image", description: error.message, variant: "destructive" })
        // Revert UI
        setBoxes((prev) => prev.filter((b) => b.id !== imageId))
        setTrayImages((prev) => prev.map((img) => (img.id === imageId ? { ...img, inUse: false, position: -1 } : img)))
      } else {
        toast({ title: "Image placed on grid.", duration: TOAST_DURATION })
      }
    },
    [calculateEmptyGridPositions, trayImages, supabase, boxes],
  ) // Added boxes dependency

  const handleReplaceImageInBox = useCallback(
    async (boxIdToReplace: string, newImageFile: File) => {
      const oldBoxData = boxes.find((b) => b.id === boxIdToReplace)
      if (!oldBoxData || !oldBoxData.storage_path) {
        toast({ title: "Error", description: "Original image data not found.", variant: "destructive" })
        return
      }
      const oldStoragePath = oldBoxData.storage_path

      // 1. Upload new image
      const { data: userSession } = await supabase.auth.getUser()
      if (!userSession.user) return
      const newFileName = `${crypto.randomUUID()}-${newImageFile.name}`
      const newFilePath = `${userSession.user.id}/${project.id}/images/${newFileName}`

      const { error: uploadError } = await supabase.storage.from("project-files").upload(newFilePath, newImageFile)
      if (uploadError) {
        toast({ title: "Upload Failed", description: uploadError.message, variant: "destructive" })
        return
      }

      // 2. Update database record
      const { data: updatedImageRecord, error: dbError } = await supabase
        .from("project_images")
        .update({
          storage_path: newFilePath,
          original_filename: newImageFile.name,
          file_size: newImageFile.size,
          mime_type: newImageFile.type,
          content: newImageFile.name.split(".")[0], // Update content
          updated_at: new Date().toISOString(),
        })
        .eq("id", boxIdToReplace)
        .select()
        .single()

      if (dbError || !updatedImageRecord) {
        toast({ title: "DB Update Failed", description: dbError?.message, variant: "destructive" })
        await supabase.storage.from("project-files").remove([newFilePath]) // Clean up new upload
        return
      }

      // 3. Update local state
      const updatedBoxItem = transformDbImageToBoxItem(updatedImageRecord, false)
      setBoxes((prevBoxes) => prevBoxes.map((b) => (b.id === boxIdToReplace ? updatedBoxItem : b)))

      // Also update in trayImages if it exists there (though it shouldn't be "inUse" false if it's on the grid)
      setTrayImages((prevTray) =>
        prevTray.map((ti) => (ti.id === boxIdToReplace ? { ...updatedBoxItem, inUse: true } : ti)),
      )

      // 4. Delete old image from storage
      const { error: deleteOldError } = await supabase.storage.from("project-files").remove([oldStoragePath])
      if (deleteOldError) {
        toast({
          title: "Storage Cleanup Warning",
          description: `Failed to delete old image file: ${deleteOldError.message}`,
          variant: "default",
        })
      }

      toast({ title: "Image replaced successfully!", duration: TOAST_DURATION })
      setSelectedBoxId(null)
      setIsUploaderOpen(false)
    },
    [supabase, project.id, boxes, transformDbImageToBoxItem],
  )

  // Placeholder for complex DND operations
  const handleMoveBoxOnGrid = (draggedId: string, targetPosition: number) => {
    toast({
      title: "Move Box (TODO)",
      description: `Simulating move of ${draggedId} to ${targetPosition}. Full DND not yet implemented.`,
      duration: TOAST_DURATION,
    })
    // Basic optimistic update for now, needs proper DND and Supabase integration
    setBoxes((prevBoxes) => {
      const boxToMove = prevBoxes.find((b) => b.id === draggedId)
      if (!boxToMove) return prevBoxes
      const otherBoxes = prevBoxes.filter((b) => b.id !== draggedId)
      // This is a naive insert, real DND would handle swaps/collision
      const newBoxes = [...otherBoxes]
      newBoxes.splice(targetPosition, 0, { ...boxToMove, position: targetPosition })
      // Re-index subsequent boxes if positions are dense
      return newBoxes.map((b, idx) => ({ ...b, position: idx })) // Simplistic re-indexing
    })
  }
  const handleSwapBoxesOnGrid = (sourceId: string, targetId: string) => {
    toast({
      title: "Swap Boxes (TODO)",
      description: `Simulating swap of ${sourceId} and ${targetId}. Full DND not yet implemented.`,
      duration: TOAST_DURATION,
    })
  }
  const handleExpandBox = (boxId: string, newRowSpan: number, newColSpan: number) => {
    toast({
      title: "Expand Box (TODO)",
      description: `Simulating expand of ${boxId}. Full resizing not yet implemented.`,
      duration: TOAST_DURATION,
    })
    setBoxes((prevBoxes) =>
      prevBoxes.map((b) => (b.id === boxId ? { ...b, row_span: newRowSpan, col_span: newColSpan } : b)),
    )
    // TODO: Update Supabase
  }

  const { cellWidth, cellHeight } = calculateCellDimensions(
    gridConfig.width,
    gridConfig.height,
    gridConfig.columns,
    gridConfig.rows,
    gridConfig.gap,
  )

  if (!project) return <div>Loading project data...</div>

  const gridDisplayBoxes = boxes
    .filter((b) => b.position !== null && b.position !== undefined && b.position !== -1)
    .sort((a, b) => (a.position || 0) - (b.position || 0)) // Ensure sorted by position

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app-container" style={{ height: "calc(100vh - 64px)", display: "flex", flexDirection: "column" }}>
        <div
          className="app-content"
          style={{ display: "grid", gridTemplateColumns: "auto 1fr", gridTemplateRows: "auto 1fr", flexGrow: 1 }}
        >
          <div className="corner bg-background"></div> {/* Top-left corner */}
          <Topbar
            columns={gridConfig.columns}
            gridWidth={gridConfig.width}
            gridHeight={gridConfig.height}
            gridGap={gridConfig.gap}
            cornerRadius={gridConfig.cornerRadius || 0}
            scale={manualZoom ?? scale}
            manualZoom={manualZoom}
            widthInputValue={widthInputValue}
            heightInputValue={heightInputValue}
            onAddColumn={handleAddColumn}
            onRemoveColumn={handleRemoveColumn}
            onWidthInputChange={setWidthInputValue}
            onHeightInputChange={setHeightInputValue}
            onWidthInputBlur={() => updateGridDimensionsValidated(widthInputValue, heightInputValue)}
            onHeightInputBlur={() => updateGridDimensionsValidated(widthInputValue, heightInputValue)}
            onWidthInputKeyDown={(e) =>
              e.key === "Enter" && updateGridDimensionsValidated(widthInputValue, heightInputValue)
            }
            onHeightInputKeyDown={(e) =>
              e.key === "Enter" && updateGridDimensionsValidated(widthInputValue, heightInputValue)
            }
            onInputClick={(e) => e.stopPropagation()}
            applySizePreset={handleApplySizePreset}
            applyTemplate={handleApplyTemplate}
            updateGridGap={(newGap) => saveGridConfig({ ...gridConfig, gap: newGap })}
            setCornerRadius={(newRadius) => saveGridConfig({ ...gridConfig, cornerRadius: newRadius })}
            onZoomIn={() => setManualZoom((prev) => Math.min(Number.parseFloat(((prev ?? scale) + 0.1).toFixed(2)), 2))}
            onZoomOut={() =>
              setManualZoom((prev) => Math.max(Number.parseFloat(((prev ?? scale) - 0.1).toFixed(2)), 0.1))
            }
            onFitToView={() => {
              /* TODO: Implement fit to view logic */ setScale(1)
              setManualZoom(null)
              setPanPosition({ x: 0, y: 0 })
              toast({ title: "Fit to View (TODO)" })
            }}
            onResetZoom={() => {
              setScale(1)
              setManualZoom(null)
              setPanPosition({ x: 0, y: 0 })
            }}
            boxesLength={gridDisplayBoxes.length}
          />
          <Sidebar rows={gridConfig.rows} onAddRow={handleAddRow} onRemoveRow={handleRemoveRow} />
          <div
            ref={canvasContainerRef}
            className="canvas-container bg-gray-200" // Changed background for visibility
            style={{ overflow: "auto", position: "relative", gridColumn: "2", gridRow: "2" }}
            // TODO: Add panning event handlers (onMouseDown, onMouseMove, onMouseUp, onWheel for zoom)
          >
            <div
              ref={gridWrapperRef}
              className="grid-wrapper"
              style={{ position: "absolute", left: panPosition.x, top: panPosition.y, cursor: "grab" }} // Added cursor
            >
              <div
                className="grid-container bg-white shadow-lg" // Added shadow
                ref={gridContainerRef}
                style={{
                  display: "grid",
                  gridTemplateRows: `repeat(${gridConfig.rows}, ${cellHeight}px)`, // Use calculated cellHeight
                  gridTemplateColumns: `repeat(${gridConfig.columns}, ${cellWidth}px)`, // Use calculated cellWidth
                  gap: `${gridConfig.gap}px`,
                  padding: "0px", // Padding can affect calculations, consider removing or accounting for it
                  width: `${gridConfig.width}px`,
                  height: `${gridConfig.height}px`,
                  transform: `scale(${manualZoom ?? scale})`,
                  transformOrigin: "0 0",
                  // borderRadius: `${gridConfig.cornerRadius || 0}px`, // Apply to boxes instead if gap > 0
                  // onClick to deselect box if clicking on grid background
                  onClick: (e) => {
                    if (e.target === gridContainerRef.current) setSelectedBoxId(null)
                  },
                }}
              >
                {gridDisplayBoxes.map((box) => (
                  <Box
                    key={box.id}
                    id={box.id}
                    index={box.position!}
                    content={box.content || ""}
                    color={box.color || "bg-gray-100"}
                    imageUrl={box.imageUrl}
                    rowSpan={box.row_span || 1}
                    colSpan={box.col_span || 1}
                    totalColumns={gridConfig.columns}
                    moveBox={handleMoveBoxOnGrid}
                    deleteBox={deleteBoxFromGrid}
                    expandBox={handleExpandBox}
                    swapBoxes={handleSwapBoxesOnGrid}
                    onChangeImage={(id) => {
                      setSelectedBoxId(id)
                      setUploadTargetPosition(null) // Not adding to empty cell, but replacing
                      setIsUploaderOpen(true)
                      setIsMultiUpload(false)
                    }}
                    isSelected={selectedBoxId === box.id}
                    onSelect={setSelectedBoxId}
                    cellWidth={cellWidth}
                    cellHeight={cellHeight}
                    cornerRadius={gridConfig.cornerRadius || 0}
                    scale={manualZoom ?? scale}
                  />
                ))}
                {/* TODO: Render EmptyCell components for drag targets if needed, or handle drop on grid-container */}
              </div>
            </div>
          </div>
        </div>
        <PhotoTray
          images={trayImages.filter((img) => !img.inUse)}
          onAddToGrid={handlePlaceImageInFirstEmptySlot}
          onRemoveFromTray={handleRemoveImageFromTray}
          onClearTray={handleClearTray}
          onAddImages={handleAddImagesToTray}
          onPlaceAll={() => {
            /* TODO */ toast({ title: "Place All (TODO)" })
          }}
          deleteBox={deleteBoxFromGrid} // This prop might be misnamed if it's for tray images; consider onRemoveFromTray
        />
        {isUploaderOpen && (
          <ImageUploader
            isOpen={isUploaderOpen}
            onClose={() => {
              setIsUploaderOpen(false)
              setSelectedBoxId(null)
              setUploadTargetPosition(null)
            }}
            onImageSelect={async (imageUrlOrFile) => {
              setIsUploaderOpen(false)
              if (typeof imageUrlOrFile === "string") {
                toast({
                  title: "URL Upload (TODO)",
                  description: "Uploading from URL is not yet implemented.",
                  variant: "default",
                })
              } else if (imageUrlOrFile instanceof File) {
                if (selectedBoxId) {
                  // Replacing an existing image
                  await handleReplaceImageInBox(selectedBoxId, imageUrlOrFile)
                } else if (uploadTargetPosition !== null) {
                  // Adding to a specific empty cell (future TODO)
                  toast({
                    title: "Add to Cell (TODO)",
                    description: "Adding to specific empty cell not yet implemented. Adding to tray instead.",
                    variant: "default",
                  })
                  await addImageToDbAndTray(imageUrlOrFile)
                } else {
                  // Adding to tray
                  await addImageToDbAndTray(imageUrlOrFile)
                }
              }
              setSelectedBoxId(null)
              setUploadTargetPosition(null)
            }}
            currentImageUrl={selectedBoxId ? boxes.find((b) => b.id === selectedBoxId)?.imageUrl || "" : ""}
            isNewImage={!selectedBoxId || uploadTargetPosition !== null}
            isMultiUpload={isMultiUpload}
            onMultiImageSelect={async (files) => {
              setIsUploaderOpen(false)
              let successCount = 0
              for (const file of files) {
                const result = await addImageToDbAndTray(file)
                if (result) successCount++
              }
              if (successCount > 0) {
                toast({ title: `${successCount} images added to tray.` })
              }
              setUploadTargetPosition(null)
            }}
          />
        )}
      </div>
    </DndProvider>
  )
}
