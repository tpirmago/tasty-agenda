import { supabase } from '@/services/supabase/client'
import type { Recipe, Ingredient } from '@/types/recipe'

interface DBRecipe {
  id: string
  title: string
  image: string | null
  ingredients: Ingredient[]
  instructions: string | null
  source: string
  created_by: string | null
  created_at: string
  category?: string
  area?: string
}

function toRecipe(r: DBRecipe): Recipe {
  return {
    id: r.id,
    title: r.title,
    image: r.image,
    ingredients: r.ingredients,
    instructions: r.instructions,
    source: r.source as 'mealdb' | 'custom',
    createdBy: r.created_by,
    createdAt: r.created_at,
    category: r.category,
    area: r.area,
  }
}

export async function getFavoriteRecipeIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('user_favorites')
    .select('recipe_id')
    .eq('user_id', userId)
  if (error) throw error
  return (data ?? []).map((r: { recipe_id: string }) => r.recipe_id)
}

export async function getFavoriteRecipes(userId: string): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from('user_favorites')
    .select('recipes(*)')
    .eq('user_id', userId)
  if (error) throw error
  return (data as unknown as Array<{ recipes: DBRecipe | null }>)
    .map((row) => (row.recipes ? toRecipe(row.recipes) : null))
    .filter((r): r is Recipe => r !== null)
}

export async function addFavorite(userId: string, recipeId: string): Promise<void> {
  const { error } = await supabase
    .from('user_favorites')
    .insert({ user_id: userId, recipe_id: recipeId })
  if (error) throw error
}

export async function removeFavorite(userId: string, recipeId: string): Promise<void> {
  const { error } = await supabase
    .from('user_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('recipe_id', recipeId)
  if (error) throw error
}
