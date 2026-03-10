import { create } from 'zustand'
import { formatWeekStart, getMonday } from '@/utils/dates'
import type { PlannerSlot } from '@/types/planner'

interface PlannerStore {
  currentWeekStart: string
  setWeekStart: (w: string) => void
  selectedSlot: PlannerSlot | null
  setSelectedSlot: (slot: PlannerSlot | null) => void
}

export const usePlannerStore = create<PlannerStore>((set) => ({
  currentWeekStart: formatWeekStart(getMonday(new Date())),
  setWeekStart: (w) => set({ currentWeekStart: w }),
  selectedSlot: null,
  setSelectedSlot: (slot) => set({ selectedSlot: slot }),
}))
