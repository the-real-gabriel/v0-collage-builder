"use client"
import { getRandomColor, calculateCellDimensions } from "@/utils/grid-utils"

import type React from "react"

import { useState, useCallback, useEffect, useRef } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Box } from "@/components/box"
import { ImageUploader } from "@/image-uploader"
import { toast } from "@/components/ui/use-toast"
import { PhotoTray } from "@/components/photo-tray"
import { TOAST_DURATION } from "@/constants"

// Import the new components
import { Topbar } from "@/components/topbar"
import { Sidebar } from "@/components/sidebar"

// Add Supabase specific imports
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { Project, ProjectImage, GridConfig, BoxItem as AppBoxItem } from "@/lib/types" // Use AppBoxItem to avoid naming conflict
// Box interface
interface BoxItem {
  id: string
  content: string
  color: string
  imageUrl: string
  rowSpan: number
  colSpan: number
  position: number // Position in the grid
}

// Template placeholder interface
interface TemplatePlaceholder {
  position: number
  rowSpan: number
  colSpan: number
  templateId?: string // Optional template ID
  templateName?: string // Optional template name
}

// Auto place state interface for tracking changes
interface AutoPlaceState {
  trayCount: number
  emptyCount: number
  unusedCount: number
  lastPlacedCount: number
}

// Update the NavigationProps interface to include the onAddImages handler
interface NavigationProps {
  gridRef: React.RefObject<HTMLDivElement>
  gridData: {
    rows: number
    columns: number
    gridWidth: number
    gridHeight: number
    gridGap: number
    boxes: any[]
  }
  onAddImages: (files: FileList) => void
  emptyCount: number
}

// Interface for panning state
interface PanPosition {
  x: number
  y: number
}

// Props for the integrated GridEditor
interface GridEditorProps {
  initialProject: Project
  initialImages: ProjectImage[]
}

// Redefine BoxItem if it's different from ProjectImage or needs client-side fields
// For now, let's assume AppBoxItem from lib/types.ts is sufficient or can be adapted.

