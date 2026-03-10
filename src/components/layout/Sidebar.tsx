import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  ShoppingCart,
  Settings,
  UtensilsCrossed,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/useAuth'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/planner', label: 'Weekly Planner', icon: CalendarDays },
  { to: '/recipes', label: 'Recipes', icon: BookOpen },
  { to: '/shopping', label: 'Shopping List', icon: ShoppingCart },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-screen fixed left-0 top-0 z-30" style={{ backgroundColor: '#faf3ef' }}>
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5" style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        <span className="font-semibold text-lg text-foreground">Tasty Agenda</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-black/10 text-foreground'
                  : 'text-muted-foreground hover:bg-black/5 hover:text-foreground'
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-red-50"
          style={{ color: '#b05a5a' }}
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
