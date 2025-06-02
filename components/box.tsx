"use client"

import type React from "react"

import { useRef, useState, memo, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Trash2, ImageIcon, Move, Plus, MinusSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { ItemTypes } from "@/constants"
import { useDrag } from "react-dnd"
import { useDropTarget } from "@/hooks/use-drop-target"

interface BoxProps {
  id: string
  index: number
  content: string
  color: string
  imageUrl: string
  rowSpan: number
  colSpan: number
  totalColumns: number
  moveBox: (dragIndex: number, hoverIndex: number) => void
  deleteBox: (id: string) => void
  expandBox: (id: string, rowSpan: number, colSpan: number, newPosition?: number) => void
  swapBoxes: (sourceId: string, targetId: string) => void
  onChangeImage: (id: string) => void
  isSelected: boolean
  onSelect: (id: string) => void
  cellWidth: number
  cellHeight: number
  cornerRadius?: number
  scale: number
}

export const Box = memo(function Box({
  id,
  index,
  content,
  color,
  imageUrl,
  rowSpan,
  colSpan,
  totalColumns,
  moveBox,
  deleteBox,
  expandBox,
  swapBoxes,
  onChangeImage,
  isSelected,
  onSelect,
  cellWidth,
  cellHeight,
  cornerRadius = 0, // Default to 0 if not provided
  scale,
}: BoxProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)

  // Determine if this is an empty placeholder
  const isEmptyPlaceholder = !imageUrl && !imageError

  // Set up drag source
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ItemTypes.BOX,
      item: { id, index, type: ItemTypes.BOX },
      canDrag: !isResizing && !isEmptyPlaceholder,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [id, index, isResizing, isEmptyPlaceholder],
  )

  // Set up drop target for box swapping
  const [{ isOver }, drop] = useDropTarget([ItemTypes.BOX, ItemTypes.TRAY_IMAGE], (item: any) => {
    if (item.type === ItemTypes.BOX && item.id !== id) {
      swapBoxes(item.id, id)
    } else if (item.type === ItemTypes.TRAY_IMAGE) {
      onChangeImage(id)
    }
  })

  // Connect drag and drop refs
  drag(drop(ref))

  // Calculate grid position
  const row = Math.floor(index / totalColumns) + 1
  const col = (index % totalColumns) + 1

  // Handle box click for selection
  const handleBoxClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()

      // Check if we're clicking on the box itself or its content, not on controls
      const target = e.target as HTMLElement
      const isClickOnBox =
        target === ref.current ||
        target.classList.contains("box-content") ||
        target.closest(".box-content") ||
        target.parentElement === ref.current

      if (isClickOnBox) {
        if (isEmptyPlaceholder) {
          onChangeImage(id)
        } else {
          onSelect(id)
        }
      }
    },
    [id, isEmptyPlaceholder, onChangeImage, onSelect],
  )

  // Handle resize start
  const handleResizeStart = useCallback(
    (direction: string) => (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      setIsResizing(true)
      setResizeDirection(direction)

      const startX = e.clientX
      const startY = e.clientY
      const startRowSpan = rowSpan
      const startColSpan = colSpan
      const startRow = Math.floor(index / totalColumns)
      const startCol = index % totalColumns

      const handleMouseMove = (moveEvent: MouseEvent) => {
        moveEvent.preventDefault()

        // Calculate deltas in terms of cells (rounded to nearest cell)
        const deltaXCells = Math.round((moveEvent.clientX - startX) / cellWidth)
        const deltaYCells = Math.round((moveEvent.clientY - startY) / cellHeight)

        // Initialize new values
        let newRowSpan = startRowSpan
        let newColSpan = startColSpan
        let newRow = startRow
        let newCol = startCol
        let newPosition = index

        // Handle different resize directions
        if (direction.includes("n")) {
          const rowDelta = Math.min(0, deltaYCells)
          if (startRow + rowDelta >= 0) {
            newRow = startRow + rowDelta
            newRowSpan = startRowSpan - rowDelta
            newPosition = newRow * totalColumns + startCol
          }
        }

        if (direction.includes("s")) {
          const rowDelta = deltaYCells
          newRowSpan = Math.max(1, startRowSpan + rowDelta)
        }

        if (direction.includes("w")) {
          const colDelta = Math.min(0, deltaXCells)
          if (startCol + colDelta >= 0) {
            newCol = startCol + colDelta
            newColSpan = startColSpan - colDelta
            newPosition = startRow * totalColumns + newCol
          }
        }

        if (direction.includes("e")) {
          const colDelta = deltaXCells
          newColSpan = Math.max(1, startColSpan + colDelta)
        }

        // Apply the new dimensions if they've changed
        if (newRowSpan !== rowSpan || newColSpan !== colSpan || newPosition !== index) {
          expandBox(id, newRowSpan, newColSpan, newPosition)
        }
      }

      const handleMouseUp = () => {
        setIsResizing(false)
        setResizeDirection(null)
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    },
    [rowSpan, colSpan, index, totalColumns, cellWidth, cellHeight, expandBox, id],
  )

  // Handle change image
  const handleChangeImage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onSelect(id)
      onChangeImage(id)
    },
    [id, onSelect, onChangeImage],
  )

  // Handle delete
  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      deleteBox(id)
    },
    [id, deleteBox],
  )

  // Handle reset size
  const handleResetSize = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      expandBox(id, 1, 1)
    },
    [id, expandBox],
  )

  // Calculate inverse scale to maintain consistent size for UI elements
  const inverseScale = 1 / scale

  // Create a consistent border radius style object to use throughout
  const borderRadiusStyle = { borderRadius: `${cornerRadius}px` }

  // Handle image error
  const handleImageError = () => {
    setImageError(true)
  }

  // Use a placeholder or fallback for the image source
  const imageSrc = imageError ? "/placeholder.svg" : imageUrl || "/placeholder.svg"

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex items-center justify-center p-0 shadow-sm transition-all overflow-hidden box-border",
        isDragging ? "opacity-50 scale-105 shadow-md z-10" : "opacity-100",
        isHovered ? "ring-2 ring-blue-500" : "",
        isOver ? "ring-2 ring-green-500" : "",
        isResizing ? "ring-2 ring-yellow-500" : "",
        isSelected ? "ring-2 ring-blue-600 shadow-lg z-20" : "",
        isEmptyPlaceholder ? "border-2 border-dashed" : "",
        isEmptyPlaceholder && isHovered ? "border-gray-400 bg-gray-100" : "",
        isEmptyPlaceholder && !isHovered ? "border-gray-300 bg-gray-50" : "",
        imageError ? color : "",
      )}
      style={{
        gridRow: `${row} / span ${rowSpan}`,
        gridColumn: `${col} / span ${colSpan}`,
        cursor: isDragging ? "grabbing" : isSelected ? "move" : isEmptyPlaceholder ? "pointer" : "grab",
        minHeight: isEmptyPlaceholder ? Math.max(80, cellHeight) : undefined,
        width: "100%", // Ensure the box takes full width of its grid cell
        height: "100%", // Ensure the box takes full height of its grid cell
        boxSizing: "border-box", // Include padding and border in the element's dimensions
        ...borderRadiusStyle, // Apply border radius to main container
        zIndex: 2, // Ensure boxes are above template cells
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleBoxClick}
      tabIndex={0}
      aria-selected={isSelected}
    >
      {/* Content */}
      {isEmptyPlaceholder ? (
        <div
          className={cn(
            "flex flex-col items-center justify-center p-2 transition-opacity",
            isHovered ? "opacity-100" : "opacity-70",
          )}
          style={{
            transform: `scale(${inverseScale})`,
            transformOrigin: "center center",
            ...borderRadiusStyle, // Apply border radius to placeholder content
          }}
        >
          <div
            className={cn(
              "p-2 mb-1 transition-all",
              isHovered ? "bg-blue-100 text-blue-600" : "bg-white text-gray-400",
            )}
            style={{ borderRadius: "9999px" }} // Keep this circular
          >
            <Plus className="h-4 w-4" />
          </div>
          <p className="text-xs text-center font-medium">Add Image</p>
        </div>
      ) : !imageError ? (
        <div
          className="relative w-full h-full overflow-hidden image-container"
          style={{
            ...borderRadiusStyle, // Apply border radius to image container
            aspectRatio: "auto", // Let the container adapt to the grid cell
          }}
        >
          <Image
            src={imageSrc || "/placeholder.svg"}
            alt={content}
            fill
            className="object-cover w-full h-full"
            style={{
              ...borderRadiusStyle, // Apply border radius to image
              objectPosition: "center", // Center the image
            }}
            onError={handleImageError}
            sizes={`(max-width: 768px) 100vw, ${cellWidth * colSpan}px`}
            priority={index < 4}
            unoptimized={true} // Add this to prevent optimization issues with blob URLs
          />
        </div>
      ) : (
        <div className="flex items-center justify-center w-full h-full">
          <ImageIcon className="h-12 w-12 text-gray-400" />
          <span className="box-content font-medium text-gray-800 ml-2">{content}</span>
        </div>
      )}

      {/* Overlay with controls when hovered or selected */}
      {!isEmptyPlaceholder && (
        <div
          className={cn(
            "absolute inset-0 bg-black transition-opacity box-content",
            isHovered ? "bg-opacity-20" : "bg-opacity-0",
            isSelected ? "bg-opacity-30" : "bg-opacity-0",
          )}
          style={borderRadiusStyle} // Apply border radius to overlay
        >
          {/* Image caption */}
          <div
            className={cn(
              "absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-xs transition-opacity",
              isHovered || isSelected ? "opacity-100" : "opacity-0",
            )}
            style={{
              transform: `scale(${inverseScale})`,
              transformOrigin: "bottom left",
              borderRadius: `0 0 ${cornerRadius}px ${cornerRadius}px`, // Only round bottom corners
            }}
          >
            {content}
          </div>

          {/* Control overlay - visible when hovered or selected */}
          {(isHovered || isSelected) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="bg-black bg-opacity-70 p-2 flex gap-2 shadow-lg"
                style={{
                  transform: `scale(${inverseScale})`,
                  transformOrigin: "center center",
                  borderRadius: "8px", // Keep controls with consistent rounded corners
                }}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={handleChangeImage}
                  title="Change image"
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
                {(rowSpan > 1 || colSpan > 1) && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={handleResetSize}
                    title="Reset size"
                  >
                    <MinusSquare className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={handleDelete}
                  title="Delete image"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Drag indicator */}
          {isSelected && (
            <div
              className="absolute top-2 left-2 bg-blue-600 text-white p-1 shadow-md"
              style={{
                transform: `scale(${inverseScale})`,
                transformOrigin: "top left",
                borderRadius: "9999px", // Keep this circular
              }}
            >
              <Move className="h-3 w-3" />
            </div>
          )}
        </div>
      )}

      {/* Resize handles - only for non-empty boxes */}
      {!isEmptyPlaceholder && (isHovered || isResizing || isSelected) && (
        <>
          {/* Corner handles */}
          <div
            className={cn(
              "absolute top-0 left-0 w-3 h-3 bg-blue-500 cursor-nw-resize",
              resizeDirection === "nw" ? "opacity-100" : "opacity-70",
            )}
            style={{
              transform: `scale(${inverseScale})`,
              transformOrigin: "top left",
              borderRadius: "0 0 3px 0", // Only round the bottom-right corner
            }}
            onMouseDown={handleResizeStart("nw")}
          />
          <div
            className={cn(
              "absolute top-0 right-0 w-3 h-3 bg-blue-500 cursor-ne-resize",
              resizeDirection === "ne" ? "opacity-100" : "opacity-70",
            )}
            style={{
              transform: `scale(${inverseScale})`,
              transformOrigin: "top right",
              borderRadius: "0 0 0 3px", // Only round the bottom-left corner
            }}
            onMouseDown={handleResizeStart("ne")}
          />
          <div
            className={cn(
              "absolute bottom-0 left-0 w-3 h-3 bg-blue-500 cursor-sw-resize",
              resizeDirection === "sw" ? "opacity-100" : "opacity-70",
            )}
            style={{
              transform: `scale(${inverseScale})`,
              transformOrigin: "bottom left",
              borderRadius: "0 3px 0 0", // Only round the top-right corner
            }}
            onMouseDown={handleResizeStart("sw")}
          />
          <div
            className={cn(
              "absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize",
              resizeDirection === "se" ? "opacity-100" : "opacity-70",
            )}
            style={{
              transform: `scale(${inverseScale})`,
              transformOrigin: "bottom right",
              borderRadius: "3px 0 0 0", // Only round the top-left corner
            }}
            onMouseDown={handleResizeStart("se")}
          />

          {/* Edge handles */}
          <div
            className={cn(
              "absolute left-0 top-1/2 -translate-y-1/2 w-2 h-6 bg-blue-500 cursor-w-resize",
              resizeDirection === "w" ? "opacity-100" : "opacity-70",
            )}
            style={{
              transform: `scale(${inverseScale}) translateY(-50%)`,
              transformOrigin: "left center",
            }}
            onMouseDown={handleResizeStart("w")}
          />
          <div
            className={cn(
              "absolute right-0 top-1/2 -translate-y-1/2 w-2 h-6 bg-blue-500 cursor-e-resize",
              resizeDirection === "e" ? "opacity-100" : "opacity-70",
            )}
            style={{
              transform: `scale(${inverseScale}) translateY(-50%)`,
              transformOrigin: "right center",
            }}
            onMouseDown={handleResizeStart("e")}
          />
          <div
            className={cn(
              "absolute top-0 left-1/2 -translate-x-1/2 h-2 w-6 bg-blue-500 cursor-n-resize",
              resizeDirection === "n" ? "opacity-100" : "opacity-70",
            )}
            style={{
              transform: `scale(${inverseScale}) translateX(-50%)`,
              transformOrigin: "center top",
            }}
            onMouseDown={handleResizeStart("n")}
          />
          <div
            className={cn(
              "absolute bottom-0 left-1/2 -translate-x-1/2 h-2 w-6 bg-blue-500 cursor-s-resize",
              resizeDirection === "s" ? "opacity-100" : "opacity-70",
            )}
            style={{
              transform: `scale(${inverseScale}) translateX(-50%)`,
              transformOrigin: "center bottom",
            }}
            onMouseDown={handleResizeStart("s")}
          />
        </>
      )}
    </div>
  )
})
