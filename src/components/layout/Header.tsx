import { Search, Plus, Wand2, LogOut, Menu } from 'lucide-react'
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

interface HeaderProps {
  onGenerateMeals?: () => void
  onAddRecipe?: () => void
  isGenerating?: boolean
}

export function Header({ onGenerateMeals, onAddRecipe, isGenerating }: HeaderProps) {
  const { user, signOut } = useAuth()
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const navigate = useNavigate()
  const [_search, setSearch] = useState('')

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const initials = user?.email?.[0].toUpperCase() ?? 'U'

  return (
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

      {/* Search */}
      <div className="relative flex-1 max-w-xs hidden sm:block">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search meals..."
          className="pl-9 h-9 bg-muted border-0"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex-1 lg:flex-none" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        {onGenerateMeals && (
          <Button
            size="sm"
            onClick={onGenerateMeals}
            disabled={isGenerating}
            className="hidden sm:flex items-center gap-2"
          >
            <Wand2 size={15} />
            {isGenerating ? 'Generating...' : 'Generate meals'}
          </Button>
        )}
        {onAddRecipe && (
          <Button size="sm" variant="outline" onClick={onAddRecipe} className="hidden sm:flex items-center gap-2">
            <Plus size={15} />
            Add recipe
          </Button>
        )}

        {/* User avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem className="text-xs text-muted-foreground truncate">
              {user?.email}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <LogOut size={14} className="mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
