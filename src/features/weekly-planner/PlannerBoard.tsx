import { useState } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WeekGrid } from '@/components/planner/WeekGrid'
import { RecipeDetailDialog } from '@/components/meal/RecipeDetailDialog'
import { ReplaceMealDialog } from './ReplaceMealDialog'
import { usePlanner } from './usePlanner'
import { useWeekNavigation } from '@/hooks/useWeekNavigation'
import { useAuth } from '@/features/auth/useAuth'
import type { DayOfWeek, MealType, PlannerSlot } from '@/types/planner'
import { cn } from '@/lib/utils'

export function PlannerBoard() {
  const { user, profile } = useAuth()
  const { weekStart, label, isCurrentWeek, goToPrevWeek, goToNextWeek, goToCurrentWeek } =
    useWeekNavigation()

  const familySize = profile?.familySize ?? 2

  const { plan, isLoading, isGenerating, generateMutation, removeMutation, moveMutation } =
    usePlanner(user?.id ?? '', weekStart, familySize)

  const [viewSlot, setViewSlot] = useState<PlannerSlot | null>(null)
  const [replaceSlot, setReplaceSlot] = useState<PlannerSlot | null>(null)

  const emptyPlan = {
    Mon: { breakfast: null, lunch: null, dinner: null },
    Tue: { breakfast: null, lunch: null, dinner: null },
    Wed: { breakfast: null, lunch: null, dinner: null },
    Thu: { breakfast: null, lunch: null, dinner: null },
    Fri: { breakfast: null, lunch: null, dinner: null },
    Sat: { breakfast: null, lunch: null, dinner: null },
    Sun: { breakfast: null, lunch: null, dinner: null },
  }

  const currentPlan = plan ?? emptyPlan

  const totalMeals = Object.values(currentPlan).reduce(
    (acc, day) => acc + Object.values(day).filter(Boolean).length,
    0
  )

  return (
    <div className="flex flex-col h-full">
      {/* Week navigation header */}
      <div className="border-b border-border bg-card/50 px-4 lg:px-6 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToPrevWeek}>
              <ChevronLeft size={16} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToNextWeek}>
              <ChevronRight size={16} />
            </Button>
          </div>
          <div>
            <h2 className="font-semibold text-foreground text-sm lg:text-base">{label}</h2>
            {totalMeals > 0 && (
              <p className="text-xs text-muted-foreground">{totalMeals} of 21 meals planned</p>
            )}
          </div>
          {!isCurrentWeek && (
            <Button variant="outline" size="sm" onClick={goToCurrentWeek} className="text-xs h-7">
              <CalendarDays size={12} className="mr-1" />
              Today
            </Button>
          )}
        </div>

        <Button
          size="sm"
          onClick={() => generateMutation.mutate()}
          disabled={isGenerating}
          className={cn('flex items-center gap-2', isGenerating && 'opacity-75')}
        >
          <Wand2 size={14} className={isGenerating ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">
            {isGenerating ? 'Generating...' : 'Generate week'}
          </span>
          <span className="sm:hidden">Generate</span>
        </Button>
      </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto px-4 lg:px-6 py-4">
        <div className="max-w-5xl mx-auto">
        {/* Empty state */}
        {!isLoading && !isGenerating && totalMeals === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Your week is empty</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs">
              Generate a full week of delicious meals with one click, or add meals manually.
            </p>
            <Button onClick={() => generateMutation.mutate()} disabled={isGenerating}>
              <Wand2 size={16} className="mr-2" />
              Generate Weekly Menu
            </Button>
          </div>
        )}

        {(isLoading || isGenerating || totalMeals > 0) && (
          <WeekGrid
            plan={currentPlan}
            weekStart={weekStart}
            isLoading={isLoading || isGenerating}
            onRemoveSlot={(id) => removeMutation.mutate(id)}
            onReplaceSlot={(slot) => setReplaceSlot(slot)}
            onViewSlot={(slot) => setViewSlot(slot)}
            onAddMeal={(_day: DayOfWeek, _mt: MealType) => {
              // TODO: open add meal dialog
            }}
            onMoveSlot={(slotId, targetDay, targetMealType) =>
              moveMutation.mutate({ slotId, targetDay, targetMealType })
            }
          />
        )}
        </div>
      </div>

      {/* Recipe detail dialog */}
      <RecipeDetailDialog
        recipe={viewSlot?.recipe ?? null}
        portions={viewSlot?.portions ?? familySize}
        open={!!viewSlot}
        onClose={() => setViewSlot(null)}
      />

      {/* Replace meal dialog */}
      <ReplaceMealDialog
        slot={replaceSlot}
        open={!!replaceSlot}
        onClose={() => setReplaceSlot(null)}
        userId={user?.id ?? ''}
        weekStart={weekStart}
        familySize={familySize}
        onReplaced={() => {
          setReplaceSlot(null)
        }}
      />
    </div>
  )
}
