import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getFavoriteRecipeIds, addFavorite, removeFavorite } from './favoriteService'

export function useFavoriteIds(userId: string): Set<string> {
  const { data = [] } = useQuery({
    queryKey: ['favorites', userId],
    queryFn: () => getFavoriteRecipeIds(userId),
    enabled: !!userId,
  })
  return new Set(data)
}

export function useToggleFavorite(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ recipeId, isFavorited }: { recipeId: string; isFavorited: boolean }) =>
      isFavorited ? removeFavorite(userId, recipeId) : addFavorite(userId, recipeId),
    onSuccess: (_data, { isFavorited }) => {
      queryClient.invalidateQueries({ queryKey: ['favorites', userId] })
      queryClient.invalidateQueries({ queryKey: ['recipes', userId] })
      toast.success(isFavorited ? 'Removed from recipes' : 'Saved to recipes!')
    },
    onError: () => toast.error('Failed to update favorites'),
  })
}
