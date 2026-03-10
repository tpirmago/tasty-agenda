import type { Recipe } from './recipe'

export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
export type MealType = 'breakfast' | 'lunch' | 'dinner'

export interface PlannerSlot {
  id: string
  userId: string
  weekStart: string
  day: DayOfWeek
  mealType: MealType
  recipeId: string
  portions: number
  recipe?: Recipe
}

export type WeeklyPlan = Record<DayOfWeek, Record<MealType, PlannerSlot | null>>
