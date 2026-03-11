import type { DayOfWeek } from '@/types/planner'

const DAY_NAMES: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function formatWeekStart(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function getWeekDays(_weekStart: string): DayOfWeek[] {
  return DAY_NAMES
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return formatWeekStart(d)
}

export function getNextWeek(weekStart: string): string {
  return addDays(weekStart, 7)
}

export function getPrevWeek(weekStart: string): string {
  return addDays(weekStart, -7)
}

export function isCurrentWeek(weekStart: string): boolean {
  return weekStart === formatWeekStart(getMonday(new Date()))
}

export function formatWeekLabel(weekStart: string): string {
  const [y, m, d] = weekStart.split('-').map(Number)
  const start = new Date(y, m - 1, d)
  const end = new Date(y, m - 1, d)
  end.setDate(end.getDate() + 6)

  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return `${fmt(start)} – ${fmt(end)}, ${end.getFullYear()}`
}

export function getDayDate(weekStart: string, day: DayOfWeek): string {
  const idx = DAY_NAMES.indexOf(day)
  return addDays(weekStart, idx)
}
