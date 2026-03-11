import { Link } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { MenuCard, MenuCardRow } from '@/components/ui/menu-card'
import { PageHeading } from '@/components/ui/page-heading'
import { useAuth } from '@/features/auth/useAuth'
import { useQuery } from '@tanstack/react-query'
import { getWeekPlan } from '@/features/weekly-planner/plannerService'
import { getShoppingList } from '@/features/shopping-list/shoppingService'
import { useUserRecipes } from '@/features/recipes/useRecipes'
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

  const { data: allRecipes = [] } = useUserRecipes(user?.id ?? '')

  const pendingItems = shoppingItems.filter((i) => !i.checked).length

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 px-4 lg:px-6 py-6">
        <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <PageHeading size="2xl">What's on the menu today?</PageHeading>
          <p className="text-muted-foreground mt-2">Here's your meal planning overview.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link to="/planner" className="block">
            <MenuCard title="Meals" clickable>
              <MenuCardRow
                label="This week"
                description="of 21 slots filled"
                value={<span className="text-3xl font-black">{mealCount}</span>}
              />
            </MenuCard>
          </Link>

          <Link to="/shopping" className="block">
            <MenuCard title="Shopping" clickable>
              <MenuCardRow
                label="Items to buy"
                description="pending this week"
                value={<span className="text-3xl font-black">{pendingItems}</span>}
              />
            </MenuCard>
          </Link>

          <Link to="/settings" className="block">
            <MenuCard title="Family" clickable>
              <MenuCardRow
                label="Cooking for"
                description="household members"
                value={<span className="text-3xl font-black">{profile?.familySize ?? '—'}</span>}
              />
            </MenuCard>
          </Link>

          <Link to="/recipes" className="block">
            <MenuCard title="Recipes" clickable>
              <MenuCardRow
                label="Saved recipes"
                description="in your collection"
                value={<span className="text-3xl font-black">{allRecipes.length}</span>}
              />
            </MenuCard>
          </Link>
        </div>
        </div>
      </div>
    </div>
  )
}
