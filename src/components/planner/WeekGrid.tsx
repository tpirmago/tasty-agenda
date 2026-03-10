import { memo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { MealSlot } from './MealSlot'
import { MealCard } from '@/components/meal/MealCard'
import type { DayOfWeek, MealType, PlannerSlot, WeeklyPlan } from '@/types/planner'

const DAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner']
const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
}

interface WeekGridProps {
  plan: WeeklyPlan
  weekStart: string
  isLoading?: boolean
  onRemoveSlot: (id: string) => void
  onReplaceSlot: (slot: PlannerSlot) => void
  onViewSlot: (slot: PlannerSlot) => void
  onAddMeal: (day: DayOfWeek, mealType: MealType) => void
  onMoveSlot: (slotId: string, targetDay: DayOfWeek, targetMealType: MealType) => void
}

export const WeekGrid = memo(function WeekGrid({
  plan,
  weekStart: _weekStart,
  isLoading,
  onRemoveSlot,
  onReplaceSlot,
  onViewSlot,
  onAddMeal,
  onMoveSlot,
}: WeekGridProps) {
  const [activeDragSlot, setActiveDragSlot] = useState<PlannerSlot | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  function handleDragStart(event: DragStartEvent) {
    const slotId = event.active.id as string
    for (const day of DAYS) {
      for (const mt of MEAL_TYPES) {
        if (plan[day][mt]?.id === slotId) {
          setActiveDragSlot(plan[day][mt])
          return
        }
      }
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDragSlot(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const overId = over.id as string
    const parts = overId.split('-')
    if (parts.length < 2) return

    const targetDay = parts[0] as DayOfWeek
    const targetMealType = parts[1] as MealType

    onMoveSlot(active.id as string, targetDay, targetMealType)
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Day headers */}
          <div className="grid grid-cols-8 gap-2 mb-3">
            <div /> {/* empty label column */}
            {DAYS.map((day) => (
              <div key={day} className="text-center">
                <p className="text-xs font-semibold text-foreground">{day}</p>
              </div>
            ))}
          </div>

          {/* Meal rows */}
          {MEAL_TYPES.map((mealType) => (
            <div key={mealType} className="grid grid-cols-8 gap-2 mb-3">
              {/* Row label */}
              <div className="flex items-center">
                <span className="text-xs font-medium text-muted-foreground w-full text-right pr-2">
                  {MEAL_LABELS[mealType]}
                </span>
              </div>

              {/* Slots */}
              {DAYS.map((day) => (
                <MealSlot
                  key={`${day}-${mealType}`}
                  day={day}
                  mealType={mealType}
                  slot={plan[day][mealType]}
                  isLoading={isLoading}
                  onRemove={onRemoveSlot}
                  onReplace={onReplaceSlot}
                  onView={onViewSlot}
                  onAddMeal={onAddMeal}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeDragSlot?.recipe && (
          <div className="w-32 opacity-90 shadow-2xl rotate-2">
            <MealCard
              recipe={activeDragSlot.recipe}
              portions={activeDragSlot.portions}
              isDragging
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
})
