import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { MenuCard } from '@/components/ui/menu-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/services/supabase/client'
import { useAuth } from '@/features/auth/useAuth'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { DietPreference } from '@/types/user'

const DIET_OPTIONS: { value: DietPreference; label: string }[] = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten-free', label: 'Gluten-free' },
  { value: 'lactose-free', label: 'Lactose-free' },
]

export function SettingsPage() {
  const { user, profile } = useAuth()
  const [familySize, setFamilySize] = useState(profile?.familySize ?? 2)
  const [dietPrefs, setDietPrefs] = useState<DietPreference[]>(profile?.dietPreferences ?? [])
  const [isSaving, setIsSaving] = useState(false)

  const toggleDiet = (value: DietPreference) => {
    setDietPrefs((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]
    )
  }

  const handleSave = async () => {
    if (!user) return
    setIsSaving(true)
    try {
      await supabase
        .from('profiles')
        .update({ family_size: familySize, diet_preferences: dietPrefs })
        .eq('user_id', user.id)
      toast.success('Settings saved!')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 px-4 lg:px-6 py-6 max-w-2xl">
        <h1 className="text-xl font-bold text-foreground mb-10">Settings</h1>

        <div className="space-y-10">
          <MenuCard title="Family Size">
            <p className="text-xs text-muted-foreground mb-4">How many people are you cooking for?</p>
            <div className="flex items-center gap-5">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setFamilySize((n) => Math.max(1, n - 1))}
              >
                -
              </Button>
              <span className="text-3xl font-black text-[#415B8F] w-10 text-center">
                {familySize}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setFamilySize((n) => Math.min(10, n + 1))}
              >
                +
              </Button>
              <span className="text-sm text-muted-foreground ml-2">
                {familySize === 1 ? 'person' : 'people'}
              </span>
            </div>
          </MenuCard>

          <MenuCard title="Diet Prefs">
            <p className="text-xs text-muted-foreground mb-4">Used when generating meal suggestions</p>
            <div className="flex flex-wrap gap-2">
              {DIET_OPTIONS.map(({ value, label }) => (
                <Badge
                  key={value}
                  variant={dietPrefs.includes(value) ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer text-sm py-1.5 px-3 transition-colors',
                    dietPrefs.includes(value) ? '' : 'hover:bg-muted'
                  )}
                  onClick={() => toggleDiet(value)}
                >
                  {label}
                </Badge>
              ))}
            </div>
          </MenuCard>

          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}
