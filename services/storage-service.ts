import { supabase } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"

export interface ImageUploadResult {
  url: string
  path: string
  fileName: string
  width?: number
  height?: number
  fileSize?: number
  mimeType?: string
}

// Upload an image to Supabase Storage
export async function uploadImage(file: File): Promise<ImageUploadResult> {
  // Get file extension
  const fileExt = file.name.split(".").pop()
  const fileName = `${uuidv4()}.${fileExt}`

  // Get the user ID for path organization
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("User not authenticated")
  }

  const filePath = `${user.id}/${fileName}`

  // Upload the file
  const { data, error } = await supabase.storage.from("collage-images").upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
  })

  if (error) {
    console.error("Error uploading image:", error)
    throw error
  }

  // Get the public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("collage-images").getPublicUrl(filePath)

  let metadata = {}
  try {
    // Try to get image dimensions and metadata
    metadata = await getImageMetadata(file)
  } catch (err) {
    console.warn("Could not get image metadata:", err)
  }

  return {
    url: publicUrl,
    path: filePath,
    fileName: file.name,
    ...metadata,
  }
}

// Get image metadata
async function getImageMetadata(file: File) {
  return new Promise<{
    width?: number
    height?: number
    fileSize: number
    mimeType: string
  }>((resolve) => {
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(img.src)
      resolve({
        width: img.width,
        height: img.height,
        fileSize: file.size,
        mimeType: file.type,
      })
    }

    img.onerror = () => {
      URL.revokeObjectURL(img.src)
      resolve({
        fileSize: file.size,
        mimeType: file.type,
      })
    }

    img.src = URL.createObjectURL(file)
  })
}

// Save an image to tray and Supabase
export async function uploadAndSaveToTray(file: File) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("User not authenticated")
  }

  // First upload to storage
  const uploadResult = await uploadImage(file)

  // Then save to tray_images table
  const { data, error } = await supabase
    .from("tray_images")
    .insert({
      id: uuidv4(),
      user_id: user.id,
      url: uploadResult.url,
      storage_path: uploadResult.path,
      original_filename: uploadResult.fileName,
      width: uploadResult.width,
      height: uploadResult.height,
      file_size: uploadResult.fileSize,
      mime_type: uploadResult.mimeType,
      in_use: false,
    })
    .select()
    .single()

  if (error) {
    console.error("Error saving to tray:", error)
    throw error
  }

  return data
}

// Delete image from storage
export async function deleteImage(path: string) {
  const { error } = await supabase.storage.from("collage-images").remove([path])

  if (error) {
    console.error("Error deleting image:", error)
    throw error
  }

  return true
}
