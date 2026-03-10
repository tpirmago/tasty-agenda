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

export async function saveRecipe(
  recipe: Omit<Recipe, 'id' | 'createdAt'>,
  userId: string
): Promise<Recipe> {
  const { data, error } = await supabase
    .from('recipes')
    .upsert(
      {
        title: recipe.title,
        image: recipe.image,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        source: recipe.source,
        created_by: userId,
        category: recipe.category,
        area: recipe.area,
      },
      { onConflict: 'id' }
    )
    .select()
    .single()

  if (error) throw error
  return toRecipe(data as DBRecipe)
}

export async function saveRecipeWithId(recipe: Recipe): Promise<Recipe> {
  const { data, error } = await supabase
    .from('recipes')
    .upsert(
      {
        id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        source: recipe.source,
        created_by: recipe.createdBy,
        category: recipe.category,
        area: recipe.area,
      },
      { onConflict: 'id' }
    )
    .select()
    .single()

  if (error) throw error
  return toRecipe(data as DBRecipe)
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return toRecipe(data as DBRecipe)
}

export async function getUserRecipes(userId: string): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('created_by', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as DBRecipe[]).map(toRecipe)
}

export async function deleteRecipe(id: string): Promise<void> {
  const { error } = await supabase.from('recipes').delete().eq('id', id)
  if (error) throw error
}

export async function uploadRecipeImage(
  file: File,
  userId: string
): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${userId}/${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from('recipe-images')
    .upload(path, file, { upsert: true })

  if (error) throw error

  const { data } = supabase.storage.from('recipe-images').getPublicUrl(path)
  return data.publicUrl
}
