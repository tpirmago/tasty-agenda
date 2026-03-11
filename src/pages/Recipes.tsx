import { useState, useEffect } from 'react'
import { Search, Plus, Utensils } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AddRecipeModal } from '@/features/recipes/AddRecipeModal'
import { RecipeDetailDialog } from '@/components/meal/RecipeDetailDialog'
import { useUserRecipes, useDeleteRecipe } from '@/features/recipes/useRecipes'
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
  const [showAdd, setShowAdd] = useState(false)
  const [viewRecipe, setViewRecipe] = useState<Recipe | null>(null)

  const { data: recipes = [], isLoading } = useUserRecipes(user?.id ?? '')
  const deleteMutation = useDeleteRecipe(user?.id ?? '')

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
      <Header onAddRecipe={() => setShowAdd(true)} />

      <div className="flex-1 px-4 lg:px-6 py-4">
        <div className="max-w-5xl mx-auto">
        {/* Page header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-foreground">Recipes</h1>
          <Button size="sm" onClick={() => setShowAdd(true)} className="flex items-center gap-2">
            <Plus size={14} />
            Add recipe
          </Button>
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
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="custom">My recipes</TabsTrigger>
              <TabsTrigger value="mealdb">From MealDB</TabsTrigger>
            </TabsList>
          </Tabs>
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
            <div className="text-5xl mb-4">📖</div>
            <h3 className="font-semibold text-foreground mb-2">
              {search ? 'No recipes found' : 'No recipes yet'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {search
                ? 'Try a different search term'
                : 'Add your first recipe or generate meals to build your collection'}
            </p>
            {!search && (
              <Button onClick={() => setShowAdd(true)}>
                <Plus size={14} className="mr-2" />
                Add your first recipe
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onView={() => setViewRecipe(recipe)}
                onDelete={() => deleteMutation.mutate(recipe.id)}
              />
            ))}
          </div>
        )}
        </div>
      </div>

      <AddRecipeModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        userId={user?.id ?? ''}
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
  onDelete,
}: {
  recipe: Recipe
  onView: () => void
  onDelete: () => void
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
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="destructive"
            className="h-7 w-7"
            onClick={(e: React.MouseEvent) => { e.stopPropagation(); onDelete() }}
          >
            ×
          </Button>
        </div>
      </div>
      <CardContent className="p-3">
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
      </CardContent>
    </Card>
  )
}
