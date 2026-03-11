import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  ShoppingCart,
  Settings,
  LogOut,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/useAuth'
import { useUIStore } from '@/store/uiStore'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/planner', label: 'Weekly Planner', icon: CalendarDays },
  { to: '/recipes', label: 'Recipes', icon: BookOpen },
  { to: '/shopping', label: 'Shopping List', icon: ShoppingCart },
  { to: '/settings', label: 'Settings', icon: Settings },
]

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-primary">
      <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
        <NavLink to="/dashboard" className="font-semibold text-lg text-white hover:text-white/80 transition-colors">Tasty Agenda</NavLink>
        {onClose && (
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X size={18} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-white/20 text-white'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-white/60 hover:bg-white/10 hover:text-white"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  )
}

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore()

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:block w-60 min-h-screen fixed left-0 top-0 z-30">
        <SidebarContent />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/40" onClick={toggleSidebar} />
          <div className="relative z-50 h-full shadow-xl">
            <SidebarContent onClose={toggleSidebar} />
          </div>
        </div>
      )}
    </>
  )
}
