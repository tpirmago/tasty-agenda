import { create } from 'zustand'
import type { DayOfWeek } from '@/types/planner'

interface UIStore {
  sidebarOpen: boolean
  toggleSidebar: () => void
  shoppingDay: DayOfWeek | 'week'
  setShoppingDay: (day: DayOfWeek | 'week') => void
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  shoppingDay: 'week',
  setShoppingDay: (day) => set({ shoppingDay: day }),
}))
