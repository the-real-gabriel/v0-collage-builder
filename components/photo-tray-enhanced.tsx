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
import { useTrayImages } from "@/hooks/use-tray-images"

interface PhotoTrayEnhancedProps {
  onAddToGrid: (imageId: string) => void
  onPlaceAll: () => void
  deleteBox: (boxId: string) => void
}

export const PhotoTrayEnhanced = memo(function PhotoTrayEnhanced({
  onAddToGrid,
  onPlaceAll,
  deleteBox,
}: PhotoTrayEnhancedProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { trayImages, isLoading, error, addImageToTray, updateImageUsage, removeImageFromTray, clearTray } =
    useTrayImages()

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
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }

    checkScroll()

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
  }, [trayImages])

  // Handle scroll buttons
  const handleScroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return

    const scrollAmount = 200
    const currentScroll = scrollContainerRef.current.scrollLeft

    scrollContainerRef.current.scrollTo({
      left: direction === "left" ? currentScroll - scrollAmount : currentScroll + scrollAmount,
      behavior: "smooth",
    })
  }

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)

      for (const file of files) {
        if (file.type.startsWith("image/")) {
          await addImageToTray(file)
        }
      }

      e.target.value = ""
      setIsExpanded(true)

      toast({
        title: "Images added to tray",
        description: `Added ${files.length} image${files.length !== 1 ? "s" : ""} to your photo tray`,
        duration: TOAST_DURATION,
      })
    }
  }

  // Handle drag events for file upload
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isExpanded) {
      setIsExpanded(true)
    }
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files)

      for (const file of files) {
        if (file.type.startsWith("image/")) {
          await addImageToTray(file)
        }
      }

      setIsExpanded(true)

      toast({
        title: "Images added to tray",
        description: `Added ${files.length} image${files.length !== 1 ? "s" : ""} to your photo tray`,
        duration: TOAST_DURATION,
      })
    }
  }

  // Handle empty area click to open file picker
  const handleEmptyAreaClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Wrapper function for onAddToGrid
  const handleAddToGrid = async (imageId: string) => {
    await updateImageUsage(imageId, true)
    onAddToGrid(imageId)
    setIsExpanded(true)
  }

  // Wrapper function for removing from tray
  const handleRemoveFromTray = async (imageId: string) => {
    await removeImageFromTray(imageId)
  }

  // Wrapper function for onPlaceAll
  const handlePlaceAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    onPlaceAll()
    setIsExpanded(true)
  }

  // Handle clear tray
  const handleClearTray = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await clearTray()
    toast({
      title: "Tray cleared",
      description: "All images have been removed from your photo tray",
      duration: TOAST_DURATION,
    })
  }

  // Count of images in use
  const inUseCount = trayImages.filter((img) => img.inUse).length
  const unusedCount = trayImages.length - inUseCount

  return (
    <div className={`photo-tray-container ${!isExpanded ? "collapsed" : ""}`}>
      {/* Tray header */}
      <div
        className="photo-tray-header cursor-pointer select-none"
        onClick={(e) => {
          e.stopPropagation()
          setIsExpanded(!isExpanded)
        }}
      >
        <div className="flex items-center">
          <div className="flex items-center mr-2">
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            <span className="ml-2 text-sm font-medium">Photo Tray</span>
          </div>
          <span className="text-xs text-gray-500">
            {trayImages.length} image{trayImages.length !== 1 ? "s" : ""}
            {inUseCount > 0 && ` (${inUseCount} in use)`}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-7"
            onClick={handlePlaceAll}
            disabled={unusedCount === 0 || isLoading}
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
            disabled={isLoading}
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
          {trayImages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClearTray} className="text-xs" disabled={isLoading}>
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Tray content */}
      <div
        ref={drop}
        className={`photo-tray-content ${!isExpanded ? "collapsed" : ""}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className={cn("photo-tray-dropzone", isOver && "bg-green-50 border-green-300 ring-2 ring-green-500")}>
          {/* Scroll buttons */}
          {trayImages.length > 0 && canScrollLeft && (
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

          {trayImages.length > 0 && canScrollRight && (
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
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-gray-500">Loading images...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          ) : trayImages.length > 0 ? (
            <div ref={scrollContainerRef} className="flex gap-3 overflow-x-auto py-2 px-4 hide-scrollbar h-full">
              {trayImages.map((image) => (
                <TrayImage
                  key={image.id}
                  image={image}
                  onAddToGrid={handleAddToGrid}
                  onRemoveFromTray={handleRemoveFromTray}
                  onDownload={(url) => {
                    const link = document.createElement("a")
                    link.href = url
                    link.download = `image-${Date.now()}.jpg`
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                  }}
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
