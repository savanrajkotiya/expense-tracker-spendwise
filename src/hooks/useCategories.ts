import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Category, CategoryFormData } from '@/types'

export function useCategories() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['categories', user?.id],
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user!.id)
        .order('is_default', { ascending: false })
        .order('name')

      if (error) throw error
      return data
    },
    enabled: !!user,
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const { error } = await supabase.from('categories').insert({
        user_id: user!.id,
        name: data.name,
        icon: data.icon,
        color: data.color,
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CategoryFormData }) => {
      const { error } = await supabase
        .from('categories')
        .update({ name: data.name, icon: data.icon, color: data.color })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}
