import { useState } from 'react'
import { ChevronDown, ChevronRight, Beef, Milk, Salad, Package, Croissant, Snowflake, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
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
    <div className="mb-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
      >
        <Icon size={16} className="text-muted-foreground" />
        <span className="flex-1 text-sm font-semibold text-foreground text-left">
          {config.label}
        </span>
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
        <div className={cn('ml-2 border-l border-border/40 pl-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4')}>
          {items.map((item) => (
            <ShoppingItem key={item.ids.join('-')} item={item} onToggle={onToggle} />
          ))}
        </div>
      )}
    </div>
  )
}

