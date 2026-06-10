export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          name: string | null
          monthly_income: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          name?: string | null
          monthly_income?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          email?: string | null
          name?: string | null
          monthly_income?: number
          updated_at?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          description: string
          amount: number
          category: string
          payment_method: string
          date: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          description: string
          amount: number
          category: string
          payment_method: string
          date: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          description?: string
          amount?: number
          category?: string
          payment_method?: string
          date?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
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
