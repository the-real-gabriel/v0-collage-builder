"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import {
  CustomDialog,
  CustomDialogContent,
  CustomDialogHeader,
  CustomDialogTitle,
  CustomDialogFooter,
} from "@/components/custom-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, X, Check, Loader2 } from "lucide-react"
import Image from "next/image"
import { Progress } from "@/components/ui/progress"
import { uploadAndSaveToTray } from "@/services/storage-service"
import { toast } from "@/components/ui/use-toast"

interface EnhancedImageUploaderProps {
  isOpen: boolean
  onClose: () => void
  onImageSelect: (imageUrl: string) => void
  onMultiImageSelect?: (imageUrls: string[]) => void
  currentImageUrl: string
  isNewImage?: boolean
  isMultiUpload?: boolean
}

// Sample stock images
const STOCK_IMAGES = [
  "/placeholder.svg?key=dne7m",
  "/abstract-geometric-pattern-2.png",
  "/abstract-geometric-pattern-3.png",
  "/abstract-geometric-pattern-4.png",
  "/majestic-mountain-vista.png",
  "/tranquil-beach-vista.png",
  "/lush-forest-landscape.png",
  "/desert-landscape.png",
  "/vibrant-city-skyline.png",
  "/busy-city-street.png",
  "/vibrant-pasta-dish.png",
  "/portrait-photography.png",
]

