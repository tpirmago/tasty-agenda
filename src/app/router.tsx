import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import { AppShell } from '@/components/layout/AppShell'

const Login = lazy(() => import('@/pages/Login').then(m => ({ default: m.Login })))
const Register = lazy(() => import('@/pages/Register').then(m => ({ default: m.Register })))
const Onboarding = lazy(() => import('@/pages/Onboarding').then(m => ({ default: m.Onboarding })))
const Dashboard = lazy(() => import('@/pages/Dashboard').then(m => ({ default: m.Dashboard })))
const Planner = lazy(() => import('@/pages/Planner').then(m => ({ default: m.Planner })))
const ShoppingListPage = lazy(() => import('@/pages/ShoppingList').then(m => ({ default: m.ShoppingListPage })))
const RecipesPage = lazy(() => import('@/pages/Recipes').then(m => ({ default: m.RecipesPage })))
const SettingsPage = lazy(() => import('@/pages/Settings').then(m => ({ default: m.SettingsPage })))

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
)

const SuspenseWrapper = () => (
  <Suspense fallback={<Spinner />}>
    <Outlet />
  </Suspense>
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
  {
    element: <SuspenseWrapper />,
    children: [
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
    ],
  },
])
