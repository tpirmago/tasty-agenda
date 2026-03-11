export type DietPreference =
  | 'vegetarian'
  | 'vegan'
  | 'gluten-free'

export interface Profile {
  id: string
  userId: string
  familySize: number
  dietPreferences: DietPreference[]
  createdAt: string
}
