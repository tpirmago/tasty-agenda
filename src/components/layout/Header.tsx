import { Search, Plus, Wand2, LogOut, Menu, User, Settings } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/features/auth/useAuth'
import { useUIStore } from '@/store/uiStore'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AddRecipeModal } from '@/features/recipes/AddRecipeModal'

interface HeaderProps {
  onGenerateMeals?: () => void
  isGenerating?: boolean
}

export function Header({ onGenerateMeals, isGenerating }: HeaderProps) {
  const { user, signOut } = useAuth()
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && search.trim()) {
      navigate(`/recipes?q=${encodeURIComponent(search.trim())}`)
      setSearch('')
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <>
      <header className="sticky top-0 z-20 flex items-center gap-3 h-16 px-4 lg:px-6 bg-card/80 backdrop-blur-md border-b border-border">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={toggleSidebar}
        >
          <Menu size={20} />
        </Button>

        <div className="flex-1" />

        {/* Right side */}
        <div className="flex items-center gap-2">
          {onGenerateMeals && (
            <Button
              onClick={onGenerateMeals}
              disabled={isGenerating}
              className="hidden sm:flex items-center gap-2 h-9"
            >
              <Wand2 size={15} />
              {isGenerating ? 'Generating...' : 'Generate meals'}
            </Button>
          )}

          <Button onClick={() => setShowAdd(true)} className="hidden sm:flex items-center gap-2 h-9">
            <Plus size={15} />
            Add recipe
          </Button>

          {/* Search */}
          <div className="relative hidden sm:block">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-foreground/70" />
            <Input
              placeholder="Search meals..."
              className="pl-9 h-9 w-52 bg-primary border-0 text-primary-foreground placeholder:text-primary-foreground/60"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </div>

          {/* User avatar dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-9 w-9 cursor-pointer">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <User size={16} />
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem className="text-xs text-muted-foreground truncate">
                {user?.email}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings size={14} className="mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut size={14} className="mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <AddRecipeModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        userId={user?.id ?? ''}
      />
    </>
  )
}
