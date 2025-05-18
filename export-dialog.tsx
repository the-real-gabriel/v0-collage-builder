"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Download, ImageIcon, AlertCircle } from "lucide-react"
import {
  CustomDialog,
  CustomDialogContent,
  CustomDialogHeader,
  CustomDialogTitle,
  CustomDialogFooter,
} from "@/components/custom-dialog"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

interface ExportDialogProps {
  isOpen: boolean
  onClose: () => void
  gridRef: React.RefObject<HTMLDivElement>
  gridData: {
    rows: number
    columns: number
    gridWidth: number
    gridHeight: number
    gridGap: number
    boxes: {
      id: string
      content: string
      color: string
      imageUrl: string
      rowSpan: number
      colSpan: number
      position: number
    }[]
  }
}

export function ExportDialog({ isOpen, onClose, gridRef, gridData }: ExportDialogProps) {
  // UI State
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [exportedImage, setExportedImage] = useState<string | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)

  // DOM References
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewRef = useRef<HTMLImageElement>(null)

  // Export Settings
  const [imageFormat, setImageFormat] = useState<"png" | "jpeg">("png")
  const [imageQuality, setImageQuality] = useState(0.9)
  const [resolutionMultiplier, setResolutionMultiplier] = useState(1)
  const [includeBorder, setIncludeBorder] = useState(false)
  const [includeBackground, setIncludeBackground] = useState(false)
  const [exportPadding, setExportPadding] = useState(20)

  // Auto-generate preview when dialog opens or settings change
  useEffect(() => {
    if (isOpen && gridData.boxes.length > 0) {
      // Small delay to allow the dialog to render first
      const timeoutId = setTimeout(() => {
        generatePreview()
      }, 300)

      return () => clearTimeout(timeoutId)
    }
  }, [
    isOpen,
    gridData.boxes.length,
    imageFormat,
    imageQuality,
    resolutionMultiplier,
    includeBorder,
    includeBackground,
    exportPadding,
  ])

  // Generate preview image using direct canvas drawing
  const generatePreview = async () => {
    if (gridData.boxes.length === 0) {
      setExportError("Please add some images to your grid before exporting.")
      return
    }

    setIsExporting(true)
    setExportProgress(10)
    setExportError(null)

    try {
      console.log("Starting export process...")

      // Calculate the total width and height of the grid
      const totalWidth = (gridData.gridWidth + exportPadding * 2) * resolutionMultiplier
      const totalHeight = (gridData.gridHeight + exportPadding * 2) * resolutionMultiplier

      console.log(`Grid dimensions: ${totalWidth}x${totalHeight} (${resolutionMultiplier}x)`)

      // Create a canvas element if it doesn't exist
      if (!canvasRef.current) {
        const canvas = document.createElement("canvas")
        canvasRef.current = canvas
      }

      const canvas = canvasRef.current
      canvas.width = totalWidth
      canvas.height = totalHeight

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        throw new Error("Could not get canvas context")
      }

      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw background if enabled
      if (includeBackground) {
        ctx.fillStyle = "#f8f8f8"
        if (includeBorder) {
          // Draw rounded rectangle for background
          ctx.beginPath()
          ctx.roundRect(0, 0, totalWidth, totalHeight, 12 * resolutionMultiplier)
          ctx.fill()
        } else {
          ctx.fillRect(0, 0, totalWidth, totalHeight)
        }
      }

      setExportProgress(20)

      // Calculate cell dimensions
      const cellWidth =
        ((gridData.gridWidth - gridData.gridGap * (gridData.columns - 1)) / gridData.columns) * resolutionMultiplier
      const cellHeight =
        ((gridData.gridHeight - gridData.gridGap * (gridData.rows - 1)) / gridData.rows) * resolutionMultiplier

      console.log(`Cell dimensions: ${cellWidth}x${cellHeight}`)

      // Load all images first
      const imagePromises = gridData.boxes.map((box) => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image()
          img.crossOrigin = "anonymous"
          img.src = box.imageUrl

          img.onload = () => resolve(img)
          img.onerror = () => {
            console.warn(`Failed to load image: ${box.imageUrl}`)
            // Create a colored rectangle as fallback
            const fallbackCanvas = document.createElement("canvas")
            const fallbackCtx = fallbackCanvas.getContext("2d")
            fallbackCanvas.width = 100
            fallbackCanvas.height = 100

            if (fallbackCtx) {
              // Draw colored background
              fallbackCtx.fillStyle = box.color || "#e5e7eb"
              fallbackCtx.fillRect(0, 0, 100, 100)

              // Draw text
              fallbackCtx.fillStyle = "#4b5563"
              fallbackCtx.font = "14px sans-serif"
              fallbackCtx.textAlign = "center"
              fallbackCtx.textBaseline = "middle"
              fallbackCtx.fillText(box.content || "Image", 50, 50)

              const fallbackImg = new Image()
              fallbackImg.src = fallbackCanvas.toDataURL()
              fallbackImg.onload = () => resolve(fallbackImg)
              fallbackImg.onerror = reject
            } else {
              reject(new Error("Could not create fallback image"))
            }
          }

          // If image is already loaded
          if (img.complete) {
            resolve(img)
          }
        })
      })

      setExportProgress(40)

      // Wait for all images to load
      const images = await Promise.all(imagePromises)

      setExportProgress(60)

      // Draw each box with its image
      gridData.boxes.forEach((box, index) => {
        const row = Math.floor(box.position / gridData.columns)
        const col = box.position % gridData.columns

        // Calculate position
        const x = exportPadding * resolutionMultiplier + col * (cellWidth + gridData.gridGap * resolutionMultiplier)
        const y = exportPadding * resolutionMultiplier + row * (cellHeight + gridData.gridGap * resolutionMultiplier)

        // Calculate dimensions
        const width = cellWidth * box.colSpan + gridData.gridGap * resolutionMultiplier * (box.colSpan - 1)
        const height = cellHeight * box.rowSpan + gridData.gridGap * resolutionMultiplier * (box.rowSpan - 1)

        console.log(`Drawing box ${index} at (${x},${y}) with size ${width}x${height}`)

        // Always apply clipping to keep images within their cells
        ctx.save()
        ctx.beginPath()

        // Use rounded corners if enabled, otherwise use square corners
        if (includeBorder) {
          ctx.roundRect(x, y, width, height, 8 * resolutionMultiplier)
        } else {
          ctx.rect(x, y, width, height)
        }

        ctx.clip()

        // Get the image
        const img = images[index]

        // Always preserve aspect ratio
        // Calculate dimensions that preserve aspect ratio
        const imgRatio = img.width / img.height
        const boxRatio = width / height

        let drawWidth, drawHeight, offsetX, offsetY

        if (imgRatio > boxRatio) {
          // Image is wider than box - fit height and center horizontally
          drawHeight = height
          drawWidth = height * imgRatio
          offsetX = x + (width - drawWidth) / 2
          offsetY = y
        } else {
          // Image is taller than box - fit width and center vertically
          drawWidth = width
          drawHeight = width / imgRatio
          offsetX = x
          offsetY = y + (height - drawHeight) / 2
        }

        // Draw the image with preserved aspect ratio
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)

        // Always restore context after clipping
        ctx.restore()
      })

      setExportProgress(80)

      // Convert canvas to data URL
      let dataUrl
      if (imageFormat === "jpeg") {
        dataUrl = canvas.toDataURL("image/jpeg", imageQuality)
      } else {
        dataUrl = canvas.toDataURL("image/png")
      }

      setExportedImage(dataUrl)
      setExportProgress(100)

      // Reset progress after a delay
      setTimeout(() => {
        setExportProgress(0)
        setIsExporting(false)
      }, 500)

      console.log("Export completed successfully")
    } catch (error) {
      console.error("Export error:", error)
      setExportError(error instanceof Error ? error.message : "Failed to generate export. Please try again.")
      setIsExporting(false)
    }
  }

  // Download the exported image
  const downloadImage = () => {
    if (isExporting) return

    if (!exportedImage) {
      // Generate preview if it doesn't exist
      generatePreview()
      return
    }

    try {
      console.log("Starting download process...")

      // Create a temporary link element
      const link = document.createElement("a")
      link.href = exportedImage
      link.download = `collage-${new Date().toISOString().slice(0, 10)}${resolutionMultiplier > 1 ? `-${resolutionMultiplier}x` : ""}.${imageFormat}`

      // Append to body, click, and remove
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Image downloaded",
        description: "Your collage has been downloaded successfully",
        duration: 3000,
      })

      console.log("Download completed successfully")
    } catch (error) {
      console.error("Download error:", error)
      toast({
        title: "Download failed",
        description: "There was an error downloading your image. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  return (
    <CustomDialog open={isOpen} onOpenChange={onClose}>
      <CustomDialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto dialog-clean">
        <CustomDialogHeader>
          <CustomDialogTitle className="typography-heading">Export Collage</CustomDialogTitle>
        </CustomDialogHeader>

        <div className="space-y-5 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="image-format" className="label-clean">
                Image Format
              </Label>
              <Select
                value={imageFormat}
                onValueChange={(value: "png" | "jpeg") => {
                  setImageFormat(value as "png" | "jpeg")
                  setExportedImage(null) // Reset preview when format changes
                }}
              >
                <SelectTrigger id="image-format" className="select-slim">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG (Lossless)</SelectItem>
                  <SelectItem value="jpeg">JPEG (Smaller size)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resolution-multiplier" className="label-clean">
                Resolution
              </Label>
              <Select
                value={resolutionMultiplier.toString()}
                onValueChange={(value) => {
                  setResolutionMultiplier(Number(value))
                  setExportedImage(null) // Reset preview when resolution changes
                }}
              >
                <SelectTrigger id="resolution-multiplier" className="select-slim">
                  <SelectValue placeholder="Select resolution" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1x (Standard)</SelectItem>
                  <SelectItem value="2">2x (High Resolution)</SelectItem>
                  <SelectItem value="3">3x (Ultra HD)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {imageFormat === "jpeg" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="image-quality" className="label-clean">
                    Quality
                  </Label>
                  <span className="text-xs text-black/50">{Math.round(imageQuality * 100)}%</span>
                </div>
                <Slider
                  id="image-quality"
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={[imageQuality]}
                  onValueChange={(value) => {
                    setImageQuality(value[0])
                    setExportedImage(null) // Reset preview when quality changes
                  }}
                  className="slider-thin"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 mb-4 bg-black/[0.02] p-4 rounded-lg border border-black/[0.03]">
            <div className="flex items-center justify-between">
              <Label htmlFor="include-background" className="cursor-pointer label-clean">
                Include Background
              </Label>
              <Switch
                id="include-background"
                checked={includeBackground}
                onCheckedChange={(checked) => {
                  setIncludeBackground(checked)
                  setExportedImage(null) // Reset preview when setting changes
                }}
                className="switch-slim"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="include-border" className="cursor-pointer label-clean">
                Include Rounded Corners
              </Label>
              <Switch
                id="include-border"
                checked={includeBorder}
                onCheckedChange={(checked) => {
                  setIncludeBorder(checked)
                  setExportedImage(null) // Reset preview when setting changes
                }}
                className="switch-slim"
              />
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="export-padding" className="label-clean">
                  Padding
                </Label>
                <span className="text-xs text-black/50">{exportPadding}px</span>
              </div>
              <Slider
                id="export-padding"
                min={0}
                max={40}
                step={5}
                value={[exportPadding]}
                onValueChange={(value) => {
                  setExportPadding(value[0])
                  setExportedImage(null) // Reset preview when padding changes
                }}
                className="slider-thin"
              />
            </div>
          </div>

          {exportError && (
            <Alert variant="destructive" className="mb-4 alert-clean">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Export Error</AlertTitle>
              <AlertDescription>{exportError}</AlertDescription>
            </Alert>
          )}

          {exportProgress > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-black/50 mb-1">
                <span>Generating preview...</span>
                <span>{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} className="h-1 progress-slim" />
            </div>
          )}

          <div className="border rounded-lg overflow-hidden bg-black/[0.02] border-black/[0.03]">
            <div className="relative">
              {isExporting ? (
                <div className="flex flex-col items-center justify-center p-12 bg-black/[0.01]">
                  <div className="animate-spin rounded-full h-12 w-12 border border-black/10 border-t-black/40 mb-4"></div>
                  <p className="text-sm text-black/60">Generating preview...</p>
                </div>
              ) : exportedImage ? (
                <img
                  ref={previewRef}
                  src={exportedImage || "/placeholder.svg"}
                  alt="Exported grid"
                  className="w-full h-auto"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-12 bg-black/[0.01]">
                  <ImageIcon className="h-12 w-12 text-black/20 mb-2" />
                  <p className="text-sm text-black/60">
                    {gridData.boxes.length === 0
                      ? "Add images to your grid to generate a preview"
                      : "Preview is being generated..."}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={downloadImage}
              className="flex items-center gap-2 btn-primary"
              disabled={isExporting || gridData.boxes.length === 0}
            >
              <Download className="h-3.5 w-3.5" />
              Download Image
            </Button>
          </div>
        </div>

        <CustomDialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose} className="btn-subtle">
            Close
          </Button>
        </CustomDialogFooter>
      </CustomDialogContent>
    </CustomDialog>
  )
}
