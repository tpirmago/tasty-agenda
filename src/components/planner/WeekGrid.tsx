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
const DAY_LABELS: Record<DayOfWeek, string> = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
  Sun: 'Sunday',
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
      <div className="space-y-8 pb-4">
        {DAYS.map((day) => (
          <div key={day} className="relative mt-6 w-full">
            {/* Floating day title — MenuCard style */}
            <div className="absolute top-0 left-6 -translate-y-1/2 px-3 bg-background z-10 whitespace-nowrap">
              <h2 className="menu-card-title">{DAY_LABELS[day]}</h2>
            </div>

            {/* Card body */}
            <div
              className="bg-white rounded-xl border-2 border-[#415B8F] px-10 pt-7 pb-10"
              style={{ boxShadow: '4px 4px 0 0 #415B8F' }}
            >
              <div className="border-t border-dotted border-[#415B8F]/25 mb-7" />

              <div className="flex gap-8">
                {MEAL_TYPES.map((mealType) => (
                  <div key={mealType} className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-[#415B8F]/70 mb-2 uppercase tracking-widest">
                      {MEAL_LABELS[mealType]}
                    </p>
                    <MealSlot
                      day={day}
                      mealType={mealType}
                      slot={plan[day][mealType]}
                      isLoading={isLoading}
                      onRemove={onRemoveSlot}
                      onReplace={onReplaceSlot}
                      onView={onViewSlot}
                      onAddMeal={onAddMeal}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeDragSlot?.recipe && (
          <div className="w-36 opacity-90 shadow-2xl rotate-2">
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
