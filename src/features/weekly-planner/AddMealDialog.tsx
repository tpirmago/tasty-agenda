import { useState } from 'react'
import { Search, Shuffle, Plus, X } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useUserRecipes } from '@/features/recipes/useRecipes'
import { upsertSlot } from './plannerService'
import { saveRecipeWithId } from '@/features/recipes/recipeService'
import { fetchMealForSlot } from '@/services/api/mealdb'
import { AddRecipeModal } from '@/features/recipes/AddRecipeModal'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { DayOfWeek, MealType } from '@/types/planner'
import type { Recipe } from '@/types/recipe'

interface AddMealDialogProps {
  day: DayOfWeek | null
  mealType: MealType | null
  open: boolean
  onClose: () => void
  userId: string
  weekStart: string
  familySize: number
}

export function AddMealDialog({
  day,
  mealType,
  open,
  onClose,
  userId,
  weekStart,
  familySize,
}: AddMealDialogProps) {
  const [search, setSearch] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [showAddRecipe, setShowAddRecipe] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: recipes = [] } = useUserRecipes(userId)

  const filtered = recipes.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  )

  const finish = () => {
    queryClient.invalidateQueries({ queryKey: ['plan', userId, weekStart] })
    onClose()
  }

  const handleSelect = async (recipe: Recipe) => {
    if (!day || !mealType) return
    setDropdownOpen(false)
    setIsAdding(true)
    try {
      await upsertSlot(userId, weekStart, day, mealType, recipe.id, familySize)
      toast.success('Meal added!')
      finish()
    } catch {
      toast.error('Failed to add meal')
    } finally {
      setIsAdding(false)
    }
  }

  const handleRandom = async () => {
    if (!day || !mealType) return
    setIsAdding(true)
    try {
      const meal = await fetchMealForSlot(mealType)
      if (!meal) throw new Error('No meal found')
      await saveRecipeWithId(meal)
      await upsertSlot(userId, weekStart, day, mealType, meal.id, familySize)
      toast.success('Random meal added!')
      finish()
    } catch {
      toast.error('Failed to fetch random meal')
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent
          showCloseButton={false}
          className="max-w-sm p-0 border-0 shadow-none bg-transparent"
        >
          <div
            className="bg-white rounded-xl border-2 border-[#415B8F] px-6 pt-6 pb-6"
            style={{ boxShadow: '4px 4px 0 0 #415B8F' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="menu-card-title">Add Meal</h2>
              <button
                onClick={onClose}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="border-t border-dotted border-[#415B8F]/25 mb-6" />

            <div className="flex flex-col items-center gap-4">
              <Button className="w-4/5" onClick={handleRandom} disabled={isAdding}>
                <Shuffle size={15} className="mr-2" />
                {isAdding ? 'Loading...' : 'Pick a random meal'}
              </Button>

              <Button variant="outline" className="w-4/5" onClick={() => setShowAddRecipe(true)} disabled={isAdding}>
                <Plus size={15} className="mr-2" />
                Create new recipe
              </Button>

              <div className="flex items-center gap-2 text-xs text-muted-foreground w-full">
                <div className="flex-1 border-t border-border" />
                or pick from saved
                <div className="flex-1 border-t border-border" />
              </div>

              {/* Search with dropdown */}
              <div className="relative w-4/5">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
                <Input
                  placeholder="Search saved recipes..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setDropdownOpen(true) }}
                  onFocus={() => setDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
                  disabled={isAdding}
                />

                {dropdownOpen && recipes.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-border rounded-lg shadow-lg overflow-hidden">
                    <ScrollArea className="max-h-48">
                      {filtered.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4 px-3">
                          No recipes found
                        </p>
                      ) : (
                        <div className="p-1">
                          {filtered.map((recipe) => (
                            <button
                              key={recipe.id}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => handleSelect(recipe)}
                              disabled={isAdding}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-left transition-colors"
                            >
                              <div className="w-8 h-8 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                {recipe.image && (
                                  <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
                                )}
                              </div>
                              <span className="text-sm font-medium text-foreground line-clamp-1">
                                {recipe.title}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                )}

                {dropdownOpen && recipes.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-border rounded-lg shadow-lg px-3 py-4">
                    <p className="text-sm text-muted-foreground text-center">No saved recipes yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AddRecipeModal
        open={showAddRecipe}
        onClose={() => setShowAddRecipe(false)}
        userId={userId}
      />
    </>
  )
}
