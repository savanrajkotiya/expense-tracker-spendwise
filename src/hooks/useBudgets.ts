import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { startOfDay, startOfWeek, startOfMonth, format, endOfDay } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Budget, BudgetFormData, BudgetPeriod } from '@/types'

export function useBudgets() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['budgets', user?.id],
    queryFn: async (): Promise<Budget[]> => {
      const { data, error } = await supabase
        .from('budgets')
        .select('*, category:categories(id, name, icon, color)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data?.map(b => ({
        ...b,
        category: Array.isArray(b.category) ? b.category[0] ?? null : b.category,
      })) as Budget[]
    },
    enabled: !!user,
  })
}

function getPeriodRange(period: BudgetPeriod) {
  const now = new Date()
  const endStr = format(endOfDay(now), 'yyyy-MM-dd')
  let startStr: string
  if (period === 'daily') startStr = format(startOfDay(now), 'yyyy-MM-dd')
  else if (period === 'weekly') startStr = format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  else startStr = format(startOfMonth(now), 'yyyy-MM-dd')
  return { startStr, endStr }
}

export function useBudgetSpending(budgets: Budget[] | undefined) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['budgets', 'spending', user?.id, budgets?.map(b => b.id)],
    queryFn: async (): Promise<Record<string, number>> => {
      if (!budgets?.length) return {}

      const spending: Record<string, number> = {}
      for (const budget of budgets) {
        const { startStr, endStr } = getPeriodRange(budget.period as BudgetPeriod)

        let q = supabase
          .from('expenses')
          .select('amount')
          .eq('user_id', user!.id)
          .gte('date', startStr)
          .lte('date', endStr)

        if (budget.category_id) q = q.eq('category_id', budget.category_id)

        const { data } = await q
        spending[budget.id] = (data || []).reduce((sum, r) => sum + Number(r.amount), 0)
      }
      return spending
    },
    enabled: !!user && !!budgets?.length,
  })
}

export function useCreateBudget() {
  const qc = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (data: BudgetFormData) => {
      const { error } = await supabase.from('budgets').insert({
        user_id: user!.id,
        category_id: data.category_id || null,
        amount_limit: data.amount_limit,
        period: data.period,
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] }),
  })
}

export function useUpdateBudget() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: BudgetFormData }) => {
      const { error } = await supabase
        .from('budgets')
        .update({
          category_id: data.category_id || null,
          amount_limit: data.amount_limit,
          period: data.period,
        })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] }),
  })
}

export function useDeleteBudget() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('budgets').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] }),
  })
}
