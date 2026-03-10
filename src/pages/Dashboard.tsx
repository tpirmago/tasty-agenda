import { Link } from 'react-router-dom'
import { CalendarDays, ShoppingCart, BookOpen, Wand2 } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            Good {getTimeOfDay()}, {profile?.familySize ? `cooking for ${profile.familySize}` : ''}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">Here's your meal planning overview.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CalendarDays size={16} /> Meals this week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{mealCount}</p>
              <p className="text-xs text-muted-foreground mt-1">of 21 slots filled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ShoppingCart size={16} /> Shopping items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{pendingItems}</p>
              <p className="text-xs text-muted-foreground mt-1">items to buy</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BookOpen size={16} /> Family size
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{profile?.familySize ?? '—'}</p>
              <p className="text-xs text-muted-foreground mt-1">people</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                  <Wand2 size={22} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">Plan this week</p>
                  <p className="text-sm text-muted-foreground">Generate meals automatically</p>
                </div>
                <Button asChild size="sm">
                  <Link to="/planner">Open planner</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-100 text-green-700">
                  <ShoppingCart size={22} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">Shopping list</p>
                  <p className="text-sm text-muted-foreground">
                    {pendingItems > 0 ? `${pendingItems} items remaining` : 'All done!'}
                  </p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link to="/shopping">View list</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
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
