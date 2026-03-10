import { Header } from '@/components/layout/Header'
import { PlannerBoard } from '@/features/weekly-planner/PlannerBoard'

export function Planner() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1">
        <PlannerBoard />
      </div>
    </div>
  )
}
