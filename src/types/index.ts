export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'
export type BudgetPeriod = 'daily' | 'weekly' | 'monthly'

export interface Category {
  id: string
  user_id: string
  name: string
  icon: string
  color: string
  is_default: boolean
  created_at: string
}

export interface Expense {
  id: string
  user_id: string
  amount: number
  category_id: string
  category?: Category
  note: string | null
  date: string
  is_recurring: boolean
  recurring_frequency: RecurringFrequency | null
  created_at: string
  updated_at: string
}

export interface Budget {
  id: string
  user_id: string
  category_id: string | null
  category?: Category | null
  amount_limit: number
  period: BudgetPeriod
  created_at: string
}

export interface Split {
  id: string
  expense_id: string
  expense?: Expense
  participant_name: string
  amount: number
  is_settled: boolean
  created_at: string
}

export interface ExpenseFormData {
  amount: number
  category_id: string
  note?: string
  date: string
  is_recurring: boolean
  recurring_frequency?: RecurringFrequency
  splits?: { participant_name: string; amount: number }[]
}

export interface BudgetFormData {
  category_id: string | null
  amount_limit: number
  period: BudgetPeriod
}

export interface CategoryFormData {
  name: string
  icon: string
  color: string
}

export interface DashboardSummary {
  today: number
  thisWeek: number
  thisMonth: number
  topCategory: { name: string; amount: number } | null
}

export interface SpendingByCategory {
  name: string
  value: number
  color: string
  icon: string
}

export interface DailySpending {
  date: string
  amount: number
}

export interface UserProfile {
  id: string
  email: string
  name?: string
  currency: string
  avatar_url?: string
}
