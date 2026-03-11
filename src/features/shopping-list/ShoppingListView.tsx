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
import { PageHeading } from '@/components/ui/page-heading'
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
      <div className="max-w-5xl mx-auto w-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <PageHeading>Shopping List</PageHeading>
          <p className="text-sm text-muted-foreground mt-1">{label}</p>
        </div>
        <div className="flex gap-2 shrink-0 pt-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => clearMutation.mutate()}
            disabled={checkedItems === 0 || clearMutation.isPending}
            className="bg-[#415B8F] text-white hover:bg-[#415B8F]/15 hover:text-[#415B8F] disabled:opacity-100 disabled:bg-[#415B8F]/15 disabled:text-[#415B8F]/40"
          >
            <Trash2 size={14} className="sm:mr-1.5" />
            <span className="hidden sm:inline">Clear done</span>
          </Button>
          <Button
            size="sm"
            onClick={() => regenerateMutation.mutate()}
            disabled={regenerateMutation.isPending}
          >
            <RefreshCw size={14} className={`sm:mr-1.5 ${regenerateMutation.isPending ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Regenerate</span>
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
        <TabsList className="w-full overflow-x-auto flex-nowrap justify-start h-auto p-1 bg-[#415B8F]/15">
          {DAYS.map((day) => (
            <TabsTrigger
              key={day}
              value={day}
              className="text-xs flex-shrink-0 px-3 py-1.5 text-[#415B8F]/70 data-[state=active]:bg-[#415B8F] data-[state=active]:text-white data-[state=active]:shadow-sm"
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
            <Skeleton key={i} className="h-10 w-full rounded-lg bg-[#f6b1b8]/30" />
          ))}
        </div>
      ) : totalItems === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16">
          <h3 className="menu-card-title mb-6">No items yet</h3>
          <p className="text-sm text-muted-foreground mb-8 max-w-xs">
            Generate meals first, then click Regenerate to build your list.
          </p>
          <Button onClick={() => regenerateMutation.mutate()} disabled={regenerateMutation.isPending}>
            Generate shopping list
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {CATEGORY_ORDER.map((category) => {
            const items = grouped[category]
            if (!items?.length) return null
            return (
              <ShoppingGroup
                key={category}
                category={category}
                items={items}
                onToggle={(ids, checked) => toggleMutation.mutate({ ids, checked })}
              />
            )
          })}
        </div>
      )}
      </div>
    </div>
  )
}
