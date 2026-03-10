import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getUserRecipes, saveRecipe, deleteRecipe } from './recipeService'
import type { Recipe } from '@/types/recipe'

export function useUserRecipes(userId: string) {
  return useQuery({
    queryKey: ['recipes', userId],
    queryFn: () => getUserRecipes(userId),
    enabled: !!userId,
  })
}

export function useSaveRecipe(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (recipe: Omit<Recipe, 'id' | 'createdAt'>) => saveRecipe(recipe, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes', userId] })
      toast.success('Recipe saved!')
    },
    onError: () => toast.error('Failed to save recipe'),
  })
}

export function useDeleteRecipe(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes', userId] })
      toast.success('Recipe deleted')
    },
    onError: () => toast.error('Failed to delete recipe'),
  })
}
