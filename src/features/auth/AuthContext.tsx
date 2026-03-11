import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/services/supabase/client'
import * as authService from '@/services/supabase/auth'
import type { Profile, DietPreference } from '@/types/user'

interface AuthState {
  user: User | null
  profile: Profile | null
  isLoading: boolean
}

interface AuthContextValue extends AuthState {
  isOnboarded: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  setProfile: (profile: Profile) => void
}

async function fetchProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error || !data) return null

    return {
      id: data.id as string,
      userId: data.user_id as string,
      familySize: data.family_size as number,
      dietPreferences: (data.diet_preferences ?? []) as DietPreference[],
      createdAt: data.created_at as string,
    }
  } catch {
    return null
  }
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    isLoading: true,
  })

  useEffect(() => {
    let mounted = true

    // getSession handles the initial state (avoids INITIAL_SESSION lock contention)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return
      if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        if (mounted) setState({ user: session.user, profile, isLoading: false })
      } else {
        if (mounted) setState({ user: null, profile: null, isLoading: false })
      }
    }).catch(() => {
      if (mounted) setState({ user: null, profile: null, isLoading: false })
    })

    // onAuthStateChange handles subsequent events only (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        // if (event === 'INITIAL_SESSION') return // handled by getSession above
        if (!mounted) return
        if (session?.user) {
          const profile = await fetchProfile(session.user.id)
          if (mounted) setState({ user: session.user, profile, isLoading: false })
        } else {
          if (mounted) setState({ user: null, profile: null, isLoading: false })
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const setProfile = useCallback((profile: Profile) => {
    setState((prev) => ({ ...prev, profile }))
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await authService.signIn(email, password)
    if (error) throw error
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await authService.signUp(email, password)
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await authService.signOut()
    if (error) throw error
  }, [])

  return (
    <AuthContext.Provider
      value={{
        ...state,
        isOnboarded: (state.profile?.familySize ?? 0) > 0,
        signIn,
        signUp,
        signOut,
        setProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
