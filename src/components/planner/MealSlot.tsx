import { useDroppable } from '@dnd-kit/core'
import { useDraggable } from '@dnd-kit/core'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MealCard } from '@/components/meal/MealCard'
import { Skeleton } from '@/components/ui/skeleton'
import type { PlannerSlot } from '@/types/planner'
import type { DayOfWeek, MealType } from '@/types/planner'

interface MealSlotProps {
  day: DayOfWeek
  mealType: MealType
  slot: PlannerSlot | null
  isLoading?: boolean
  isFavorited?: boolean
  onRemove?: (id: string) => void
  onReplace?: (slot: PlannerSlot) => void
  onView?: (slot: PlannerSlot) => void
  onAddMeal?: (day: DayOfWeek, mealType: MealType) => void
  onFavorite?: (recipeId: string) => void
}

export function MealSlot({
  day,
  mealType,
  slot,
  isLoading,
  isFavorited,
  onRemove,
  onReplace,
  onView,
  onAddMeal,
  onFavorite,
}: MealSlotProps) {
  const droppableId = `${day}-${mealType}`

  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: droppableId })

  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id: slot?.id ?? droppableId,
    disabled: !slot,
  })

  const setNodeRef = (el: HTMLElement | null) => {
    setDropRef(el)
    setDragRef(el)
  }

  if (isLoading) {
    return <Skeleton className="h-36 w-full rounded-xl" />
  }

  if (!slot || !slot.recipe) {
    return (
      <div
        ref={setDropRef}
        className={cn(
          'h-36 rounded-xl border-2 border-dashed flex items-center justify-center transition-colors',
          isOver
            ? 'border-primary bg-accent/60'
            : 'border-border hover:border-muted-foreground/40 hover:bg-muted/30'
        )}
      >
        <button
          onClick={() => onAddMeal?.(day, mealType)}
          className="flex flex-col items-center gap-1 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
        >
          <Plus size={18} />
          <span className="text-[10px]">Add</span>
        </button>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'transition-all rounded-xl',
        isOver && !isDragging && 'ring-2 ring-primary/40 ring-offset-1'
      )}
      {...attributes}
    >
      <MealCard
        recipe={slot.recipe}
        portions={slot.portions}
        isDragging={isDragging}
        isFavorited={isFavorited}
        onRemove={() => onRemove?.(slot.id)}
        onReplace={() => onReplace?.(slot)}
        onView={() => onView?.(slot)}
        onFavorite={onFavorite ? () => onFavorite(slot.recipe!.id) : undefined}
        dragHandleProps={listeners}
      />
    </div>
  )
}
