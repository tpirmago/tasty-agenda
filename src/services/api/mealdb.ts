import type { Ingredient, MealDBListItem, MealDBMeal, Recipe } from '@/types/recipe'
import type { MealType } from '@/types/planner'

const BASE = 'https://www.themealdb.com/api/json/v1/1'

export const MEAL_TYPE_CATEGORIES: Record<MealType, string[]> = {
  breakfast: ['Breakfast'],
  lunch: ['Chicken', 'Seafood', 'Vegetarian', 'Side'],
  dinner: ['Beef', 'Pasta', 'Lamb', 'Pork', 'Goat', 'Miscellaneous'],
}

function parseIngredients(meal: MealDBMeal): Ingredient[] {
  const results: Ingredient[] = []
  for (let i = 1; i <= 20; i++) {
    const name = (meal[`strIngredient${i}`] ?? '').trim()
    const measure = (meal[`strMeasure${i}`] ?? '').trim()
    if (!name) break

    const m = measure.match(/^([\d\s./½¼¾]+)\s*(.*)$/)
    const amount = m ? m[1].trim() : ''
    const unit = m ? m[2].trim() : measure

    results.push({ name, amount, unit })
  }
  return results
}

function normalizeMeal(meal: MealDBMeal): Omit<Recipe, 'id' | 'createdAt'> {
  return {
    title: meal.strMeal,
    image: meal.strMealThumb,
    ingredients: parseIngredients(meal),
    instructions: meal.strInstructions,
    source: 'mealdb',
    createdBy: null,
    category: meal.strCategory,
    area: meal.strArea,
  }
}

export async function fetchMealById(id: string): Promise<Recipe | null> {
  const res = await fetch(`${BASE}/lookup.php?i=${id}`)
  const data = await res.json() as { meals: MealDBMeal[] | null }
  if (!data.meals?.[0]) return null
  return {
    id: data.meals[0].idMeal,
    createdAt: new Date().toISOString(),
    ...normalizeMeal(data.meals[0]),
  }
}

async function fetchMealListByCategory(category: string): Promise<MealDBListItem[]> {
  const res = await fetch(`${BASE}/filter.php?c=${encodeURIComponent(category)}`)
  const data = await res.json() as { meals: MealDBListItem[] | null }
  return data.meals ?? []
}

export async function fetchMealForSlot(mealType: MealType): Promise<Recipe | null> {
  const categories = MEAL_TYPE_CATEGORIES[mealType]
  const category = categories[Math.floor(Math.random() * categories.length)]

  const list = await fetchMealListByCategory(category)
  if (!list.length) return null

  const item = list[Math.floor(Math.random() * list.length)]
  return fetchMealById(item.idMeal)
}

export async function fetchRandomMeal(): Promise<Recipe | null> {
  const res = await fetch(`${BASE}/random.php`)
  const data = await res.json() as { meals: MealDBMeal[] | null }
  if (!data.meals?.[0]) return null
  return {
    id: data.meals[0].idMeal,
    createdAt: new Date().toISOString(),
    ...normalizeMeal(data.meals[0]),
  }
}
