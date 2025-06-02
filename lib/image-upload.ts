import { getSupabaseBrowserClient } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"

// Simple image compression function
export async function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        const canvas = document.createElement("canvas")
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        ctx?.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error("Canvas to Blob conversion failed"))
            }
          },
          file.type,
          quality,
        )
      }
      img.onerror = () => {
        reject(new Error("Error loading image"))
      }
    }
    reader.onerror = () => {
      reject(new Error("Error reading file"))
    }
  })
}

export async function uploadImage(file: File, userId: string): Promise<string> {
  const supabase = getSupabaseBrowserClient()

  try {
    // Compress the image
    const compressedImage = await compressImage(file)

    // Generate a unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = `${userId}/${fileName}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage.from("collage-images").upload(filePath, compressedImage, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    })

    if (error) throw error

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("collage-images").getPublicUrl(data.path)

    return publicUrl
  } catch (error) {
    console.error("Error uploading image:", error)
    throw error
  }
}

export async function saveImageToTray(url: string, userId: string): Promise<string> {
  const supabase = getSupabaseBrowserClient()

  try {
    const { data, error } = await supabase
      .from("tray_images")
      .insert({
        user_id: userId,
        url: url,
        in_use: false,
      })
      .select()
      .single()

    if (error) throw error

    return data.id
  } catch (error) {
    console.error("Error saving image to tray:", error)
    throw error
  }
}
