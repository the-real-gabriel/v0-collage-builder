"use client"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import type { Collage } from "@/types/database"

export type BoxData = {
  id: string
  position: number
  rowSpan: number
  colSpan: number
  content?: string
  imageUrl?: string
  color?: string
}

export type CollageData = {
  id?: string
  name: string
  description?: string
  rows: number
  columns: number
  gridWidth: number
  gridHeight: number
  cellSize: number
  gridGap: number
  cornerRadius: number
  isPublic: boolean
  boxes: BoxData[]
}

export type TrayImageData = {
  id: string
  url: string
  inUse: boolean
  content?: string
}

export function useCollageData() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = getSupabaseBrowserClient()

  const saveCollage = async (collageData: CollageData): Promise<string | null> => {
    if (!user) {
      setError("You must be logged in to save a collage")
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      // Insert or update collage
      const { data: collage, error: collageError } = await supabase
        .from("collages")
        .upsert({
          id: collageData.id,
          user_id: user.id,
          name: collageData.name,
          description: collageData.description || null,
          rows: collageData.rows,
          columns: collageData.columns,
          grid_width: collageData.gridWidth,
          grid_height: collageData.gridHeight,
          cell_size: collageData.cellSize,
          grid_gap: collageData.gridGap,
          corner_radius: collageData.cornerRadius,
          is_public: collageData.isPublic,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (collageError) throw collageError

      const collageId = collage.id

      // If updating, delete existing boxes first
      if (collageData.id) {
        const { error: deleteError } = await supabase.from("boxes").delete().eq("collage_id", collageId)

        if (deleteError) throw deleteError
      }

      // Insert boxes
      if (collageData.boxes.length > 0) {
        const { error: boxesError } = await supabase.from("boxes").insert(
          collageData.boxes.map((box) => ({
            collage_id: collageId,
            position: box.position,
            row_span: box.rowSpan,
            col_span: box.colSpan,
            content: box.content || null,
            image_url: box.imageUrl || null,
            color: box.color || null,
          })),
        )

        if (boxesError) throw boxesError
      }

      return collageId
    } catch (err: any) {
      console.error("Error saving collage:", err)
      setError(err.message || "Failed to save collage")
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const loadCollage = async (collageId: string): Promise<CollageData | null> => {
    if (!user) {
      setError("You must be logged in to load a collage")
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      // Get collage data
      const { data: collage, error: collageError } = await supabase
        .from("collages")
        .select("*")
        .eq("id", collageId)
        .single()

      if (collageError) throw collageError

      // Get boxes for this collage
      const { data: boxes, error: boxesError } = await supabase
        .from("boxes")
        .select("*")
        .eq("collage_id", collageId)
        .order("position", { ascending: true })

      if (boxesError) throw boxesError

      return {
        id: collage.id,
        name: collage.name,
        description: collage.description || undefined,
        rows: collage.rows,
        columns: collage.columns,
        gridWidth: collage.grid_width,
        gridHeight: collage.grid_height,
        cellSize: collage.cell_size,
        gridGap: collage.grid_gap,
        cornerRadius: collage.corner_radius,
        isPublic: collage.is_public,
        boxes: boxes.map((box) => ({
          id: box.id,
          position: box.position,
          rowSpan: box.row_span,
          colSpan: box.col_span,
          content: box.content || undefined,
          imageUrl: box.image_url || undefined,
          color: box.color || undefined,
        })),
      }
    } catch (err: any) {
      console.error("Error loading collage:", err)
      setError(err.message || "Failed to load collage")
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const deleteCollage = async (collageId: string): Promise<boolean> => {
    if (!user) {
      setError("You must be logged in to delete a collage")
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.from("collages").delete().eq("id", collageId)

      if (error) throw error

      return true
    } catch (err: any) {
      console.error("Error deleting collage:", err)
      setError(err.message || "Failed to delete collage")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const getUserCollages = async (): Promise<Collage[]> => {
    if (!user) {
      setError("You must be logged in to view your collages")
      return []
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from("collages")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })

      if (error) throw error

      return data || []
    } catch (err: any) {
      console.error("Error getting user collages:", err)
      setError(err.message || "Failed to get collages")
      return []
    } finally {
      setIsLoading(false)
    }
  }

  return {
    saveCollage,
    loadCollage,
    deleteCollage,
    getUserCollages,
    isLoading,
    error,
  }
}
