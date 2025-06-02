"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/context/auth-context"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { uploadImage } from "@/lib/image-upload"

export interface TrayImageData {
  id: string
  url: string
  inUse: boolean
  content?: string
}

export function useTrayImages() {
  const [trayImages, setTrayImages] = useState<TrayImageData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = getSupabaseBrowserClient()

  // Load tray images from database
  const loadTrayImages = useCallback(async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from("tray_images")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      const formattedImages: TrayImageData[] = data.map((img) => ({
        id: img.id,
        url: img.url,
        inUse: img.in_use,
        content: img.content || undefined,
      }))

      setTrayImages(formattedImages)
    } catch (err: any) {
      console.error("Error loading tray images:", err)
      setError(err.message || "Failed to load tray images")
    } finally {
      setIsLoading(false)
    }
  }, [user, supabase])

  // Add image to tray
  const addImageToTray = useCallback(
    async (file: File): Promise<string | null> => {
      if (!user) {
        setError("You must be logged in to add images")
        return null
      }

      setIsLoading(true)
      setError(null)

      try {
        // Upload image to Supabase Storage
        const imageUrl = await uploadImage(file, user.id)

        // Save to database
        const { data, error } = await supabase
          .from("tray_images")
          .insert({
            user_id: user.id,
            url: imageUrl,
            in_use: false,
            content: `Image ${Date.now().toString().slice(-3)}`,
          })
          .select()
          .single()

        if (error) throw error

        // Add to local state
        const newImage: TrayImageData = {
          id: data.id,
          url: data.url,
          inUse: data.in_use,
          content: data.content || undefined,
        }

        setTrayImages((prev) => [newImage, ...prev])
        return data.id
      } catch (err: any) {
        console.error("Error adding image to tray:", err)
        setError(err.message || "Failed to add image to tray")
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [user, supabase],
  )

  // Update image usage status
  const updateImageUsage = useCallback(
    async (imageId: string, inUse: boolean) => {
      if (!user) return

      try {
        const { error } = await supabase
          .from("tray_images")
          .update({ in_use: inUse, updated_at: new Date().toISOString() })
          .eq("id", imageId)
          .eq("user_id", user.id)

        if (error) throw error

        // Update local state
        setTrayImages((prev) => prev.map((img) => (img.id === imageId ? { ...img, inUse } : img)))
      } catch (err: any) {
        console.error("Error updating image usage:", err)
        setError(err.message || "Failed to update image usage")
      }
    },
    [user, supabase],
  )

  // Remove image from tray
  const removeImageFromTray = useCallback(
    async (imageId: string) => {
      if (!user) return

      try {
        const { error } = await supabase.from("tray_images").delete().eq("id", imageId).eq("user_id", user.id)

        if (error) throw error

        // Remove from local state
        setTrayImages((prev) => prev.filter((img) => img.id !== imageId))
      } catch (err: any) {
        console.error("Error removing image from tray:", err)
        setError(err.message || "Failed to remove image from tray")
      }
    },
    [user, supabase],
  )

  // Clear all images from tray
  const clearTray = useCallback(async () => {
    if (!user) return

    try {
      const { error } = await supabase.from("tray_images").delete().eq("user_id", user.id)

      if (error) throw error

      // Clear local state
      setTrayImages([])
    } catch (err: any) {
      console.error("Error clearing tray:", err)
      setError(err.message || "Failed to clear tray")
    }
  }, [user, supabase])

  // Load tray images when user changes
  useEffect(() => {
    if (user) {
      loadTrayImages()
    } else {
      setTrayImages([])
    }
  }, [user, loadTrayImages])

  return {
    trayImages,
    isLoading,
    error,
    addImageToTray,
    updateImageUsage,
    removeImageFromTray,
    clearTray,
    loadTrayImages,
  }
}
