import { motion } from 'framer-motion'
import { Checkbox } from '@/components/ui/checkbox'
import type { ShoppingItem as ShoppingItemType } from '@/types/shopping'

interface ShoppingItemProps {
  item: ShoppingItemType
  onToggle: (id: string, checked: boolean) => void
}

export function ShoppingItem({ item, onToggle }: ShoppingItemProps) {
  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
      <Checkbox
        id={item.id}
        checked={item.checked}
        onCheckedChange={(checked) => onToggle(item.id, !!checked)}
        className="flex-shrink-0"
      />
      <label htmlFor={item.id} className="flex-1 flex items-center justify-between cursor-pointer">
        <motion.span
          animate={{ opacity: item.checked ? 0.5 : 1 }}
          className="text-sm text-foreground"
          style={{ textDecoration: item.checked ? 'line-through' : 'none' }}
        >
          {item.ingredient}
        </motion.span>
        {(item.amount || item.unit) && (
          <span className="text-xs text-muted-foreground ml-3 flex-shrink-0">
            {item.amount} {item.unit}
          </span>
        )}
      </label>
    </div>
  )
}
