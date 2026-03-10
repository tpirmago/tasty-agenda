import { Navigate } from 'react-router-dom'
import { RegisterForm } from '@/features/auth/RegisterForm'
import { useAuth } from '@/features/auth/useAuth'

export function Register() {
  const { user, isLoading } = useAuth()

  if (!isLoading && user) return <Navigate to="/onboarding" replace />

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="flex items-center gap-2 mb-8">
        <span className="text-2xl font-bold text-foreground">Tasty Agenda</span>
      </div>
      <RegisterForm />
    </div>
  )
}
