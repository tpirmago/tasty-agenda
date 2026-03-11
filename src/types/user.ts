export type DietPreference =
  | 'vegetarian'
  | 'vegan'
  | 'no restrictions'

export interface Profile {
  id: string
  userId: string
  familySize: number
  dietPreferences: DietPreference[]
  createdAt: string
}
