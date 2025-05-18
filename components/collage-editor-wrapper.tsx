"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useAutosave } from "@/hooks/use-autosave"
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes-warning"
import GridEditor, { type GridEditorHandle } from "@/grid-editor"
import {
  getCollage,
  updateCollage,
  saveBoxes,
  convertBoxesToGridFormat,
  convertGridStateToDbFormat,
  getUserTrayImages,
  convertTrayImagesToGridFormat,
  saveTrayImages,
} from "@/services/collage-service"
import type { Collage } from "@/types/database"
import { Navigation } from "@/components/layout/navigation"

interface CollageEditorWrapperProps {
  collageId: string
}

export default function CollageEditorWrapper({ collageId }: CollageEditorWrapperProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [collage, setCollage] = useState<Collage | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [isTitleEditing, setIsTitleEditing] = useState(false)
  const [gridRef, setGridRef] = useState<HTMLDivElement | null>(null)

  // Refs to access grid editor state and methods
  const gridEditorRef = useRef<GridEditorHandle>(null)

  // Load collage data
  useEffect(() => {
    async function loadCollage() {
      if (!user) return

      try {
        setIsLoading(true)
        const { collage, boxes } = await getCollage(collageId)

        if (!collage) {
          setError("Collage not found")
          return
        }

        setCollage(collage)
        setTitle(collage.title)

        // Load tray images
        const trayImages = await getUserTrayImages()

        // Set initial state in the grid editor
        if (gridEditorRef.current) {
          // Set grid state
          gridEditorRef.current.setRows(collage.rows)
          gridEditorRef.current.setColumns(collage.columns)
          gridEditorRef.current.setGridWidth(collage.width)
          gridEditorRef.current.setGridHeight(collage.height)
          gridEditorRef.current.setGridGap(collage.grid_gap)
          gridEditorRef.current.setCornerRadius(collage.corner_radius)

          // Set boxes
          const formattedBoxes = convertBoxesToGridFormat(boxes)
          gridEditorRef.current.setBoxes(formattedBoxes)

          // Set tray images
          const formattedTrayImages = convertTrayImagesToGridFormat(trayImages)
          gridEditorRef.current.setTrayImages(formattedTrayImages)
        }
      } catch (err) {
        console.error("Error loading collage:", err)
        setError("Failed to load collage")
      } finally {
        setIsLoading(false)
      }
    }

    loadCollage()
  }, [collageId, user])

  // Save function for autosave
  const saveCollage = async () => {
    if (!collage || !gridEditorRef.current) return

    try {
      // Get current state from grid editor
      const gridState = {
        rows: gridEditorRef.current.getRows(),
        columns: gridEditorRef.current.getColumns(),
        width: gridEditorRef.current.getGridWidth(),
        height: gridEditorRef.current.getGridHeight(),
        gridGap: gridEditorRef.current.getGridGap(),
        cornerRadius: gridEditorRef.current.getCornerRadius(),
        backgroundColor: "#FFFFFF", // Default value
      }

      const boxes = gridEditorRef.current.getBoxes()
      const trayImages = gridEditorRef.current.getTrayImages()

      // Update collage in database
      const collageData = convertGridStateToDbFormat(gridState)
      await updateCollage(collageId, {
        ...collageData,
        title,
      })

      // Save boxes
      await saveBoxes(collageId, boxes)

      // Save tray images
      await saveTrayImages(trayImages)

      return true
    } catch (err) {
      console.error("Error saving collage:", err)
      toast({
        title: "Error",
        description: "Failed to save collage",
        variant: "destructive",
      })
      throw err
    }
  }

  // Set up autosave
  const { isSaving, lastSaved, save, hasUnsavedChanges } = useAutosave({
    onSave: saveCollage,
    interval: 30000, // 30 seconds
    enabled: !isLoading && !error,
  })

  // Set up unsaved changes warning
  useUnsavedChangesWarning(hasUnsavedChanges)

  // Handle title change
  const handleTitleChange = async () => {
    if (!collage) return

    try {
      await updateCollage(collageId, { title })
      setIsTitleEditing(false)
      toast({
        title: "Success",
        description: "Title updated",
      })
    } catch (err) {
      console.error("Error updating title:", err)
      toast({
        title: "Error",
        description: "Failed to update title",
        variant: "destructive",
      })
    }
  }

  // Handle manual save
  const handleManualSave = async () => {
    try {
      await save()
      toast({
        title: "Success",
        description: "Collage saved successfully",
      })
    } catch (err) {
      // Error is already handled in the save function
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold text-red-500">{error}</h1>
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <Navigation
        gridRef={{ current: gridRef }}
        gridData={{
          rows: gridEditorRef.current?.getRows() || 2,
          columns: gridEditorRef.current?.getColumns() || 2,
          gridWidth: gridEditorRef.current?.getGridWidth() || 800,
          gridHeight: gridEditorRef.current?.getGridHeight() || 600,
          gridGap: gridEditorRef.current?.getGridGap() || 10,
          boxes: gridEditorRef.current?.getBoxes() || [],
        }}
        onAddImages={(files) => {
          // Pass to grid editor's handleAddImagesToTray when implemented
          if (gridEditorRef.current && gridEditorRef.current.handleAddImagesToTray) {
            gridEditorRef.current.handleAddImagesToTray(files)
          }
        }}
        emptyCount={0} // Will be calculated by the grid editor
        onSave={handleManualSave}
        collageTitle={title}
      />

      <div className="flex-1 overflow-hidden mt-16">
        <GridEditor ref={gridEditorRef} />
      </div>

      <div className="fixed bottom-4 right-4 z-50 bg-white rounded-md shadow-md p-2 text-sm text-gray-500">
        {lastSaved ? `Last saved: ${lastSaved.toLocaleTimeString()}` : "Not saved yet"}
        {isSaving && " (Saving...)"}
      </div>
    </div>
  )
}
