import { Header } from '@/components/layout/Header'
import { ShoppingListView } from '@/features/shopping-list/ShoppingListView'

export function ShoppingListPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <ShoppingListView />
    </div>
  )
}
