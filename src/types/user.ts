export type DietPreference =
  | 'vegetarian'
  | 'vegan'
  | 'gluten-free'
  | 'lactose-free'

export interface Profile {
  id: string
  userId: string
  familySize: number
  dietPreferences: DietPreference[]
  createdAt: string
}
