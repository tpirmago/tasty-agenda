import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/services/supabase/client'
import { useAuth } from '@/features/auth/useAuth'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { DietPreference } from '@/types/user'

const DIET_OPTIONS: { value: DietPreference; label: string }[] = [
  { value: 'vegetarian', label: '🌿 Vegetarian' },
  { value: 'vegan', label: '🌱 Vegan' },
  { value: 'gluten-free', label: '🌾 Gluten-free' },
  { value: 'dairy-free', label: '🥛 Dairy-free' },
  { value: 'halal', label: '☪️ Halal' },
  { value: 'kosher', label: '✡️ Kosher' },
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
        <h1 className="text-xl font-bold text-foreground mb-6">Settings</h1>

        <div className="space-y-4">
          {/* Family size */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Family size</CardTitle>
              <CardDescription>How many people are you cooking for?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-5">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setFamilySize((n) => Math.max(1, n - 1))}
                >
                  <Minus size={16} />
                </Button>
                <span className="text-3xl font-bold text-foreground w-10 text-center">
                  {familySize}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setFamilySize((n) => Math.min(10, n + 1))}
                >
                  <Plus size={16} />
                </Button>
                <span className="text-sm text-muted-foreground ml-2">
                  {familySize === 1 ? 'person' : 'people'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Diet preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Diet preferences</CardTitle>
              <CardDescription>Used when generating meal suggestions</CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}
