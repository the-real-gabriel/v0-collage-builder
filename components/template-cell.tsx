"use client"

import type React from "react"

import { useRef, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ItemTypes } from "@/constants"
import { useDropTarget } from "@/hooks/use-drop-target"
import { LayoutTemplateIcon as Template } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface TemplateCellProps {
  position: number
  rowSpan: number
  colSpan: number
  addBox: (position: number, imageUrl?: string) => void
  moveBoxToPosition: (boxId: string, position: number) => void
  totalColumns: number
  cellWidth: number
  cellHeight: number
  scale: number
  cornerRadius: number
  templateName: string
  addToTray?: (imageUrl: string) => void // New prop to add image to tray
}

export function TemplateCell({
  position,
  rowSpan,
  colSpan,
  addBox,
  moveBoxToPosition,
  totalColumns,
  cellWidth,
  cellHeight,
  scale,
  cornerRadius,
  templateName,
  addToTray, // New prop
}: TemplateCellProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

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
          description: "The image has been moved to the template position",
          duration: 2000,
        })
      } else if (item.type === ItemTypes.TRAY_IMAGE) {
        addBox(position, item.url)
        toast({
          title: "Template filled",
          description: "Image added to the template position",
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

            // Add the image to the tray first if the function is provided
            if (addToTray) {
              addToTray(imageUrl)
            }

            // Then add the image to the grid
            addBox(position, imageUrl)
          }
        }

        reader.readAsDataURL(file)
        e.target.value = "" // Reset the input
      }
    },
    [position, addBox, addToTray],
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
    zIndex: 1, // Ensure template cells are above empty cells but below boxes
  }

  return (
    <div
      ref={drop}
      style={cellStyle}
      className={cn(
        "template-cell relative flex items-center justify-center p-2 border-2 border-dashed",
        isOver && canDrop
          ? "border-green-500 bg-green-50"
          : "border-blue-200 bg-blue-50/50 hover:border-blue-300 hover:bg-blue-100/70",
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
        aria-label="Upload image for template"
      />

      <div className="flex flex-col items-center justify-center text-center">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full bg-blue-100 text-blue-500 hover:bg-blue-200 mb-2"
        >
          <Template className="h-4 w-4" />
          <span className="sr-only">Add image to template</span>
        </Button>
        <p className="text-xs text-blue-600 font-medium mb-1">Template Placeholder</p>
        {templateName && <p className="text-xs text-blue-400">{templateName}</p>}
      </div>

      {/* Visual indicator for drop target */}
      {isOver && canDrop && (
        <div className="absolute inset-0 bg-blue-100 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-2 rounded-full shadow-lg">
            <Template className="h-6 w-6 text-blue-500" />
          </div>
        </div>
      )}
    </div>
  )
}
