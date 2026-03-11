import { useState, useEffect } from 'react'
import { Search, Utensils, Pencil, Trash2 } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { PageHeading } from '@/components/ui/page-heading'
import { AddRecipeModal } from '@/features/recipes/AddRecipeModal'
import { RecipeDetailDialog } from '@/components/meal/RecipeDetailDialog'
import { useUserRecipes, useDeleteRecipe } from '@/features/recipes/useRecipes'
import { useToggleFavorite, useFavoriteIds } from '@/features/recipes/useFavorites'
import { useAuth } from '@/features/auth/useAuth'
import type { Recipe } from '@/types/recipe'

export function RecipesPage() {
  const { user, profile } = useAuth()
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') ?? '')

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) setSearch(q)
  }, [searchParams])
  const [tab, setTab] = useState<'all' | 'custom' | 'mealdb'>('all')
  const [editRecipe, setEditRecipe] = useState<Recipe | null>(null)
  const [viewRecipe, setViewRecipe] = useState<Recipe | null>(null)

  const { data: recipes = [], isLoading } = useUserRecipes(user?.id ?? '')
  const deleteMutation = useDeleteRecipe(user?.id ?? '')
  const favoriteIds = useFavoriteIds(user?.id ?? '')
  const toggleFavorite = useToggleFavorite(user?.id ?? '')

  const filtered = recipes.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase())
    const matchesTab =
      tab === 'all' ||
      (tab === 'custom' && r.source === 'custom') ||
      (tab === 'mealdb' && r.source === 'mealdb')
    return matchesSearch && matchesTab
  })

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="flex-1 px-4 lg:px-6 py-4">
        <div className="max-w-5xl mx-auto">
        {/* Page header */}
        <div className="mb-4">
          <PageHeading>Recipes</PageHeading>
        </div>

        {/* Search + tabs */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search recipes..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center rounded-md border border-input bg-muted/50 p-0.5 gap-0.5">
            {(['all', 'custom', 'mealdb'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'px-3 h-8 rounded-[5px] text-sm font-medium transition-all whitespace-nowrap',
                  tab === t
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t === 'all' ? 'All' : t === 'custom' ? 'My recipes' : 'From MealDB'}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-52 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
<h3 className="font-semibold text-foreground mb-2">
              {search ? 'No recipes found' : 'No recipes yet'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {search
                ? 'Try a different search term'
                : 'Add your first recipe or generate meals to build your collection'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onView={() => setViewRecipe(recipe)}
                onEdit={recipe.source === 'custom' ? () => setEditRecipe(recipe) : undefined}
                onDelete={
                  recipe.source === 'custom'
                    ? () => deleteMutation.mutate(recipe.id)
                    : favoriteIds.has(recipe.id)
                      ? () => toggleFavorite.mutate({ recipeId: recipe.id, isFavorited: true })
                      : undefined
                }
              />
            ))}
          </div>
        )}
        </div>
      </div>

      <AddRecipeModal
        open={!!editRecipe}
        onClose={() => setEditRecipe(null)}
        userId={user?.id ?? ''}
        initialRecipe={editRecipe ?? undefined}
      />

      <RecipeDetailDialog
        recipe={viewRecipe}
        portions={profile?.familySize ?? 2}
        open={!!viewRecipe}
        onClose={() => setViewRecipe(null)}
      />
    </div>
  )
}

function RecipeCard({
  recipe,
  onView,
  onEdit,
  onDelete,
}: {
  recipe: Recipe
  onView: () => void
  onEdit?: () => void
  onDelete?: () => void
}) {
  return (
    <Card
      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow group"
      onClick={onView}
    >
      <div className="relative h-36 bg-muted">
        {recipe.image ? (
          <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Utensils size={28} className="text-muted-foreground" />
          </div>
        )}
      </div>
      <CardContent className="p-3 relative">
        <p className="font-semibold text-sm line-clamp-2 text-foreground mb-1.5">{recipe.title}</p>
        <div className="flex gap-1.5 flex-wrap">
          {recipe.category && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{recipe.category}</Badge>
          )}
          {recipe.area && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">{recipe.area}</Badge>
          )}
          {recipe.source === 'custom' && (
            <Badge className="text-[10px] px-1.5 py-0">Custom</Badge>
          )}
        </div>

        {(onEdit || onDelete) && (
          <div
            className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            {onEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit() }}
                className="p-1.5 rounded-lg bg-background/80 hover:bg-background text-foreground shadow-sm transition-colors"
                title="Edit recipe"
              >
                <Pencil size={13} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete() }}
                className="p-1.5 rounded-lg bg-background/80 hover:bg-red-100 text-red-500 shadow-sm transition-colors"
                title="Delete recipe"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