export function EnhancedImageUploader({
  isOpen,
  onClose,
  onImageSelect,
  onMultiImageSelect,
  currentImageUrl,
  isNewImage = false,
  isMultiUpload = false,
}: EnhancedImageUploaderProps) {
  const [activeTab, setActiveTab] = useState("upload")
  const [urlInput, setUrlInput] = useState("")
  const [selectedStockImages, setSelectedStockImages] = useState<string[]>([])
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab("upload") // Always default to upload tab
      if (!isMultiUpload) {
        setSelectedStockImages([])
        setUploadedImages([])
      }
    }
  }, [isOpen, isMultiUpload])

  // Handle file processing from both input change and drop events
  const handleFiles = async (files: FileList) => {
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    const newImages: string[] = []
    let processed = 0
    const totalFiles = files.length

    // Process each file with Supabase upload
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        // Upload to Supabase storage
        const uploadResult = await uploadAndSaveToTray(file)

        if (uploadResult?.url) {
          newImages.push(uploadResult.url)
        }

        processed++
        setUploadProgress(Math.round((processed / totalFiles) * 100))
      } catch (error) {
        console.error("Error uploading file:", error)
        toast({
          title: "Upload error",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        })
        processed++
        setUploadProgress(Math.round((processed / totalFiles) * 100))
      }
    }

    // When all files are processed
    if (isMultiUpload) {
      // Append new images to existing ones instead of replacing
      setUploadedImages((prev) => [...prev, ...newImages])
      setIsUploading(false)
    } else if (newImages.length > 0) {
      // Auto-confirm for single uploads
      setUploadedImages([newImages[0]])
      setIsUploading(false)
      // Small delay to show the preview before auto-confirming
      setTimeout(() => {
        onImageSelect(newImages[0])
      }, 300)
    } else {
      setIsUploading(false)
    }
  }

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  // Handle form submission
  const handleSubmit = () => {
    if (isMultiUpload) {
      // Handle multi-image submission
      let imagesToSubmit: string[] = []

      if (activeTab === "upload" && uploadedImages.length > 0) {
        imagesToSubmit = uploadedImages
      } else if (activeTab === "stock" && selectedStockImages.length > 0) {
        imagesToSubmit = selectedStockImages
      }

      if (imagesToSubmit.length > 0 && onMultiImageSelect) {
        onMultiImageSelect(imagesToSubmit)
      }
    } else {
      // Handle single image submission
      if (activeTab === "upload" && uploadedImages.length > 0) {
        onImageSelect(uploadedImages[0])
      } else if (activeTab === "url" && urlInput) {
        onImageSelect(urlInput)
      } else if (activeTab === "stock" && selectedStockImages.length > 0) {
        onImageSelect(selectedStockImages[0])
      }
    }
  }

  // Handle click on stock image
  const handleStockImageClick = (imageUrl: string) => {
    if (isMultiUpload) {
      // Toggle selection for multi-upload
      setSelectedStockImages((prev) => {
        if (prev.includes(imageUrl)) {
          return prev.filter((url) => url !== imageUrl)
        } else {
          return [...prev, imageUrl]
        }
      })
    } else {
      // Single selection - auto-confirm
      onImageSelect(imageUrl)
    }
  }

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // Remove an image from the uploaded images list
  const removeUploadedImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <CustomDialog open={isOpen} onOpenChange={onClose}>
      <CustomDialogContent className="sm:max-w-[600px] dialog-content-animation">
        <CustomDialogHeader>
          <CustomDialogTitle>
            {isMultiUpload ? "Add Multiple Images" : isNewImage ? "Add New Image" : "Change Image"}
          </CustomDialogTitle>
        </CustomDialogHeader>

        <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            {!isMultiUpload && <TabsTrigger value="url">URL</TabsTrigger>}
            <TabsTrigger value="stock">Stock Images</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center ${
                isUploading
                  ? "border-blue-400 bg-blue-50"
                  : isDragging
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
              }`}
              onClick={triggerFileInput}
              onDragOver={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (!isDragging) setIsDragging(true)
              }}
              onDragEnter={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (!isDragging) setIsDragging(true)
              }}
              onDragLeave={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (isDragging) setIsDragging(false)
              }}
              onDrop={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsDragging(false)

                const files = e.dataTransfer.files
                if (files && files.length > 0) {
                  // Use the same file processing logic as the input change handler
                  handleFiles(files)
                }
              }}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                multiple={isMultiUpload}
              />
              {isUploading ? (
                <div className="space-y-4">
                  <Loader2 className="h-12 w-12 text-blue-500 mx-auto animate-spin" />
                  <p className="text-sm text-gray-500">Uploading images to your storage...</p>
                  <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
                </div>
              ) : uploadedImages.length > 0 ? (
                <div className="space-y-4">
                  {isMultiUpload ? (
                    <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto">
                      {uploadedImages.map((image, index) => (
                        <div key={index} className="relative aspect-square rounded-md overflow-hidden group">
                          <Image
                            src={image || "/placeholder.svg"}
                            alt={`Uploaded image ${index + 1}`}
                            fill
                            style={{ objectFit: "cover" }}
                            sizes="150px"
                          />
                          <button
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeUploadedImage(index)
                            }}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="relative w-full h-48 mx-auto">
                      <Image
                        src={uploadedImages[0] || "/placeholder.svg"}
                        alt="Uploaded preview"
                        fill
                        style={{ objectFit: "contain" }}
                        sizes="(max-width: 768px) 100vw, 500px"
                      />
                    </div>
                  )}
                  <p className="text-sm text-blue-500">
                    {isMultiUpload
                      ? `${uploadedImages.length} image${uploadedImages.length !== 1 ? "s" : ""} selected`
                      : "Click to change image"}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <Upload className="h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    {isDragging
                      ? "Drop images here"
                      : isMultiUpload
                        ? "Drag and drop multiple images or click to upload"
                        : "Drag and drop an image or click to upload"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</p>
                </div>
              )}
            </div>
          </TabsContent>

          {!isMultiUpload && (
            <TabsContent value="url" className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="image-url" className="text-sm font-medium">
                  Image URL
                </label>
                <Input
                  id="image-url"
                  placeholder="https://example.com/image.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && urlInput) {
                      onImageSelect(urlInput)
                    }
                  }}
                />
                <p className="text-xs text-gray-500">Press Enter to confirm URL</p>
              </div>
              {urlInput && (
                <div className="relative w-full h-48 mx-auto border rounded-md overflow-hidden">
                  <Image
                    src={urlInput || "/placeholder.svg"}
                    alt="URL preview"
                    fill
                    style={{ objectFit: "contain" }}
                    sizes="(max-width: 768px) 100vw, 500px"
                    onError={() => {
                      /* Handle error silently */
                    }}
                  />
                </div>
              )}
            </TabsContent>
          )}

          <TabsContent value="stock" className="space-y-4">
            <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto p-1">
              {STOCK_IMAGES.map((image, index) => (
                <div
                  key={index}
                  className={`relative aspect-square rounded-md overflow-hidden cursor-pointer border-2 ${
                    selectedStockImages.includes(image) ? "border-blue-500" : "border-transparent"
                  } group`}
                  onClick={() => handleStockImageClick(image)}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`Stock image ${index + 1}`}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="150px"
                  />
                  {isMultiUpload && selectedStockImages.includes(image) && (
                    <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-1">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            {isMultiUpload && (
              <p className="text-sm text-blue-500">
                {selectedStockImages.length} image{selectedStockImages.length !== 1 ? "s" : ""} selected
              </p>
            )}
          </TabsContent>
        </Tabs>

        <CustomDialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {isMultiUpload && (
            <Button
              onClick={handleSubmit}
              disabled={
                (activeTab === "upload" && uploadedImages.length === 0) ||
                (activeTab === "stock" && selectedStockImages.length === 0)
              }
            >
              {`Add ${(activeTab === "upload" ? uploadedImages.length : selectedStockImages.length) || 0} Images`}
            </Button>
          )}
        </CustomDialogFooter>
      </CustomDialogContent>
    </CustomDialog>
  )
}
