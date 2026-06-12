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
          installment_group_id: string | null
          installment_index: number
          installment_count: number
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
          installment_group_id?: string | null
          installment_index?: number
          installment_count?: number
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
          installment_group_id?: string | null
          installment_index?: number
          installment_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      category_limits: {
        Row: {
          id: string
          user_id: string
          name: string
          icon: string
          color: string
          monthly_limit: number
          is_custom: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          icon?: string
          color?: string
          monthly_limit?: number
          is_custom?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          icon?: string
          color?: string
          monthly_limit?: number
          is_custom?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      recurring_expenses: {
        Row: {
          id: string
          user_id: string
          description: string
          amount: number
          category: string
          payment_method: string
          active: boolean
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
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          description?: string
          amount?: number
          category?: string
          payment_method?: string
          active?: boolean
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
