import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ShoppingGroup } from '@/components/shopping/ShoppingGroup'
import { Skeleton } from '@/components/ui/skeleton'
import { RefreshCw, Trash2 } from 'lucide-react'
import { useShoppingList } from './useShoppingList'
import { useUIStore } from '@/store/uiStore'
import { useWeekNavigation } from '@/hooks/useWeekNavigation'
import { useAuth } from '@/features/auth/useAuth'
import type { DayOfWeek } from '@/types/planner'
import type { GroceryCategory } from '@/types/shopping'

const DAYS: (DayOfWeek | 'week')[] = ['week', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DAY_LABELS: Record<DayOfWeek | 'week', string> = {
  week: 'Full Week',
  Mon: 'Mon', Tue: 'Tue', Wed: 'Wed', Thu: 'Thu',
  Fri: 'Fri', Sat: 'Sat', Sun: 'Sun',
}

const CATEGORY_ORDER: GroceryCategory[] = [
  'produce', 'meat', 'dairy', 'pantry', 'bakery', 'frozen', 'other',
]

export function ShoppingListView() {
  const { user, profile } = useAuth()
  const { weekStart, label } = useWeekNavigation()
  const { shoppingDay, setShoppingDay } = useUIStore()
  const familySize = profile?.familySize ?? 2

  const {
    grouped,
    isLoading,
    totalItems,
    checkedItems,
    regenerateMutation,
    toggleMutation,
    clearMutation,
  } = useShoppingList(user?.id ?? '', weekStart, shoppingDay, familySize)

  const progress = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Shopping List</h1>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => clearMutation.mutate()}
            disabled={checkedItems === 0 || clearMutation.isPending}
          >
            <Trash2 size={14} className="mr-1.5" />
            Clear done
          </Button>
          <Button
            size="sm"
            onClick={() => regenerateMutation.mutate()}
            disabled={regenerateMutation.isPending}
          >
            <RefreshCw size={14} className={`mr-1.5 ${regenerateMutation.isPending ? 'animate-spin' : ''}`} />
            Regenerate
          </Button>
        </div>
      </div>

      {/* Progress */}
      {totalItems > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{checkedItems} of {totalItems} items</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Day tabs */}
      <Tabs value={shoppingDay} onValueChange={(v) => setShoppingDay(v as DayOfWeek | 'week')}>
        <TabsList className="w-full overflow-x-auto flex-nowrap justify-start h-auto p-1 bg-muted/50">
          {DAYS.map((day) => (
            <TabsTrigger
              key={day}
              value={day}
              className="text-xs flex-shrink-0 px-3 py-1.5"
            >
              {DAY_LABELS[day]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Items */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      ) : totalItems === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🛒</div>
          <h3 className="font-semibold text-foreground mb-2">No items yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Generate meals first, then click Regenerate to build your list.
          </p>
          <Button onClick={() => regenerateMutation.mutate()} disabled={regenerateMutation.isPending}>
            Generate shopping list
          </Button>
        </div>
      ) : (
        <div>
          {CATEGORY_ORDER.map((category) => {
            const items = grouped[category]
            if (!items?.length) return null
            return (
              <ShoppingGroup
                key={category}
                category={category}
                items={items}
                onToggle={(id, checked) => toggleMutation.mutate({ id, checked })}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
