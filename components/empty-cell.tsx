"use client"

import type React from "react"

import { useRef, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ItemTypes } from "@/constants"
import { useDropTarget } from "@/hooks/use-drop-target"
import { Plus } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface EmptyCellProps {
  position: number
  rowSpan?: number
  colSpan?: number
  addBox: (position: number, imageUrl?: string) => void
  moveBoxToPosition: (boxId: string, position: number) => void
  totalColumns: number
  cellWidth: number
  cellHeight: number
  scale: number
  cornerRadius: number
  isTemplatePlaceholder?: boolean
  addToTray?: (imageUrl: string) => void
}

export function EmptyCell({
  position,
  rowSpan = 1,
  colSpan = 1,
  addBox,
  moveBoxToPosition,
  totalColumns,
  cellWidth,
  cellHeight,
  scale,
  cornerRadius,
  isTemplatePlaceholder = false,
  addToTray,
}: EmptyCellProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Calculate the inverse scale for the UI elements
  const inverseScale = 1 / scale

  // Calculate grid position
  const row = Math.floor(position / totalColumns) + 1
  const col = (position % totalColumns) + 1

  // Handle drop from both box and tray image
  const handleDrop = useCallback(
    (item: any) => {
      if (item.type === ItemTypes.BOX) {
        moveBoxToPosition(item.id, position)
        toast({
          title: "Image moved",
          description: "The image has been moved to a new position",
          duration: 2000,
        })
      } else if (item.type === ItemTypes.TRAY_IMAGE) {
        addBox(position, item.url)
        toast({
          title: "Image added",
          description: "Image added to the grid from your photo tray",
          duration: 2000,
        })
      }
    },
    [position, moveBoxToPosition, addBox],
  )

  // Set up drop target
  const [{ isOver, canDrop }, drop] = useDropTarget([ItemTypes.BOX, ItemTypes.TRAY_IMAGE], handleDrop)

  // Handle file input change
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0]
        const reader = new FileReader()

        reader.onload = (event) => {
          if (event.target && typeof event.target.result === "string") {
            const imageUrl = event.target.result as string
            addBox(position, imageUrl)
          }
        }

        reader.readAsDataURL(file)
        e.target.value = "" // Reset the input
      }
    },
    [position, addBox],
  )

  // Handle click to open file picker
  const handleClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [])

  // Calculate styles for the cell
  const cellStyle = {
    gridRow: `${row} / span ${rowSpan}`,
    gridColumn: `${col} / span ${colSpan}`,
    width: "100%",
    height: "100%",
    minWidth: `${cellWidth * colSpan}px`,
    minHeight: `${cellHeight * rowSpan}px`,
    boxSizing: "border-box" as const,
    borderRadius: `${cornerRadius}px`,
    zIndex: 0, // Ensure empty cells are below template cells
  }

  return (
    <div
      ref={drop}
      style={cellStyle}
      className={cn(
        "empty-cell relative flex items-center justify-center p-2 border-2 border-dashed",
        isOver && canDrop
          ? "border-green-500 bg-green-50"
          : "border-gray-200 bg-gray-50/50 hover:border-gray-300 hover:bg-gray-100/70",
        "transition-colors duration-200 cursor-pointer",
      )}
      onClick={handleClick}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        aria-label="Upload image"
      />

      {/* Content wrapper with inverse scale */}
      <div
        className="flex flex-col items-center justify-center text-center"
        style={{
          transform: `scale(${inverseScale})`,
          transformOrigin: "center center",
        }}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 mb-2"
          style={{
            transformOrigin: "center center",
          }}
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add image</span>
        </Button>
        <p className="text-xs text-gray-500" style={{ fontSize: "0.75rem", lineHeight: "1rem" }}>
          Add Image
        </p>
      </div>

      {/* Visual indicator for drop target with inverse scale */}
      {isOver && canDrop && (
        <div className="absolute inset-0 bg-green-100 bg-opacity-50 flex items-center justify-center">
          <div
            className="bg-white p-2 rounded-full shadow-lg"
            style={{
              transform: `scale(${inverseScale})`,
              transformOrigin: "center center",
            }}
          >
            <Plus className="h-6 w-6 text-green-500" />
          </div>
        </div>
      )}
    </div>
  )
}
