import { useState } from 'react'
import { ChevronDown, ChevronRight, Beef, Milk, Salad, Package, Croissant, Snowflake, Circle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { MenuCard } from '@/components/ui/menu-card'
import { ShoppingItem } from './ShoppingItem'
import type { GroceryCategory, MergedShoppingItem } from '@/types/shopping'

const CATEGORY_CONFIG: Record<GroceryCategory, { label: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = {
  produce: { label: 'Produce', icon: Salad },
  meat: { label: 'Meat & Fish', icon: Beef },
  dairy: { label: 'Dairy & Eggs', icon: Milk },
  pantry: { label: 'Pantry', icon: Package },
  bakery: { label: 'Bakery', icon: Croissant },
  frozen: { label: 'Frozen', icon: Snowflake },
  other: { label: 'Other', icon: Circle },
}

interface ShoppingGroupProps {
  category: GroceryCategory
  items: MergedShoppingItem[]
  onToggle: (ids: string[], checked: boolean) => void
}

export function ShoppingGroup({ category, items, onToggle }: ShoppingGroupProps) {
  const [open, setOpen] = useState(true)
  const config = CATEGORY_CONFIG[category]
  const Icon = config.icon
  const checkedCount = items.filter((i) => i.checked).length

  return (
    <MenuCard
      className="w-full"
      title={
        <span className="flex items-center gap-2">
          <Icon size={14} />
          {config.label}
        </span>
      }
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between mb-3 hover:opacity-70 transition-opacity"
      >
        <Badge variant="secondary" className="text-xs px-1.5">
          {checkedCount}/{items.length}
        </Badge>
        {open ? (
          <ChevronDown size={15} className="text-muted-foreground" />
        ) : (
          <ChevronRight size={15} className="text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-2 gap-y-0">
          {items.map((item) => (
            <ShoppingItem key={item.ids.join('-')} item={item} onToggle={onToggle} />
          ))}
        </div>
      )}
    </MenuCard>
  )
}
