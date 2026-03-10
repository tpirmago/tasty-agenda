import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getShoppingList,
  generateShoppingList,
  toggleShoppingItem,
  clearCompleted,
} from './shoppingService'
import { groupByCategory } from '@/utils/ingredients'
import type { DayOfWeek } from '@/types/planner'
import type { ShoppingItem } from '@/types/shopping'

export function useShoppingList(
  userId: string,
  weekStart: string,
  day: DayOfWeek | 'week',
  familySize: number
) {
  const queryClient = useQueryClient()
  const queryKey = ['shopping', userId, weekStart, day]

  const listQuery = useQuery({
    queryKey,
    queryFn: () => getShoppingList(userId, weekStart, day === 'week' ? undefined : day),
    enabled: !!userId,
  })

  const regenerateMutation = useMutation({
    mutationFn: () => generateShoppingList(userId, weekStart, familySize),
    onMutate: () => toast.loading('Generating shopping list...', { id: 'shop-gen' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping', userId, weekStart] })
      toast.success('Shopping list updated!', { id: 'shop-gen' })
    },
    onError: () => toast.error('Failed to generate shopping list', { id: 'shop-gen' }),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, checked }: { id: string; checked: boolean }) =>
      toggleShoppingItem(id, checked),
    onMutate: async ({ id, checked }) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<ShoppingItem[]>(queryKey)
      queryClient.setQueryData<ShoppingItem[]>(queryKey, (old) =>
        old?.map((item) => (item.id === id ? { ...item, checked } : item)) ?? []
      )
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(queryKey, ctx?.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping', userId, weekStart] })
    },
  })

  const clearMutation = useMutation({
    mutationFn: () => clearCompleted(userId, weekStart),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping', userId, weekStart] })
      toast.success('Cleared completed items')
    },
  })

  const grouped = useMemo(
    () => groupByCategory(listQuery.data ?? []),
    [listQuery.data]
  )

  const totalItems = listQuery.data?.length ?? 0
  const checkedItems = listQuery.data?.filter((i) => i.checked).length ?? 0

  return {
    grouped,
    items: listQuery.data ?? [],
    isLoading: listQuery.isLoading,
    totalItems,
    checkedItems,
    regenerateMutation,
    toggleMutation,
    clearMutation,
  }
}
