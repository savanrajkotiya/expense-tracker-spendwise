import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Expense, ExpenseFormData } from '@/types'

interface UseExpensesOptions {
  categoryId?: string
  startDate?: string
  endDate?: string
  search?: string
  limit?: number
}

export function useExpenses(opts: UseExpensesOptions = {}) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['expenses', user?.id, opts],
    queryFn: async (): Promise<Expense[]> => {
      let q = supabase
        .from('expenses')
        .select('*, category:categories(*)')
        .eq('user_id', user!.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      if (opts.categoryId) q = q.eq('category_id', opts.categoryId)
      if (opts.startDate) q = q.gte('date', opts.startDate)
      if (opts.endDate) q = q.lte('date', opts.endDate)
      if (opts.search) q = q.ilike('note', `%${opts.search}%`)
      if (opts.limit) q = q.limit(opts.limit)

      const { data, error } = await q
      if (error) throw error
      return data
    },
    enabled: !!user,
  })
}

export function useExpense(id: string | undefined) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['expense', id],
    queryFn: async (): Promise<Expense> => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*, category:categories(*)')
        .eq('id', id!)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!user && !!id,
  })
}

export function useCreateExpense() {
  const qc = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (data: ExpenseFormData) => {
      const { data: expense, error } = await supabase
        .from('expenses')
        .insert({
          user_id: user!.id,
          amount: data.amount,
          category_id: data.category_id,
          note: data.note || null,
          date: data.date,
          is_recurring: data.is_recurring,
          recurring_frequency: data.recurring_frequency || null,
        })
        .select()
        .single()

      if (error) throw error

      if (data.splits?.length) {
        const { error: splitErr } = await supabase.from('splits').insert(
          data.splits.map(s => ({
            expense_id: expense.id,
            participant_name: s.participant_name,
            amount: s.amount,
          }))
        )
        if (splitErr) throw splitErr
      }

      return expense
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateExpense() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ExpenseFormData }) => {
      const { error } = await supabase
        .from('expenses')
        .update({
          amount: data.amount,
          category_id: data.category_id,
          note: data.note || null,
          date: data.date,
          is_recurring: data.is_recurring,
          recurring_frequency: data.recurring_frequency || null,
        })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] })
      qc.invalidateQueries({ queryKey: ['expense'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteExpense() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('expenses').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
