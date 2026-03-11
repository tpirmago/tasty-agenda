import { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shuffle, Trash2, GripVertical, Utensils, Heart } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Recipe } from '@/types/recipe'

interface MealCardProps {
  recipe: Recipe
  portions: number
  isDragging?: boolean
  isFavorited?: boolean
  onRemove?: () => void
  onReplace?: () => void
  onView?: () => void
  onFavorite?: () => void
  dragHandleProps?: Record<string, unknown>
}

export const MealCard = memo(function MealCard({
  recipe,
  portions,
  isDragging,
  isFavorited,
  onRemove,
  onReplace,
  onView,
  onFavorite,
  dragHandleProps,
}: MealCardProps) {
  const [hovered, setHovered] = useState(false)
  const previewIngredients = recipe.ingredients.slice(0, 2)

  return (
    <motion.div
      className={cn(
        'relative bg-card rounded-xl border border-border overflow-hidden shadow-sm cursor-pointer select-none',
        isDragging && 'opacity-50 scale-95 shadow-lg ring-2 ring-primary/30'
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onView}
      layout
    >
      {/* Drag handle */}
      <div
        {...dragHandleProps}
        className="absolute top-2 left-2 z-10 text-muted-foreground/50 hover:text-muted-foreground cursor-grab active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical size={14} />
      </div>

      {/* Image */}
      <div className="relative h-32 w-full bg-muted overflow-hidden">
        {recipe.image ? (
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Utensils size={24} className="text-muted-foreground" />
          </div>
        )}

        {/* Heart / favorite button */}
        {onFavorite && (
          <button
            onClick={(e) => { e.stopPropagation(); onFavorite() }}
            className={cn(
              'absolute top-2 right-2 z-10 p-1.5 rounded-full bg-background/80 shadow-sm transition-all',
              isFavorited || hovered ? 'opacity-100' : 'opacity-0'
            )}
            title={isFavorited ? 'Remove from recipes' : 'Save to recipes'}
          >
            <Heart
              size={13}
              className={cn(isFavorited ? 'fill-red-500 text-red-500' : 'text-foreground')}
            />
          </button>
        )}

        {/* Portions badge */}
        <Badge
          variant="secondary"
          className="absolute bottom-1.5 right-1.5 text-xs px-1.5 py-0"
        >
          {portions} ppl
        </Badge>
      </div>

      {/* Content */}
      <div className="p-2">
        <p className="text-xs font-semibold text-foreground line-clamp-2 leading-tight mb-1">
          {recipe.title}
        </p>
        <div className="space-y-0.5">
          {previewIngredients.map((ing, i) => (
            <p key={i} className="text-[10px] text-muted-foreground truncate">
              · {ing.name}
            </p>
          ))}
        </div>
      </div>

      {/* Action buttons — bottom-right corner */}
      <AnimatePresence>
        {hovered && !isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-2 right-2 flex gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => { e.stopPropagation(); onReplace?.() }}
              className="p-1.5 rounded-lg bg-background/80 hover:bg-background text-foreground shadow-sm transition-colors"
              title="Replace meal"
            >
              <Shuffle size={13} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onRemove?.() }}
              className="p-1.5 rounded-lg bg-background/80 hover:bg-red-100 text-red-500 shadow-sm transition-colors"
              title="Remove meal"
            >
              <Trash2 size={13} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
})
