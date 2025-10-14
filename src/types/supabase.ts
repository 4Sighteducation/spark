/**
 * This file should be generated from your Supabase project using:
 * npm run db:types
 * 
 * Or manually from Supabase dashboard: Settings → API → Generate Types
 * 
 * For now, this is a placeholder to prevent TypeScript errors.
 * The actual types will match your database schema exactly.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          // ... other fields
        }
        Insert: {
          id?: string
          name: string
          slug: string
          // ... other fields
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          // ... other fields
        }
      }
      profiles: {
        Row: {
          id: string
          organization_id: string
          email: string
          first_name: string
          last_name: string
          // ... other fields
        }
        Insert: {
          id: string
          organization_id: string
          email: string
          first_name: string
          last_name: string
          // ... other fields
        }
        Update: {
          id?: string
          organization_id?: string
          email?: string
          first_name?: string
          last_name?: string
          // ... other fields
        }
      }
      // Add other tables as needed...
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role:
        | 'super_admin'
        | 'org_admin'
        | 'head_of_year'
        | 'head_of_department'
        | 'tutor'
        | 'teacher'
        | 'student'
        | 'parent'
      score_band: 'low' | 'average' | 'high' | 'very_high'
      spark_dimension: 'S' | 'P' | 'A' | 'R' | 'K'
      // ... other enums
    }
  }
}

