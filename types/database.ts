export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      collages: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          rows: number
          columns: number
          grid_width: number
          grid_height: number
          cell_size: number
          grid_gap: number
          corner_radius: number
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          rows?: number
          columns?: number
          grid_width?: number
          grid_height?: number
          cell_size?: number
          grid_gap?: number
          corner_radius?: number
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          rows?: number
          columns?: number
          grid_width?: number
          grid_height?: number
          cell_size?: number
          grid_gap?: number
          corner_radius?: number
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      boxes: {
        Row: {
          id: string
          collage_id: string
          position: number
          row_span: number
          col_span: number
          content: string | null
          image_url: string | null
          color: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          collage_id: string
          position: number
          row_span?: number
          col_span?: number
          content?: string | null
          image_url?: string | null
          color?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          collage_id?: string
          position?: number
          row_span?: number
          col_span?: number
          content?: string | null
          image_url?: string | null
          color?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tray_images: {
        Row: {
          id: string
          user_id: string
          url: string
          in_use: boolean
          content: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          url: string
          in_use?: boolean
          content?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          url?: string
          in_use?: boolean
          content?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Collage = Database["public"]["Tables"]["collages"]["Row"]
export type Box = Database["public"]["Tables"]["boxes"]["Row"]
export type TrayImage = Database["public"]["Tables"]["tray_images"]["Row"]
