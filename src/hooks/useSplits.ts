import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Split } from '@/types'

export function useSplits() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['splits', user?.id],
    queryFn: async (): Promise<Split[]> => {
      const { data, error } = await supabase
        .from('splits')
        .select('*, expense:expenses(id, amount, note, date, category:categories(name, icon, color))')
        .eq('expense.user_id', user!.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || []).filter(s => s.expense !== null) as unknown as Split[]
    },
    enabled: !!user,
  })
}

export function useToggleSettled() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, is_settled }: { id: string; is_settled: boolean }) => {
      const { error } = await supabase
        .from('splits')
        .update({ is_settled })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['splits'] }),
  })
}

export function useDeleteSplit() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('splits').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['splits'] }),
  })
}
