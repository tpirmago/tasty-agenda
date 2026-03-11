import { useState } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, Wand2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { WeekGrid } from '@/components/planner/WeekGrid'
import { RecipeDetailDialog } from '@/components/meal/RecipeDetailDialog'
import { ReplaceMealDialog } from './ReplaceMealDialog'
import { usePlanner } from './usePlanner'
import { useWeekNavigation } from '@/hooks/useWeekNavigation'
import { useAuth } from '@/features/auth/useAuth'
import { useFavoriteIds, useToggleFavorite } from '@/features/recipes/useFavorites'
import type { DayOfWeek, MealType, PlannerSlot } from '@/types/planner'
import { cn } from '@/lib/utils'

export function PlannerBoard() {
  const { user, profile } = useAuth()
  const { weekStart, label, isCurrentWeek, goToPrevWeek, goToNextWeek, goToCurrentWeek } =
    useWeekNavigation()

  const familySize = profile?.familySize ?? 2
  const dietPrefs = profile?.dietPreferences ?? []

  const { plan, isLoading, isGenerating, generateMutation, removeMutation, moveMutation } =
    usePlanner(user?.id ?? '', weekStart, familySize, dietPrefs)

  const favoriteIds = useFavoriteIds(user?.id ?? '')
  const toggleFavoriteMutation = useToggleFavorite(user?.id ?? '')

  const handleFavorite = (recipeId: string) => {
    toggleFavoriteMutation.mutate({ recipeId, isFavorited: favoriteIds.has(recipeId) })
  }

  const [viewSlot, setViewSlot] = useState<PlannerSlot | null>(null)
  const [replaceSlot, setReplaceSlot] = useState<PlannerSlot | null>(null)
  const [confirmRegenerate, setConfirmRegenerate] = useState(false)

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
          <div>
            <div className="w-fit">
              <h2 className="text-xl font-bold" style={{ color: '#415B8F' }}>{label}</h2>
              <svg width="100%" height="18" xmlns="http://www.w3.org/2000/svg" className="mt-1">
                <defs>
                  <pattern id="wave-planner" x="0" y="0" width="42" height="18" patternUnits="userSpaceOnUse">
                    <path d="M0 9 C14 2, 28 16, 42 9" stroke="#415B8F" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  </pattern>
                </defs>
                <rect width="100%" height="18" fill="url(#wave-planner)" />
              </svg>
            </div>
            {totalMeals > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">{totalMeals} of 21 meals planned</p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToPrevWeek}>
              <ChevronLeft size={16} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToNextWeek}>
              <ChevronRight size={16} />
            </Button>
          </div>
          {!isCurrentWeek && (
            <Button size="sm" onClick={goToCurrentWeek} className="text-xs h-7">
              <CalendarDays size={12} className="mr-1" />
              Today
            </Button>
          )}
        </div>

        {totalMeals > 0 ? (
          <Button
            size="sm"
            onClick={() => setConfirmRegenerate(true)}
            disabled={isGenerating}
            className={cn('flex items-center gap-2', isGenerating && 'opacity-75')}
          >
            <RefreshCw size={14} className={isGenerating ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">
              {isGenerating ? 'Generating...' : 'Regenerate week'}
            </span>
            <span className="sm:hidden">Regenerate</span>
          </Button>
        ) : (
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
        )}
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
            favoriteIds={favoriteIds}
            onRemoveSlot={(id) => removeMutation.mutate(id)}
            onReplaceSlot={(slot) => setReplaceSlot(slot)}
            onViewSlot={(slot) => setViewSlot(slot)}
            onAddMeal={(_day: DayOfWeek, _mt: MealType) => {
              // TODO: open add meal dialog
            }}
            onMoveSlot={(slotId, targetDay, targetMealType) =>
              moveMutation.mutate({ slotId, targetDay, targetMealType })
            }
            onFavorite={handleFavorite}
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

      {/* Regenerate confirmation dialog */}
      <AlertDialog open={confirmRegenerate} onOpenChange={setConfirmRegenerate}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Regenerate the whole week?</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace all {totalMeals} planned meals with new ones. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmRegenerate(false)
                generateMutation.mutate()
              }}
            >
              Yes, regenerate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