export default function GridEditorComponent({ initialProject, initialImages }: GridEditorProps) {
  const supabase = getSupabaseBrowserClient()

  // Initialize state from props
  const [project, setProject] = useState<Project>(initialProject)
  const [gridConfig, setGridConfig] = useState<GridConfig>(initialProject.grid_config)

  // Transform initialImages to include public URLs and fit BoxItem structure
  const [boxes, setBoxes] = useState<AppBoxItem[]>(
    () =>
      initialImages
        .map((img) => {
          let publicURL = ""
          if (img.storage_path) {
            const { data } = supabase.storage.from("project-files").getPublicUrl(img.storage_path)
            publicURL = data?.publicUrl || "/placeholder.svg?text=Error"
          }
          return {
            ...img,
            id: img.id, // Ensure BoxItem uses the DB id
            imageUrl: publicURL,
            // Ensure all fields required by Box component are mapped
            content: img.content || `Image ${img.id.slice(0, 5)}`,
            color: img.color || getRandomColor(), // Or a default
            rowSpan: img.row_span || 1,
            colSpan: img.col_span || 1,
            position: img.position === null || img.position === undefined ? -1 : img.position, // Handle null position (tray)
          }
        })
        .filter((box) => box.position !== -1), // Only placed images on the grid
  )

  const [trayImages, setTrayImages] = useState<AppBoxItem[]>(() =>
    initialImages.map((img) => {
      let publicURL = ""
      if (img.storage_path) {
        const { data } = supabase.storage.from("project-files").getPublicUrl(img.storage_path)
        publicURL = data?.publicUrl || "/placeholder.svg?text=Error"
      }
      return {
        ...img,
        id: img.id,
        imageUrl: publicURL,
        content: img.content || `Image ${img.id.slice(0, 5)}`,
        inUse: img.position !== null && img.position !== undefined, // Mark as inUse if placed
      }
    }),
  )

  // Most of the state from original GridEditor (rows, columns, gridWidth, etc.)
  // will now be derived from `gridConfig` or `project` state.
  const { rows, columns, width: gridWidth, height: gridHeight, gap: gridGap, cornerRadius = 0 } = gridConfig

  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null)
  const [isUploaderOpen, setIsUploaderOpen] = useState(false)
  const [isMultiUpload, setIsMultiUpload] = useState(false)
  const [uploadPosition, setUploadPosition] = useState<number | null>(null) // For adding to specific empty cell
  const [scale, setScale] = useState(1)
  const [manualZoom, setManualZoom] = useState<number | null>(null)
  // ... other UI-specific states like panPosition, isSpacePressed etc. can remain.
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 })
  const [initialPanPosition, setInitialPanPosition] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [isSpacePressed, setIsSpacePressed] = useState(false)
  const [cursorOverGrid, setCursorOverGrid] = useState(false)
  const [canPan, setCanPan] = useState(false)
  const [widthInputValue, setWidthInputValue] = useState(gridConfig.width.toString())
  const [heightInputValue, setHeightInputValue] = useState(gridConfig.height.toString())
  const [templatePlaceholders, setTemplatePlaceholders] = useState<any[]>([]) // Define type for placeholders

  const gridContainerRef = useRef<HTMLDivElement>(null)
  const gridWrapperRef = useRef<HTMLDivElement>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const lastAppliedTemplate = useRef<any | null>(null)

  const addImageToDbAndTray = async (file: File, tempUrl: string) => {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) throw new Error("User not authenticated")

    const fileName = `${crypto.randomUUID()}-${file.name}`
    const filePath = `${user.user.id}/${project.id}/images/${fileName}`

    const { error: uploadError } = await supabase.storage.from("project-files").upload(filePath, file)

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" })
      return null
    }

    const { data: newImage, error: dbError } = await supabase
      .from("project_images")
      .insert({
        project_id: project.id,
        storage_path: filePath,
        original_filename: file.name,
        file_size: file.size,
        mime_type: file.type,
        content: file.name,
        // position, row_span, col_span are null for tray images
      })
      .select()
      .single()

    if (dbError || !newImage) {
      toast({ title: "Failed to save image metadata", description: dbError?.message, variant: "destructive" })
      // TODO: Delete from storage if DB insert fails
      return null
    }

    const { data: publicUrlData } = supabase.storage.from("project-files").getPublicUrl(filePath)

    const newTrayImage: AppBoxItem = {
      ...newImage,
      id: newImage.id,
      imageUrl: publicUrlData.publicUrl,
      inUse: false, // New images start in tray
      // map other fields
      rowSpan: newImage.row_span || 1,
      colSpan: newImage.col_span || 1,
      position: -1, // Indicates it's in tray for client-side logic
    }
    setTrayImages((prev) => [...prev, newTrayImage])
    return newTrayImage
  }

  // TODO: Debounced save function for grid_config
  const saveGridConfig = useCallback(
    async (newConfig: GridConfig) => {
      setGridConfig(newConfig) // Optimistic update
      const { error } = await supabase
        .from("projects")
        .update({ grid_config: newConfig, updated_at: new Date().toISOString() })
        .eq("id", project.id)
      if (error) {
        toast({ title: "Error saving grid", description: error.message, variant: "destructive" })
        // Revert optimistic update if needed
      }
    },
    [supabase, project.id],
  )

  // TODO: Adapt all functions (addBox, deleteBox, moveBox, updateGridDimensions, etc.)
  // to interact with Supabase:
  // - Update `boxes` and `trayImages` state optimistically.
  // - Then, make calls to `project_images` table (insert, update, delete).
  // - Handle image uploads to Supabase Storage and update `storage_path`.

  // Example: Adapting deleteBox
  const deleteBox = useCallback(
    async (boxId: string) => {
      const boxToDelete = boxes.find((b) => b.id === boxId)
      if (!boxToDelete) return

      // Optimistic UI update
      setBoxes((prev) => prev.filter((b) => b.id !== boxId))
      setTrayImages((prev) => prev.map((img) => (img.id === boxId ? { ...img, inUse: false, position: null } : img)))
      if (selectedBoxId === boxId) setSelectedBoxId(null)

      // Supabase call: update position to null (moves to tray) or delete if configured
      const { error } = await supabase
        .from("project_images")
        .update({ position: null, row_span: null, col_span: null, placed_at: null })
        .eq("id", boxId)

      if (error) {
        toast({ title: "Error removing image from grid", description: error.message, variant: "destructive" })
        // Revert UI update if necessary
      } else {
        toast({ title: "Image moved to tray", duration: TOAST_DURATION })
      }
    },
    [supabase, boxes, selectedBoxId],
  )

  // Placeholder for handleAddImagesToTray which now uses addImageToDbAndTray
  const handleAddImagesToTray = useCallback(async (files: FileList) => {
    if (files.length === 0) return
    for (const file of Array.from(files)) {
      // For simplicity, not showing temp URL handling here
      await addImageToDbAndTray(file, "")
    }
    toast({ title: `${files.length} image(s) added to tray.`, duration: TOAST_DURATION })
  }, []) // Removed addImageToDbAndTray from dependencies

  // --- Keep existing useEffects for scaling, panning, keyboard shortcuts ---
  // --- They operate on client-side state, which is now derived from Supabase data ---
  // --- Ensure they use `gridConfig` fields (rows, columns, etc.) ---

  useEffect(() => {
    // Effect for fitting to view, scaling, etc.
    // This will use gridConfig.width, gridConfig.height
    // ... (similar to original grid-editor)
  }, [gridConfig.width, gridConfig.height, manualZoom, gridConfig.rows, gridConfig.columns])

  // ... (other useEffects and handlers from original grid-editor.tsx)
  // ... (They will need to be carefully reviewed and adapted)
  // ... For example, updateGridDimensions should now call saveGridConfig.

  const updateGridDimensions = useCallback(
    (newRows, newColumns, newWidth, newHeight) => {
      const newConfig = { ...gridConfig, rows: newRows, columns: newColumns, width: newWidth, height: newHeight }
      saveGridConfig(newConfig) // This updates state and saves to DB
    },
    [gridConfig, saveGridConfig],
  )

  const updateGridGap = useCallback(
    (newGap: number) => {
      saveGridConfig({ ...gridConfig, gap: newGap })
    },
    [gridConfig, saveGridConfig],
  )

  const updateCornerRadius = useCallback(
    (newRadius: number) => {
      saveGridConfig({ ...gridConfig, cornerRadius: newRadius })
    },
    [gridConfig, saveGridConfig],
  )

  // Calculate cell dimensions based on current gridConfig
  const cellDimensions = calculateCellDimensions(
    gridConfig.width,
    gridConfig.height,
    gridConfig.columns,
    gridConfig.rows,
    gridConfig.gap,
  )
  const cellWidth = cellDimensions.width
  const cellHeight = cellDimensions.height

  // The rest of the JSX structure will be similar, but props to child components
  // will come from the new state variables (project, gridConfig, boxes, trayImages).
  // Callbacks passed to children (e.g., deleteBox, addBox) will be the adapted Supabase versions.

  // This is a simplified render, the full JSX from original grid-editor needs to be here
  // and adapted to use the new state structure.
  if (!project) return <div>Loading project...</div>

  // Filter out images that are in the tray for rendering on the grid
  const gridDisplayBoxes = boxes.filter((b) => b.position !== null && b.position !== undefined && b.position !== -1)
  const emptyPositionsArray = [] // TODO: Recalculate based on gridDisplayBoxes and gridConfig

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app-container" style={{ height: "calc(100vh - 64px)", display: "flex", flexDirection: "column" }}>
        {" "}
        {/* Adjust height for header */}
        {/* Navigation needs to be part of (app)/layout.tsx or passed user session */}
        {/* <Navigation ... /> */}
        <div
          className="app-content"
          style={{ display: "grid", gridTemplateColumns: "auto 1fr", gridTemplateRows: "auto 1fr", flexGrow: 1 }}
        >
          <div className="corner"></div> {/* For Topbar/Sidebar alignment */}
          <Topbar
            columns={gridConfig.columns}
            gridWidth={gridConfig.width}
            gridHeight={gridConfig.height}
            gridGap={gridConfig.gap}
            cornerRadius={gridConfig.cornerRadius || 0}
            scale={scale} // UI scale
            manualZoom={manualZoom}
            widthInputValue={widthInputValue}
            heightInputValue={heightInputValue}
            onAddColumn={() => {
              /* TODO: Implement addColumn with Supabase */
            }}
            onRemoveColumn={() => {
              /* TODO: Implement removeColumn with Supabase */
            }}
            onWidthInputChange={setWidthInputValue}
            onHeightInputChange={setHeightInputValue}
            onWidthInputBlur={() => {
              const value = Number.parseInt(widthInputValue)
              if (!isNaN(value) && value >= 100 && value <= 8000) {
                // Example validation
                updateGridDimensions(gridConfig.rows, gridConfig.columns, value, gridConfig.height)
              } else {
                setWidthInputValue(gridConfig.width.toString())
              }
            }}
            onHeightInputBlur={() => {
              const value = Number.parseInt(heightInputValue)
              if (!isNaN(value) && value >= 100 && value <= 8000) {
                updateGridDimensions(gridConfig.rows, gridConfig.columns, gridConfig.width, value)
              } else {
                setHeightInputValue(gridConfig.height.toString())
              }
            }}
            // ... other Topbar props
            applySizePreset={() => {
              /* TODO */
            }}
            applyTemplate={() => {
              /* TODO */
            }}
            updateGridGap={updateGridGap}
            setCornerRadius={updateCornerRadius}
            onZoomIn={() => setManualZoom((prev) => Math.min((prev ?? scale) + 0.1, 2))}
            onZoomOut={() => setManualZoom((prev) => Math.max((prev ?? scale) - 0.1, 0.1))}
            onFitToView={() => {
              /* TODO */
            }}
            onResetZoom={() => setManualZoom(null)} // Resets to auto-scale
            boxesLength={gridDisplayBoxes.length}
          />
          <Sidebar
            rows={gridConfig.rows}
            onAddRow={() => {
              /* TODO: Implement addRow with Supabase */
            }}
            onRemoveRow={() => {
              /* TODO: Implement removeRow with Supabase */
            }}
          />
          <div
            ref={canvasContainerRef}
            className="canvas-container"
            style={{ overflow: "auto", position: "relative", background: "#f0f0f0", gridColumn: "2", gridRow: "2" }}
            // onMouseDown, onMouseMove etc. for panning
          >
            <div
              ref={gridWrapperRef}
              className="grid-wrapper"
              style={{ position: "absolute", left: panPosition.x, top: panPosition.y }}
            >
              <div
                className="grid-container"
                ref={gridContainerRef}
                style={{
                  display: "grid",
                  gridTemplateRows: `repeat(${gridConfig.rows}, 1fr)`,
                  gridTemplateColumns: `repeat(${gridConfig.columns}, minmax(30px, 1fr))`,
                  gap: `${gridConfig.gap}px`,
                  padding: "20px",
                  backgroundColor: "#ffffff",
                  borderRadius: `${gridConfig.cornerRadius || 0}px`,
                  width: `${gridConfig.width}px`,
                  height: `${gridConfig.height}px`,
                  transform: `scale(${manualZoom ?? scale})`,
                  transformOrigin: "0 0",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                }}
                // onClick for deselecting
              >
                {/* Render EmptyCells, TemplateCells, and Boxes */}
                {/* This logic needs to be carefully adapted from original grid-editor */}
                {gridDisplayBoxes.map((box) => (
                  <Box
                    key={box.id}
                    id={box.id}
                    index={box.position!} // Asserting position is not null for display boxes
                    content={box.content || ""}
                    color={box.color || "bg-gray-100"}
                    imageUrl={box.imageUrl}
                    rowSpan={box.row_span || 1}
                    colSpan={box.col_span || 1}
                    totalColumns={gridConfig.columns}
                    moveBox={() => {
                      /* TODO */
                    }}
                    deleteBox={deleteBox} // Use adapted deleteBox
                    expandBox={() => {
                      /* TODO */
                    }}
                    swapBoxes={() => {
                      /* TODO */
                    }}
                    onChangeImage={(id) => {
                      setSelectedBoxId(id)
                      setIsUploaderOpen(true)
                    }}
                    isSelected={selectedBoxId === box.id}
                    onSelect={setSelectedBoxId}
                    cellWidth={cellWidth}
                    cellHeight={cellHeight}
                    cornerRadius={gridConfig.cornerRadius || 0}
                    scale={manualZoom ?? scale}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        <PhotoTray
          images={trayImages.filter((img) => !img.inUse)} // Show only unused images in tray
          onAddToGrid={(imageId) => {
            /* TODO: Implement adding from tray to grid */
          }}
          onRemoveFromTray={async (imageId) => {
            // TODO: Delete from DB and storage
            setTrayImages((prev) => prev.filter((img) => img.id !== imageId))
            await supabase.from("project_images").delete().eq("id", imageId)
            // Also delete from storage
            const imgToDelete = trayImages.find((img) => img.id === imageId)
            if (imgToDelete?.storage_path) {
              await supabase.storage.from("project-files").remove([imgToDelete.storage_path])
            }
          }}
          onClearTray={async () => {
            // TODO: Delete all tray images from DB and storage
            const pathsToDelete = trayImages
              .filter((img) => !img.inUse && img.storage_path)
              .map((img) => img.storage_path)
            if (pathsToDelete.length > 0) {
              await supabase.storage.from("project-files").remove(pathsToDelete)
            }
            await supabase.from("project_images").delete().eq("project_id", project.id).is("position", null)
            setTrayImages((prev) => prev.filter((img) => img.inUse))
          }}
          onAddImages={handleAddImagesToTray} // Use adapted handler
          onPlaceAll={() => {
            /* TODO */
          }}
          deleteBox={deleteBox} // This might be confusing here, PhotoTray usually doesn't delete grid boxes
        />
        {isUploaderOpen && (
          <ImageUploader
            isOpen={isUploaderOpen}
            onClose={() => setIsUploaderOpen(false)}
            onImageSelect={async (imageUrlOrFile) => {
              // ImageUploader needs to handle File objects
              setIsUploaderOpen(false)
              if (typeof imageUrlOrFile === "string") {
                // URL input
                // TODO: Handle adding by URL (download then upload, or link directly if allowed)
              } else {
                // File input
                if (selectedBoxId) {
                  // Replacing an existing image
                  const boxToUpdate = boxes.find((b) => b.id === selectedBoxId)
                  // TODO: Delete old image from storage
                  // Upload new image, update project_images record
                } else if (uploadPosition !== null) {
                  // Adding to empty cell
                  // Upload new image, create project_images record with position
                } else {
                  // Adding to tray
                  await addImageToDbAndTray(imageUrlOrFile as File, "")
                }
              }
              setSelectedBoxId(null)
              setUploadPosition(null)
            }}
            // ... other ImageUploader props
            currentImageUrl={selectedBoxId ? boxes.find((b) => b.id === selectedBoxId)?.imageUrl || "" : ""}
            isNewImage={uploadPosition !== null || !selectedBoxId}
            isMultiUpload={isMultiUpload}
            onMultiImageSelect={async (files) => {
              // Assuming this now returns File[]
              setIsUploaderOpen(false)
              for (const file of files) {
                await addImageToDbAndTray(file, "")
              }
              toast({ title: `${files.length} images added to tray.` })
            }}
          />
        )}
      </div>
    </DndProvider>
  )
}
