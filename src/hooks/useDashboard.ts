import { useQuery } from '@tanstack/react-query'
import { startOfDay, startOfWeek, startOfMonth, endOfDay, format, subDays } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { DashboardSummary, SpendingByCategory, DailySpending } from '@/types'

export function useDashboardSummary() {
  const { user } = useAuth()
  const now = new Date()

  return useQuery<DashboardSummary>({
    queryKey: ['dashboard', 'summary', user?.id],
    queryFn: async () => {
      const todayStr = format(startOfDay(now), 'yyyy-MM-dd')
      const weekStr = format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd')
      const monthStr = format(startOfMonth(now), 'yyyy-MM-dd')
      const endStr = format(endOfDay(now), 'yyyy-MM-dd')

      const [todayRes, weekRes, monthRes] = await Promise.all([
        supabase.from('expenses').select('amount').eq('user_id', user!.id).gte('date', todayStr).lte('date', endStr),
        supabase.from('expenses').select('amount').eq('user_id', user!.id).gte('date', weekStr).lte('date', endStr),
        supabase.from('expenses').select('amount').eq('user_id', user!.id).gte('date', monthStr).lte('date', endStr),
      ])

      const sum = (rows: { amount: number }[] | null) =>
        (rows || []).reduce((acc, r) => acc + Number(r.amount), 0)

      return {
        today: sum(todayRes.data),
        thisWeek: sum(weekRes.data),
        thisMonth: sum(monthRes.data),
        topCategory: null,
      }
    },
    enabled: !!user,
  })
}

export function useSpendingByCategory() {
  const { user } = useAuth()
  const now = new Date()

  return useQuery<SpendingByCategory[]>({
    queryKey: ['dashboard', 'byCategory', user?.id],
    queryFn: async () => {
      const monthStr = format(startOfMonth(now), 'yyyy-MM-dd')
      const endStr = format(endOfDay(now), 'yyyy-MM-dd')

      const { data, error } = await supabase
        .from('expenses')
        .select('amount, category:categories(name, icon, color)')
        .eq('user_id', user!.id)
        .gte('date', monthStr)
        .lte('date', endStr)

      if (error) throw error

      const grouped: Record<string, SpendingByCategory> = {}
      for (const row of data || []) {
        const catRaw = row.category as unknown as { name: string; icon: string; color: string } | null
        const cat = Array.isArray(catRaw) ? catRaw[0] ?? null : catRaw
        const name = cat?.name || 'Other'
        if (!grouped[name]) {
          grouped[name] = {
            name,
            value: 0,
            color: cat?.color || '#64748b',
            icon: cat?.icon || '📌',
          }
        }
        grouped[name].value += Number(row.amount)
      }

      return Object.values(grouped).sort((a, b) => b.value - a.value)
    },
    enabled: !!user,
  })
}

export function useDailySpending(days = 14) {
  const { user } = useAuth()
  const now = new Date()

  return useQuery<DailySpending[]>({
    queryKey: ['dashboard', 'daily', user?.id, days],
    queryFn: async () => {
      const startStr = format(subDays(now, days - 1), 'yyyy-MM-dd')
      const endStr = format(now, 'yyyy-MM-dd')

      const { data, error } = await supabase
        .from('expenses')
        .select('amount, date')
        .eq('user_id', user!.id)
        .gte('date', startStr)
        .lte('date', endStr)

      if (error) throw error

      const byDate: Record<string, number> = {}
      for (let i = 0; i < days; i++) {
        const d = format(subDays(now, days - 1 - i), 'yyyy-MM-dd')
        byDate[d] = 0
      }
      for (const row of data || []) {
        byDate[row.date] = (byDate[row.date] || 0) + Number(row.amount)
      }

      return Object.entries(byDate).map(([date, amount]) => ({
        date: format(new Date(date), 'MMM dd'),
        amount,
      }))
    },
    enabled: !!user,
  })
}
