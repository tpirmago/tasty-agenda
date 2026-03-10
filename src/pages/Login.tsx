import { Navigate } from 'react-router-dom'
import { UtensilsCrossed } from 'lucide-react'
import { LoginForm } from '@/features/auth/LoginForm'
import { useAuth } from '@/features/auth/useAuth'

export function Login() {
  const { user, isLoading } = useAuth()

  if (!isLoading && user) return <Navigate to="/planner" replace />

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="flex items-center gap-2 mb-8">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground">
          <UtensilsCrossed size={20} />
        </div>
        <span className="text-2xl font-bold text-foreground">Tasty Agenda</span>
      </div>
      <LoginForm />
    </div>
  )
}
