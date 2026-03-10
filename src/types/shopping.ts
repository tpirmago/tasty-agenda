import type { DayOfWeek } from './planner'

export type GroceryCategory =
  | 'produce'
  | 'meat'
  | 'dairy'
  | 'pantry'
  | 'bakery'
  | 'frozen'
  | 'other'

export interface ShoppingItem {
  id: string
  userId: string
  weekStart: string
  ingredient: string
  amount: string | null
  unit: string | null
  checked: boolean
  day: DayOfWeek | null
  category: GroceryCategory
}

export type GroupedShoppingList = Partial<Record<GroceryCategory, ShoppingItem[]>>
