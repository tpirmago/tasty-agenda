import { supabase } from '@/services/supabase/client'
import { fetchMealForSlot } from '@/services/api/mealdb'
import { saveRecipeWithId } from '@/features/recipes/recipeService'
import type { DayOfWeek, MealType, PlannerSlot, WeeklyPlan } from '@/types/planner'

const DAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner']

function emptyPlan(): WeeklyPlan {
  const plan = {} as WeeklyPlan
  for (const day of DAYS) {
    plan[day] = { breakfast: null, lunch: null, dinner: null }
  }
  return plan
}

interface DBSlot {
  id: string
  user_id: string
  week_start: string
  day: string
  meal_type: string
  recipe_id: string
  portions: number
  recipes: {
    id: string
    title: string
    image: string | null
    ingredients: unknown
    instructions: string | null
    source: string
    created_by: string | null
    created_at: string
    category?: string
    area?: string
  } | null
}

export async function getWeekPlan(
  userId: string,
  weekStart: string
): Promise<WeeklyPlan> {
  const { data, error } = await supabase
    .from('weekly_plan')
    .select('*, recipes(*)')
    .eq('user_id', userId)
    .eq('week_start', weekStart)

  if (error) throw error

  const plan = emptyPlan()
  for (const row of (data ?? []) as DBSlot[]) {
    const slot: PlannerSlot = {
      id: row.id,
      userId: row.user_id,
      weekStart: row.week_start,
      day: row.day as DayOfWeek,
      mealType: row.meal_type as MealType,
      recipeId: row.recipe_id,
      portions: row.portions,
      recipe: row.recipes
        ? {
            id: row.recipes.id,
            title: row.recipes.title,
            image: row.recipes.image,
            ingredients: row.recipes.ingredients as import('@/types/recipe').Ingredient[],
            instructions: row.recipes.instructions,
            source: row.recipes.source as 'mealdb' | 'custom',
            createdBy: row.recipes.created_by,
            createdAt: row.recipes.created_at,
            category: row.recipes.category,
            area: row.recipes.area,
          }
        : undefined,
    }
    plan[row.day as DayOfWeek][row.meal_type as MealType] = slot
  }

  return plan
}

export async function upsertSlot(
  userId: string,
  weekStart: string,
  day: DayOfWeek,
  mealType: MealType,
  recipeId: string,
  portions: number
): Promise<void> {
  const { error } = await supabase.from('weekly_plan').upsert(
    {
      user_id: userId,
      week_start: weekStart,
      day,
      meal_type: mealType,
      recipe_id: recipeId,
      portions,
    },
    { onConflict: 'user_id,week_start,day,meal_type' }
  )
  if (error) throw error
}

export async function removeSlot(id: string): Promise<void> {
  const { error } = await supabase.from('weekly_plan').delete().eq('id', id)
  if (error) throw error
}

export async function moveSlot(
  slotId: string,
  currentPlan: WeeklyPlan,
  targetDay: DayOfWeek,
  targetMealType: MealType,
  userId: string,
  weekStart: string
): Promise<void> {
  const targetSlot = currentPlan[targetDay][targetMealType]

  // Find the source slot
  let sourceSlot: PlannerSlot | null = null
  for (const day of DAYS) {
    for (const mt of MEAL_TYPES) {
      if (currentPlan[day][mt]?.id === slotId) {
        sourceSlot = currentPlan[day][mt]
        break
      }
    }
    if (sourceSlot) break
  }
  if (!sourceSlot) return

  if (targetSlot) {
    // Swap: update both slots
    await Promise.all([
      supabase
        .from('weekly_plan')
        .update({ day: targetDay, meal_type: targetMealType })
        .eq('id', slotId),
      supabase
        .from('weekly_plan')
        .update({ day: sourceSlot.day, meal_type: sourceSlot.mealType })
        .eq('id', targetSlot.id),
    ])
  } else {
    // Move to empty slot
    const { error } = await supabase
      .from('weekly_plan')
      .update({ day: targetDay, meal_type: targetMealType })
      .eq('id', slotId)
    if (error) throw error
  }

  await upsertSlot(userId, weekStart, targetDay, targetMealType, sourceSlot.recipeId, sourceSlot.portions)
}

export async function generateWeek(
  userId: string,
  weekStart: string,
  familySize: number
): Promise<WeeklyPlan> {
  // Fetch all 21 meals in parallel
  const slots: { day: DayOfWeek; mealType: MealType }[] = []
  for (const day of DAYS) {
    for (const mt of MEAL_TYPES) {
      slots.push({ day, mealType: mt })
    }
  }

  const meals = await Promise.all(
    slots.map((s) => fetchMealForSlot(s.mealType))
  )

  // Save recipes and upsert plan slots
  await Promise.all(
    slots.map(async (s, i) => {
      const meal = meals[i]
      if (!meal) return

      await saveRecipeWithId(meal)
      await upsertSlot(userId, weekStart, s.day, s.mealType, meal.id, familySize)
    })
  )

  return getWeekPlan(userId, weekStart)
}
