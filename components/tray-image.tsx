"use client"

import type React from "react"

import { memo } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ItemTypes } from "@/constants"
import { useDraggableItem } from "@/hooks/use-draggable-item"
import { Download, MoreVertical, Plus, Trash2 } from "lucide-react"
import Image from "next/image"

interface TrayImageProps {
  image: {
    id: string
    url: string
    inUse: boolean
    content?: string
  }
  onAddToGrid: (imageId: string) => void
  onRemoveFromTray: (imageId: string) => void
  onDownload: (url: string) => void
}

export const TrayImage = memo(function TrayImage({ image, onAddToGrid, onRemoveFromTray, onDownload }: TrayImageProps) {
  // Set up drag source
  const [{ isDragging }, drag] = useDraggableItem(
    image.id,
    ItemTypes.TRAY_IMAGE,
    {
      url: image.url,
      content: image.content,
      id: image.id,
      type: ItemTypes.TRAY_IMAGE,
    },
    !image.inUse, // Only allow dragging if not in use
  )

  // Wrapper functions to prevent event propagation
  const handleAddToGrid = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent event from bubbling up to parent elements
    onAddToGrid(image.id)
  }

  const handleRemoveFromTray = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent event from bubbling up to parent elements
    onRemoveFromTray(image.id)
  }

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent event from bubbling up to parent elements
    onDownload(image.url)
  }

  return (
    <div
      ref={drag}
      className={cn(
        "relative group flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2",
        image.inUse ? "border-blue-500" : "border-gray-200",
        isDragging ? "opacity-50 scale-95" : "opacity-100",
        "transition-all duration-200",
        !image.inUse && "cursor-grab hover:border-blue-400 hover:shadow-md",
      )}
      style={{ touchAction: "none" }}
      onClick={(e) => e.stopPropagation()} // Prevent clicks from affecting the tray's expanded state
    >
      <Image
        src={image.url || "/placeholder.svg"}
        alt={image.content || "Tray image"}
        fill
        style={{ objectFit: "cover" }}
        sizes="80px"
      />

      {/* Status indicator */}
      {image.inUse && (
        <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded-sm">In use</div>
      )}

      {/* Hover controls */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200">
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {!image.inUse && (
            <Button
              variant="secondary"
              size="icon"
              className="h-7 w-7 rounded-full bg-white text-gray-700 hover:bg-blue-500 hover:text-white"
              onClick={handleAddToGrid}
              title="Add to grid"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="h-7 w-7 rounded-full bg-white text-gray-700 hover:bg-gray-100 ml-1"
                onClick={(e) => e.stopPropagation()} // Prevent clicks from affecting the tray's expanded state
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              {!image.inUse && (
                <DropdownMenuItem onClick={handleAddToGrid}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add to grid
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleRemoveFromTray}>
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
})
