import { Link } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { MenuCard, MenuCardRow } from '@/components/ui/menu-card'
import { useAuth } from '@/features/auth/useAuth'
import { useQuery } from '@tanstack/react-query'
import { getWeekPlan } from '@/features/weekly-planner/plannerService'
import { getShoppingList } from '@/features/shopping-list/shoppingService'
import { formatWeekStart, getMonday } from '@/utils/dates'
import { usePlannerStore } from '@/store/plannerStore'

export function Dashboard() {
  const { user, profile } = useAuth()
  const weekStart = usePlannerStore((s) => s.currentWeekStart)
  const currentWeekStart = weekStart || formatWeekStart(getMonday(new Date()))

  const { data: plan } = useQuery({
    queryKey: ['plan', user?.id, currentWeekStart],
    queryFn: () => getWeekPlan(user!.id, currentWeekStart),
    enabled: !!user,
  })

  const { data: shoppingItems = [] } = useQuery({
    queryKey: ['shopping', user?.id, currentWeekStart, 'week'],
    queryFn: () => getShoppingList(user!.id, currentWeekStart),
    enabled: !!user,
  })

  const mealCount = plan
    ? Object.values(plan).reduce(
        (acc, day) => acc + Object.values(day).filter(Boolean).length,
        0
      )
    : 0

  const pendingItems = shoppingItems.filter((i) => !i.checked).length

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 px-4 lg:px-6 py-6">
        <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            Good {getTimeOfDay()}{profile?.familySize ? `, cooking for ${profile.familySize}` : ''}!
          </h1>
          <p className="text-muted-foreground mt-1">Here's your meal planning overview.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <MenuCard title="Meals">
            <MenuCardRow
              label="This week"
              description="of 21 slots filled"
              value={<span className="text-3xl font-black">{mealCount}</span>}
            />
          </MenuCard>

          <MenuCard title="Shopping">
            <MenuCardRow
              label="Items to buy"
              description="pending this week"
              value={<span className="text-3xl font-black">{pendingItems}</span>}
            />
          </MenuCard>

          <MenuCard title="Family">
            <MenuCardRow
              label="Cooking for"
              description="household members"
              value={<span className="text-3xl font-black">{profile?.familySize ?? '—'}</span>}
            />
          </MenuCard>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <MenuCard title="Planner">
            <MenuCardRow
              label="Plan this week"
              description="Generate meals automatically"
              value={
                <Button asChild size="sm">
                  <Link to="/planner">Open</Link>
                </Button>
              }
            />
          </MenuCard>

          <MenuCard title="Shopping List">
            <MenuCardRow
              label="Weekly list"
              description={pendingItems > 0 ? `${pendingItems} items remaining` : 'All done!'}
              value={
                <Button asChild size="sm" variant="outline">
                  <Link to="/shopping">View</Link>
                </Button>
              }
            />
          </MenuCard>
        </div>
        </div>
      </div>
    </div>
  )
}

function getTimeOfDay(): string {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
