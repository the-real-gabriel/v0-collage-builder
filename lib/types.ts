export interface Project {
  id: string // UUID
  user_id: string // UUID
  title: string
  description?: string | null
  grid_config: GridConfig // JSONB
  created_at: string // ISO 8601 timestamp
  updated_at: string // ISO 8601 timestamp
  is_public: boolean
}

export interface GridConfig {
  rows: number
  columns: number
  width: number
  height: number
  gap: number
  cornerRadius?: number
  // Add any other grid-specific settings you store
}

export interface ProjectImage {
  id: string // UUID
  project_id: string // UUID
  storage_path: string
  original_filename: string
  file_size?: number | null
  mime_type?: string | null
  content?: string | null // User-defined name or description
  color?: string | null // Placeholder color
  uploaded_at: string // ISO 8601 timestamp
  // Placement data
  position?: number | null
  row_span?: number | null
  col_span?: number | null
  placed_at?: string | null // ISO 8601 timestamp
}

// For the GridEditor's internal state, you might have a combined type
export interface BoxItem extends ProjectImage {
  // Existing BoxItem fields from GridEditor that might not be in ProjectImage directly
  // For example, if 'color' in BoxItem is a dynamic client-side thing vs. stored 'color'
  // Ensure this aligns with how GridEditor uses it.
  // For now, we assume ProjectImage covers most needs.
  // If GridEditor's `imageUrl` is different from `storage_path` (e.g., public URL), handle that transformation.
  imageUrl: string // This will be the public URL from Supabase Storage
}
