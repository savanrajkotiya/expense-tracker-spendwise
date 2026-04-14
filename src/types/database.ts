export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          icon: string
          color: string
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          icon: string
          color: string
          is_default?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          icon?: string
          color?: string
          is_default?: boolean
        }
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          amount: number
          category_id: string
          note: string | null
          date: string
          is_recurring: boolean
          recurring_frequency: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          category_id: string
          note?: string | null
          date: string
          is_recurring?: boolean
          recurring_frequency?: string | null
        }
        Update: {
          amount?: number
          category_id?: string
          note?: string | null
          date?: string
          is_recurring?: boolean
          recurring_frequency?: string | null
          updated_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          amount_limit: number
          period: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id?: string | null
          amount_limit: number
          period: string
        }
        Update: {
          category_id?: string | null
          amount_limit?: number
          period?: string
        }
      }
      splits: {
        Row: {
          id: string
          expense_id: string
          participant_name: string
          amount: number
          is_settled: boolean
          created_at: string
        }
        Insert: {
          id?: string
          expense_id: string
          participant_name: string
          amount: number
          is_settled?: boolean
        }
        Update: {
          participant_name?: string
          amount?: number
          is_settled?: boolean
        }
      }
    }
  }
}
