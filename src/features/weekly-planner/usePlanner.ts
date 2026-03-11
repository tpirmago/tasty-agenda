import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getWeekPlan,
  generateWeek,
  removeSlot,
  moveSlot,
  upsertSlot,
} from './plannerService'
import type { DayOfWeek, MealType, WeeklyPlan } from '@/types/planner'
import type { Recipe } from '@/types/recipe'

export function usePlanner(userId: string, weekStart: string, familySize: number, dietPrefs: string[] = []) {
  const queryClient = useQueryClient()
  const queryKey = ['plan', userId, weekStart]

  const planQuery = useQuery({
    queryKey,
    queryFn: () => getWeekPlan(userId, weekStart),
    enabled: !!userId,
    placeholderData: (prev) => prev,
  })

  const generateMutation = useMutation({
    mutationFn: () => generateWeek(userId, weekStart, familySize, dietPrefs),
    onMutate: () => {
      toast.loading('Generating your week...', { id: 'generate' })
    },
    onSuccess: (newPlan) => {
      queryClient.setQueryData(queryKey, newPlan)
      queryClient.invalidateQueries({ queryKey: ['shopping', userId, weekStart] })
      toast.success('Week generated!', { id: 'generate' })
    },
    onError: (err) => {
      console.error('[generateWeek] error:', err)
      toast.error('Failed to generate meals. Try again.', { id: 'generate' })
    },
  })

  const removeMutation = useMutation({
    mutationFn: removeSlot,
    onMutate: async (slotId: string) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<WeeklyPlan>(queryKey)
      queryClient.setQueryData<WeeklyPlan>(queryKey, (old) => {
        if (!old) return old
        const newPlan = structuredClone(old)
        for (const day of Object.keys(newPlan) as DayOfWeek[]) {
          for (const mt of ['breakfast', 'lunch', 'dinner'] as MealType[]) {
            if (newPlan[day][mt]?.id === slotId) {
              newPlan[day][mt] = null
            }
          }
        }
        return newPlan
      })
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(queryKey, ctx?.previous)
      toast.error('Failed to remove meal')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const moveMutation = useMutation({
    mutationFn: ({
      slotId,
      targetDay,
      targetMealType,
    }: {
      slotId: string
      targetDay: DayOfWeek
      targetMealType: MealType
    }) => {
      const plan = queryClient.getQueryData<WeeklyPlan>(queryKey)
      if (!plan) throw new Error('No plan data')
      return moveSlot(slotId, plan, targetDay, targetMealType)
    },
    onMutate: async ({ slotId, targetDay, targetMealType }) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<WeeklyPlan>(queryKey)
      // Optimistic: swap or move
      queryClient.setQueryData<WeeklyPlan>(queryKey, (old) => {
        if (!old) return old
        const plan = structuredClone(old)
        let sourceDay: DayOfWeek | null = null
        let sourceMt: MealType | null = null
        for (const day of Object.keys(plan) as DayOfWeek[]) {
          for (const mt of ['breakfast', 'lunch', 'dinner'] as MealType[]) {
            if (plan[day][mt]?.id === slotId) {
              sourceDay = day
              sourceMt = mt
              break
            }
          }
          if (sourceDay) break
        }
        if (!sourceDay || !sourceMt) return plan
        const moving = plan[sourceDay][sourceMt]
        const target = plan[targetDay][targetMealType]
        plan[targetDay][targetMealType] = moving
          ? { ...moving, day: targetDay, mealType: targetMealType }
          : null
        plan[sourceDay][sourceMt] = target
          ? { ...target, day: sourceDay, mealType: sourceMt }
          : null
        return plan
      })
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(queryKey, ctx?.previous)
      toast.error('Could not move meal. Changes reverted.')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const addMealMutation = useMutation({
    mutationFn: ({
      day,
      mealType,
      recipe,
    }: {
      day: DayOfWeek
      mealType: MealType
      recipe: Recipe
    }) => upsertSlot(userId, weekStart, day, mealType, recipe.id, familySize),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
    onError: () => toast.error('Failed to add meal'),
  })

  return {
    plan: planQuery.data,
    isLoading: planQuery.isLoading,
    isGenerating: generateMutation.isPending,
    generateMutation,
    removeMutation,
    moveMutation,
    addMealMutation,
  }
}
