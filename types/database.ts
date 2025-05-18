export interface Profile {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Collage {
  id: string
  user_id: string
  title: string
  description: string | null
  rows: number
  columns: number
  width: number
  height: number
  grid_gap: number
  corner_radius: number
  background_color: string
  is_public: boolean
  created_at: string
  updated_at: string
  last_edited_at: string
}

export interface Box {
  id: string
  collage_id: string
  content: string | null
  color: string | null
  image_url: string | null
  row_span: number
  col_span: number
  position: number
  created_at: string
  updated_at: string
}

export interface TrayImage {
  id: string
  user_id: string
  url: string
  content: string | null
  in_use: boolean
  storage_path: string | null
  original_filename: string | null
  width: number | null
  height: number | null
  file_size: number | null
  mime_type: string | null
  created_at: string
}
