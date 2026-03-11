import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { MenuCard } from '@/components/ui/menu-card'
import { Badge } from '@/components/ui/badge'
import { BrandHeader } from '@/components/ui/brand-header'
import { supabase } from '@/services/supabase/client'
import { useAuth } from '@/features/auth/useAuth'
import { cn } from '@/lib/utils'
import type { DietPreference } from '@/types/user'

const DIET_OPTIONS: { value: DietPreference; label: string }[] = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'no restrictions', label: 'No restrictions' },
]

export function Onboarding() {
  const { user, setProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [familySize, setFamilySize] = useState(2)
  const [dietPrefs, setDietPrefs] = useState<DietPreference[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const toggleDiet = (value: DietPreference) => {
    setDietPrefs((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]
    )
  }

  const handleFinish = async () => {
    if (!user) return
    setIsSaving(true)
    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        { user_id: user.id, family_size: familySize, diet_preferences: dietPrefs },
        { onConflict: 'user_id' }
      )
      .select()
      .single()

    if (error || !data) {
      toast.error('Could not save your preferences. Please try again.')
      setIsSaving(false)
      return
    }

    setProfile({
      id: data.id as string,
      userId: data.user_id as string,
      familySize: data.family_size as number,
      dietPreferences: (data.diet_preferences ?? []) as DietPreference[],
      createdAt: data.created_at as string,
    })
    setIsSaving(false)
    navigate('/planner')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <BrandHeader />

      <div className="flex items-center gap-2 mb-8">
        {[1, 2].map((s) => (
          <div
            key={s}
            className={cn(
              'h-2 rounded-full transition-all',
              s === step ? 'w-8 bg-primary' : 'w-2 bg-border'
            )}
          />
        ))}
      </div>

      {step === 1 ? (
        <MenuCard title="Welcome!" className="w-full max-w-sm">
          <p className="text-xs text-muted-foreground mb-5">How many people do you cook for?</p>
          <div className="space-y-5">
            <div className="flex items-center justify-center gap-6">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setFamilySize((n) => Math.max(1, n - 1))}
              >
                -
              </Button>
              <span className="text-4xl font-black text-[#415B8F] w-12 text-center">
                {familySize}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setFamilySize((n) => Math.min(10, n + 1))}
              >
                +
              </Button>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {familySize === 1 ? 'Just you' : `${familySize} people`}
            </p>
            <Button className="w-full" onClick={() => setStep(2)}>
              Next
            </Button>
          </div>
        </MenuCard>
      ) : (
        <MenuCard title="Diet Prefs" className="w-full max-w-sm">
          <p className="text-xs text-muted-foreground mb-4">Select all that apply (you can change this later)</p>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {DIET_OPTIONS.map(({ value, label }) => (
                <Badge
                  key={value}
                  variant={dietPrefs.includes(value) ? 'default' : 'outline'}
                  className="cursor-pointer text-sm py-1.5 px-3"
                  onClick={() => toggleDiet(value)}
                >
                  {label}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button className="flex-1" onClick={handleFinish} disabled={isSaving}>
                {isSaving ? 'Saving...' : "Let's cook!"}
              </Button>
            </div>
          </div>
        </MenuCard>
      )}
    </div>
  )
}
