import { supabase } from '@/services/supabase/client'
import { aggregateIngredients } from '@/utils/ingredients'
import { getWeekPlan } from '@/features/weekly-planner/plannerService'
import type { ShoppingItem, GroceryCategory } from '@/types/shopping'
import type { DayOfWeek } from '@/types/planner'

interface DBShoppingItem {
  id: string
  user_id: string
  week_start: string
  ingredient: string
  amount: string | null
  unit: string | null
  checked: boolean
  day: string | null
  category: string
}

function toItem(r: DBShoppingItem): ShoppingItem {
  return {
    id: r.id,
    userId: r.user_id,
    weekStart: r.week_start,
    ingredient: r.ingredient,
    amount: r.amount,
    unit: r.unit,
    checked: r.checked,
    day: r.day as DayOfWeek | null,
    category: r.category as GroceryCategory,
  }
}

export async function generateShoppingList(
  userId: string,
  weekStart: string,
  familySize: number
): Promise<ShoppingItem[]> {
  const plan = await getWeekPlan(userId, weekStart)

  // Delete existing
  await supabase
    .from('shopping_list')
    .delete()
    .eq('user_id', userId)
    .eq('week_start', weekStart)

  // Aggregate per day so day-view filtering works
  const rows: object[] = []
  for (const [day, daySlots] of Object.entries(plan)) {
    const slots = Object.values(daySlots).filter(Boolean) as Parameters<typeof aggregateIngredients>[0]
    if (!slots.length) continue
    const aggregated = aggregateIngredients(slots)
    for (const item of aggregated) {
      rows.push({
        user_id: userId,
        week_start: weekStart,
        ingredient: item.ingredient,
        amount: item.amount,
        unit: item.unit,
        checked: item.checked,
        day,
        category: item.category,
      })
    }
  }

  if (!rows.length) return []

  const { data, error } = await supabase
    .from('shopping_list')
    .insert(rows)
    .select()

  if (error) throw error
  return (data as DBShoppingItem[]).map(toItem)
}

export async function getShoppingList(
  userId: string,
  weekStart: string,
  day?: DayOfWeek
): Promise<ShoppingItem[]> {
  let query = supabase
    .from('shopping_list')
    .select('*')
    .eq('user_id', userId)
    .eq('week_start', weekStart)
    .order('category')
    .order('ingredient')

  if (day) {
    query = query.eq('day', day)
  }

  const { data, error } = await query
  if (error) throw error
  return (data as DBShoppingItem[]).map(toItem)
}

export async function toggleShoppingItem(
  id: string,
  checked: boolean
): Promise<void> {
  const { error } = await supabase
    .from('shopping_list')
    .update({ checked })
    .eq('id', id)
  if (error) throw error
}

export async function clearCompleted(
  userId: string,
  weekStart: string
): Promise<void> {
  const { error } = await supabase
    .from('shopping_list')
    .delete()
    .eq('user_id', userId)
    .eq('week_start', weekStart)
    .eq('checked', true)
  if (error) throw error
}
