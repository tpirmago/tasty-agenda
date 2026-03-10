export type DietPreference =
  | 'vegetarian'
  | 'vegan'
  | 'gluten-free'
  | 'dairy-free'
  | 'halal'
  | 'kosher'

export interface Profile {
  id: string
  userId: string
  familySize: number
  dietPreferences: DietPreference[]
  createdAt: string
}
