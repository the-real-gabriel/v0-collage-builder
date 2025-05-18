import { supabase } from "@/lib/supabase"
import type { Collage, Box, TrayImage } from "@/types/database"
import { v4 as uuidv4 } from "uuid"

// Types that match the grid editor's data structure
export interface BoxItem {
  id: string
  content: string
  color: string
  imageUrl: string
  rowSpan: number
  colSpan: number
  position: number
}

export interface GridState {
  rows: number
  columns: number
  width: number
  height: number
  gridGap: number
  cornerRadius: number
  backgroundColor: string
}

// Create a new collage
export async function createCollage(title = "Untitled Collage", initialState?: Partial<GridState>) {
  const user = supabase.auth.getUser()
  if (!user) {
    throw new Error("User not authenticated")
  }

  const { data, error } = await supabase
    .from("collages")
    .insert({
      title,
      rows: initialState?.rows || 2,
      columns: initialState?.columns || 2,
      width: initialState?.width || 800,
      height: initialState?.height || 600,
      grid_gap: initialState?.gridGap || 10,
      corner_radius: initialState?.cornerRadius || 0,
      background_color: initialState?.backgroundColor || "#FFFFFF",
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating collage:", error)
    throw error
  }

  return data
}

// Get a collage by ID
export async function getCollage(id: string) {
  const { data: collage, error: collageError } = await supabase.from("collages").select("*").eq("id", id).single()

  if (collageError) {
    console.error("Error fetching collage:", collageError)
    throw collageError
  }

  const { data: boxes, error: boxesError } = await supabase.from("boxes").select("*").eq("collage_id", id)

  if (boxesError) {
    console.error("Error fetching boxes:", boxesError)
    throw boxesError
  }

  return {
    collage,
    boxes: boxes || [],
  }
}

// Get all collages for the current user
export async function getUserCollages() {
  const { data, error } = await supabase.from("collages").select("*").order("updated_at", { ascending: false })

  if (error) {
    console.error("Error fetching user collages:", error)
    throw error
  }

  return data || []
}

// Update a collage
export async function updateCollage(id: string, collageData: Partial<Collage>) {
  const { data, error } = await supabase
    .from("collages")
    .update({
      ...collageData,
      last_edited_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating collage:", error)
    throw error
  }

  return data
}

// Delete a collage
export async function deleteCollage(id: string) {
  const { error } = await supabase.from("collages").delete().eq("id", id)

  if (error) {
    console.error("Error deleting collage:", error)
    throw error
  }

  return true
}

// Save boxes for a collage
export async function saveBoxes(collageId: string, boxes: BoxItem[]) {
  // First, delete all existing boxes for this collage
  const { error: deleteError } = await supabase.from("boxes").delete().eq("collage_id", collageId)

  if (deleteError) {
    console.error("Error deleting existing boxes:", deleteError)
    throw deleteError
  }

  // Then insert the new boxes
  if (boxes.length === 0) {
    return []
  }

  const boxesToInsert = boxes.map((box) => ({
    id: box.id,
    collage_id: collageId,
    content: box.content,
    color: box.color,
    image_url: box.imageUrl,
    row_span: box.rowSpan,
    col_span: box.colSpan,
    position: box.position,
  }))

  const { data, error } = await supabase.from("boxes").insert(boxesToInsert).select()

  if (error) {
    console.error("Error inserting boxes:", error)
    throw error
  }

  return data
}

// Convert database boxes to grid editor format
export function convertBoxesToGridFormat(boxes: Box[]): BoxItem[] {
  return boxes.map((box) => ({
    id: box.id,
    content: box.content || "",
    color: box.color || "#f0f0f0",
    imageUrl: box.image_url || "",
    rowSpan: box.row_span,
    colSpan: box.col_span,
    position: box.position,
  }))
}

// Convert grid state to database format
export function convertGridStateToDbFormat(state: GridState): Partial<Collage> {
  return {
    rows: state.rows,
    columns: state.columns,
    width: state.width,
    height: state.height,
    grid_gap: state.gridGap,
    corner_radius: state.cornerRadius,
    background_color: state.backgroundColor,
  }
}

// Get user's tray images
export async function getUserTrayImages() {
  const { data, error } = await supabase.from("tray_images").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching tray images:", error)
    throw error
  }

  return data || []
}

// Convert tray images to grid editor format
export function convertTrayImagesToGridFormat(images: TrayImage[]) {
  return images.map((image) => ({
    id: image.id,
    url: image.url,
    inUse: image.in_use,
    content: image.content || undefined,
  }))
}

// Save tray images
export async function saveTrayImages(images: Array<{ id: string; url: string; inUse: boolean; content?: string }>) {
  const user = supabase.auth.getUser()
  if (!user) {
    throw new Error("User not authenticated")
  }

  // First, delete all existing tray images
  const { error: deleteError } = await supabase.from("tray_images").delete().eq("user_id", user.id)

  if (deleteError) {
    console.error("Error deleting existing tray images:", deleteError)
    throw deleteError
  }

  // Then insert the new tray images
  if (images.length === 0) {
    return []
  }

  const imagesToInsert = images.map((image) => ({
    id: image.id,
    user_id: user.id,
    url: image.url,
    content: image.content || null,
    in_use: image.inUse,
  }))

  const { data, error } = await supabase.from("tray_images").insert(imagesToInsert).select()

  if (error) {
    console.error("Error inserting tray images:", error)
    throw error
  }

  return data
}

// Upload an image to Supabase Storage
export async function uploadImage(file: File) {
  const user = supabase.auth.getUser()
  if (!user) {
    throw new Error("User not authenticated")
  }

  const fileExt = file.name.split(".").pop()
  const fileName = `${uuidv4()}.${fileExt}`
  const filePath = `${user.id}/${fileName}`

  const { data, error } = await supabase.storage.from("collage-images").upload(filePath, file)

  if (error) {
    console.error("Error uploading image:", error)
    throw error
  }

  // Get the public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("collage-images").getPublicUrl(filePath)

  return {
    url: publicUrl,
    path: filePath,
    fileName: file.name,
  }
}
