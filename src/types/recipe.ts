export interface Ingredient {
  name: string
  amount: string
  unit: string
}

export interface Recipe {
  id: string
  title: string
  image: string | null
  ingredients: Ingredient[]
  instructions: string | null
  source: 'mealdb' | 'custom'
  createdBy: string | null
  createdAt: string
  category?: string
  area?: string
}

export interface MealDBMeal {
  idMeal: string
  strMeal: string
  strMealThumb: string
  strInstructions: string
  strCategory: string
  strArea: string
  [key: string]: string | null | undefined
}

export interface MealDBListItem {
  idMeal: string
  strMeal: string
  strMealThumb: string
}
