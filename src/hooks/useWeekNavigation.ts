import { usePlannerStore } from '@/store/plannerStore'
import {
  getNextWeek,
  getPrevWeek,
  isCurrentWeek,
  formatWeekLabel,
  formatWeekStart,
  getMonday,
} from '@/utils/dates'

export function useWeekNavigation() {
  const { currentWeekStart, setWeekStart } = usePlannerStore()

  return {
    weekStart: currentWeekStart,
    isCurrentWeek: isCurrentWeek(currentWeekStart),
    label: formatWeekLabel(currentWeekStart),
    goToPrevWeek: () => setWeekStart(getPrevWeek(currentWeekStart)),
    goToNextWeek: () => setWeekStart(getNextWeek(currentWeekStart)),
    goToCurrentWeek: () => setWeekStart(formatWeekStart(getMonday(new Date()))),
  }
}
