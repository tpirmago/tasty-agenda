import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'

export function AppShell() {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="lg:pl-60 flex flex-col min-h-screen pb-16 lg:pb-0">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  )
}
