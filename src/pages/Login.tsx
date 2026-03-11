import { Navigate } from 'react-router-dom'
import { LoginForm } from '@/features/auth/LoginForm'
import { useAuth } from '@/features/auth/useAuth'
import { BrandHeader } from '@/components/ui/brand-header'

export function Login() {
  const { user, isLoading } = useAuth()

  if (!isLoading && user) return <Navigate to="/planner" replace />

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <BrandHeader />
      <LoginForm />
    </div>
  )
}
