import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { AppShell } from '@/components/layout/AppShell'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { Onboarding } from '@/pages/Onboarding'
import { Dashboard } from '@/pages/Dashboard'
import { Planner } from '@/pages/Planner'
import { ShoppingListPage } from '@/pages/ShoppingList'
import { RecipesPage } from '@/pages/Recipes'
import { SettingsPage } from '@/pages/Settings'

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
)

// Requires only a valid session (not full onboarding)
function AuthRoute() {
  const { user, isLoading } = useAuth()
  if (isLoading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}

// Requires session + completed onboarding
function OnboardedRoute() {
  const { profile, isLoading } = useAuth()
  if (isLoading) return <Spinner />
  if (!profile || profile.familySize === 0) return <Navigate to="/onboarding" replace />
  return <Outlet />
}

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  {
    element: <AuthRoute />,
    children: [
      { path: '/onboarding', element: <Onboarding /> },
      {
        element: <OnboardedRoute />,
        children: [
          {
            element: <AppShell />,
            children: [
              { path: '/', element: <Navigate to="/planner" replace /> },
              { path: '/dashboard', element: <Dashboard /> },
              { path: '/planner', element: <Planner /> },
              { path: '/recipes', element: <RecipesPage /> },
              { path: '/shopping', element: <ShoppingListPage /> },
              { path: '/settings', element: <SettingsPage /> },
            ],
          },
        ],
      },
    ],
  },
])
