import { Navigate } from 'react-router-dom'
import { RegisterForm } from '@/features/auth/RegisterForm'
import { useAuth } from '@/features/auth/useAuth'
import { BrandHeader } from '@/components/ui/brand-header'

export function Register() {
  const { user, isLoading } = useAuth()

  if (!isLoading && user) return <Navigate to="/onboarding" replace />

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <BrandHeader />
      <RegisterForm />
    </div>
  )
}
