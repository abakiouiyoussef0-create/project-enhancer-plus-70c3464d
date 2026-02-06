export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      beats: {
        Row: {
          id: string
          created_at: string
          title: string
          style: string | null
          bpm: number | null
          mood: string | null
          status: 'In Progress' | 'Finished' | 'Ready to Send'
          quality_score: number | null
          notes: string | null
          is_placed: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          style?: string | null
          bpm?: number | null
          mood?: string | null
          status?: 'In Progress' | 'Finished' | 'Ready to Send'
          quality_score?: number | null
          notes?: string | null
          is_placed?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          style?: string | null
          bpm?: number | null
          mood?: string | null
          status?: 'In Progress' | 'Finished' | 'Ready to Send'
          quality_score?: number | null
          notes?: string | null
          is_placed?: boolean
        }
      }
      loops: {
        Row: {
          id: string
          created_at: string
          title: string
          style: string | null
          bpm: number | null
          source: 'Original' | 'Sampled' | null
          royalty_status: 'Free' | 'Copyrights' | null
          status: 'In Progress' | 'Finished' | 'Ready to Send'
          quality_score: number | null
          notes: string | null
          is_placed: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          style?: string | null
          bpm?: number | null
          source?: 'Original' | 'Sampled' | null
          royalty_status?: 'Free' | 'Copyrights' | null
          status?: 'In Progress' | 'Finished' | 'Ready to Send'
          quality_score?: number | null
          notes?: string | null
          is_placed?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          style?: string | null
          bpm?: number | null
          source?: 'Original' | 'Sampled' | null
          royalty_status?: 'Free' | 'Copyrights' | null
          status?: 'In Progress' | 'Finished' | 'Ready to Send'
          quality_score?: number | null
          notes?: string | null
          is_placed?: boolean
        }
      }
      planning: {
        Row: {
          id: string
          day: string
          task_name: string
          focus: 'Beats' | 'Loops' | 'Mixing' | null
          style_focus: string | null
          planned_time: number | null
          is_completed: boolean
        }
        Insert: {
          id?: string
          day: string
          task_name: string
          focus?: 'Beats' | 'Loops' | 'Mixing' | null
          style_focus?: string | null
          planned_time?: number | null
          is_completed?: boolean
        }
        Update: {
          id?: string
          day?: string
          task_name?: string
          focus?: 'Beats' | 'Loops' | 'Mixing' | null
          style_focus?: string | null
          planned_time?: number | null
          is_completed?: boolean
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Beat = Database['public']['Tables']['beats']['Row']
export type BeatInsert = Database['public']['Tables']['beats']['Insert']
export type BeatUpdate = Database['public']['Tables']['beats']['Update']

export type Loop = Database['public']['Tables']['loops']['Row']
export type LoopInsert = Database['public']['Tables']['loops']['Insert']
export type LoopUpdate = Database['public']['Tables']['loops']['Update']

export type Planning = Database['public']['Tables']['planning']['Row']
export type PlanningInsert = Database['public']['Tables']['planning']['Insert']
export type PlanningUpdate = Database['public']['Tables']['planning']['Update']

export type Status = 'In Progress' | 'Finished' | 'Ready to Send'
export type Source = 'Original' | 'Sampled'
export type RoyaltyStatus = 'Free' | 'Copyrights'
export type Focus = 'Beats' | 'Loops' | 'Mixing'
