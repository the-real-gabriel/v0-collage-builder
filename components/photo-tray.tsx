"use client"

import type React from "react"

import { useState, useRef, useEffect, memo } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Trash2, Upload, ImageIcon } from "lucide-react"
import { ItemTypes, TOAST_DURATION } from "@/constants"
import { cn } from "@/lib/utils"
import { TrayImage } from "./tray-image"
import { useDrop } from "react-dnd"
import { toast } from "@/components/ui/use-toast"

interface PhotoTrayProps {
  images: Array<{ id: string; url: string; inUse: boolean; content?: string }>
  onAddToGrid: (imageId: string) => void
  onRemoveFromTray: (imageId: string) => void
  onClearTray: () => void
  onAddImages: (files: FileList) => void
  onPlaceAll: () => void
  deleteBox: (boxId: string) => void
}

export const PhotoTray = memo(function PhotoTray({
  images,
  onAddToGrid,
  onRemoveFromTray,
  onClearTray,
  onAddImages,
  onPlaceAll,
  deleteBox,
}: PhotoTrayProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Set up drop target for boxes
  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: ItemTypes.BOX,
      drop: (item: any) => {
        if (item.id) {
          deleteBox(item.id)
          toast({
            title: "Image moved to tray",
            description: "The image has been moved from the grid to your photo tray",
            duration: TOAST_DURATION,
          })
          // Ensure tray is expanded when an image is dropped into it
          setIsExpanded(true)
          return { handled: true }
        }
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [deleteBox],
  )

  // Check if scrolling is possible
  useEffect(() => {
    const checkScroll = () => {
      if (!scrollContainerRef.current) return

      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10) // 10px buffer
    }

    checkScroll()

    // Add event listener for scroll
    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", checkScroll)
      window.addEventListener("resize", checkScroll)
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", checkScroll)
        window.removeEventListener("resize", checkScroll)
      }
    }
  }, [images])

  // Handle scroll buttons
  const handleScroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return

    const scrollAmount = 200 // Scroll by 200px
    const currentScroll = scrollContainerRef.current.scrollLeft

    scrollContainerRef.current.scrollTo({
      left: direction === "left" ? currentScroll - scrollAmount : currentScroll + scrollAmount,
      behavior: "smooth",
    })
  }

  // Handle file upload - this is the function we're reusing
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddImages(e.target.files)
      e.target.value = ""
      // Ensure tray stays expanded when adding images
      setIsExpanded(true)
    }
  }

  // Handle download
  const handleDownload = (url: string) => {
    const link = document.createElement("a")
    link.href = url
    link.download = `image-${Date.now()}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Handle drag events for file upload
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    // Expand the tray when dragging over
    if (!isExpanded) {
      setIsExpanded(true)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onAddImages(e.dataTransfer.files)
      // Ensure tray stays expanded when dropping files
      setIsExpanded(true)
    }
  }

  // Handle empty area click to open file picker - reusing the same approach
  const handleEmptyAreaClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent event bubbling
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Wrapper function for onAddToGrid to ensure tray stays expanded
  const handleAddToGrid = (imageId: string) => {
    onAddToGrid(imageId)
    // Ensure tray stays expanded when adding an image to grid
    setIsExpanded(true)
  }

  // Wrapper function for onPlaceAll to ensure tray stays expanded
  const handlePlaceAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    onPlaceAll()
    // Ensure tray stays expanded when placing all images
    setIsExpanded(true)
  }

  // Count of images in use
  const inUseCount = images.filter((img) => img.inUse).length
  const unusedCount = images.length - inUseCount

  return (
    <div className={`photo-tray-container ${!isExpanded ? "collapsed" : ""}`}>
      {/* Tray header - always visible */}
      <div
        className="photo-tray-header cursor-pointer select-none"
        onClick={(e) => {
          e.stopPropagation()
          setIsExpanded(!isExpanded)
          console.log("Tray toggled:", !isExpanded) // Debug log
        }}
      >
        <div className="flex items-center">
          <div className="flex items-center mr-2">
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            <span className="ml-2 text-sm font-medium">Photo Tray</span>
          </div>
          <span className="text-xs text-gray-500">
            {images.length} image{images.length !== 1 ? "s" : ""}
            {inUseCount > 0 && ` (${inUseCount} in use)`}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-7"
            onClick={(e) => {
              e.stopPropagation()
              handlePlaceAll(e)
            }}
            disabled={unusedCount === 0}
          >
            Place All{unusedCount > 0 ? ` (${unusedCount})` : ""}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={(e) => {
              e.stopPropagation()
              fileInputRef.current?.click()
            }}
          >
            <Upload className="h-3.5 w-3.5 mr-1" />
            Add Images
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept="image/*"
            className="hidden"
          />
          {images.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onClearTray()
              }}
              className="text-xs"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Tray content - always rendered but with height 0 when collapsed */}
      <div
        ref={drop}
        className={`photo-tray-content ${!isExpanded ? "collapsed" : ""}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className={cn("photo-tray-dropzone", isOver && "bg-green-50 border-green-300 ring-2 ring-green-500")}>
          {/* Scroll buttons */}
          {images.length > 0 && canScrollLeft && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm shadow-sm rounded-full h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                handleScroll("left")
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}

          {images.length > 0 && canScrollRight && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm shadow-sm rounded-full h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                handleScroll("right")
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}

          {/* Image container */}
          {images.length > 0 ? (
            <div ref={scrollContainerRef} className="flex gap-3 overflow-x-auto py-2 px-4 hide-scrollbar h-full">
              {images.map((image) => (
                <TrayImage
                  key={image.id}
                  image={image}
                  onAddToGrid={handleAddToGrid} // Use the wrapper function
                  onRemoveFromTray={onRemoveFromTray}
                  onDownload={handleDownload}
                />
              ))}
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center h-full cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={handleEmptyAreaClick}
            >
              <div className="flex flex-col items-center justify-center p-4 text-center">
                <ImageIcon className="h-8 w-8 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500 mb-1">No images in your tray</p>
                <p className="text-xs text-gray-400">Click here to add images</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <style jsx global>{`
      .photo-tray-container {
        position: relative;
        border-top: 1px solid #e5e7eb;
        background-color: white;
        z-index: 10;
      }
      .photo-tray-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 1rem;
        height: 40px;
      }
      .photo-tray-content {
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
        height: 120px;
        transition: height 0.3s ease, padding 0.3s ease;
        overflow: hidden;
      }
      .photo-tray-content.collapsed {
        height: 0;
        padding: 0;
        overflow: hidden;
      }
      .photo-tray-dropzone {
        position: relative;
        height: 100%;
        border: 2px dashed #e5e7eb;
        border-radius: 0.5rem;
        margin: 0 1rem;
        transition: all 0.2s ease;
      }
    `}</style>
    </div>
  )
})

// ChevronUp and ChevronDown components
function ChevronUp(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="18 15 12 9 6 15"></polyline>
    </svg>
  )
}

function ChevronDown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  )
}
