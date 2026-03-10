import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Utensils } from 'lucide-react'
import type { Recipe } from '@/types/recipe'

interface RecipeDetailDialogProps {
  recipe: Recipe | null
  portions: number
  open: boolean
  onClose: () => void
}

export function RecipeDetailDialog({ recipe, portions, open, onClose }: RecipeDetailDialogProps) {
  if (!recipe) return null

  const scale = portions / 4 // reference portions = 4

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        {/* Image */}
        <div className="relative h-52 w-full bg-muted">
          {recipe.image ? (
            <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Utensils size={40} className="text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="p-5">
          <DialogHeader className="mb-3">
            <div className="flex items-start justify-between gap-3">
              <DialogTitle className="text-xl leading-tight">{recipe.title}</DialogTitle>
              <div className="flex gap-1.5 flex-shrink-0">
                {recipe.category && <Badge variant="secondary">{recipe.category}</Badge>}
                {recipe.area && <Badge variant="outline">{recipe.area}</Badge>}
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="h-72">
            <div className="space-y-4 pr-3">
              {/* Ingredients */}
              <div>
                <h3 className="font-semibold text-sm mb-2">
                  Ingredients <span className="text-muted-foreground font-normal">({portions} servings)</span>
                </h3>
                <ul className="space-y-1">
                  {recipe.ingredients.map((ing, i) => {
                    const rawAmount = parseFloat(ing.amount)
                    const scaledAmount = !isNaN(rawAmount)
                      ? (rawAmount * scale).toFixed(1).replace(/\.0$/, '')
                      : ing.amount
                    return (
                      <li key={i} className="flex justify-between text-sm py-1 border-b border-border/40 last:border-0">
                        <span>{ing.name}</span>
                        <span className="text-muted-foreground text-right ml-4">
                          {scaledAmount} {ing.unit}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>

              {/* Instructions */}
              {recipe.instructions && (
                <div>
                  <h3 className="font-semibold text-sm mb-2">Instructions</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {recipe.instructions}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
