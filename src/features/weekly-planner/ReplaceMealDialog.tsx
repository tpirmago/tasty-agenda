import { useState } from 'react'
import { Search, Shuffle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useUserRecipes } from '@/features/recipes/useRecipes'
import { upsertSlot } from './plannerService'
import { saveRecipeWithId } from '@/features/recipes/recipeService'
import { fetchRandomMeal } from '@/services/api/mealdb'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { PlannerSlot } from '@/types/planner'
import type { Recipe } from '@/types/recipe'

interface ReplaceMealDialogProps {
  slot: PlannerSlot | null
  open: boolean
  onClose: () => void
  userId: string
  weekStart: string
  familySize: number
  onReplaced: () => void
}

export function ReplaceMealDialog({
  slot,
  open,
  onClose,
  userId,
  weekStart,
  familySize,
  onReplaced,
}: ReplaceMealDialogProps) {
  const [search, setSearch] = useState('')
  const [isReplacing, setIsReplacing] = useState(false)
  const queryClient = useQueryClient()

  const { data: recipes = [] } = useUserRecipes(userId)

  const filtered = recipes.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = async (recipe: Recipe) => {
    if (!slot) return
    setIsReplacing(true)
    try {
      await upsertSlot(userId, weekStart, slot.day, slot.mealType, recipe.id, familySize)
      queryClient.invalidateQueries({ queryKey: ['plan', userId, weekStart] })
      toast.success('Meal replaced!')
      onReplaced()
    } catch {
      toast.error('Failed to replace meal')
    } finally {
      setIsReplacing(false)
    }
  }

  const handleRandom = async () => {
    if (!slot) return
    setIsReplacing(true)
    try {
      const meal = await fetchRandomMeal()
      if (!meal) throw new Error('No meal found')
      await saveRecipeWithId(meal)
      await upsertSlot(userId, weekStart, slot.day, slot.mealType, meal.id, familySize)
      queryClient.invalidateQueries({ queryKey: ['plan', userId, weekStart] })
      toast.success('Random meal added!')
      onReplaced()
    } catch {
      toast.error('Failed to fetch random meal')
    } finally {
      setIsReplacing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Replace meal</DialogTitle>
        </DialogHeader>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleRandom}
          disabled={isReplacing}
        >
          <Shuffle size={15} className="mr-2" />
          {isReplacing ? 'Loading...' : 'Fetch random meal'}
        </Button>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search saved recipes..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <ScrollArea className="h-56">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No saved recipes yet
            </p>
          ) : (
            <div className="space-y-1 pr-2">
              {filtered.map((recipe) => (
                <button
                  key={recipe.id}
                  onClick={() => handleSelect(recipe)}
                  disabled={isReplacing}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted text-left transition-colors"
                >
                  <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    {recipe.image && (
                      <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-foreground line-clamp-2">
                    {recipe.title}
                  </span>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
