import { motion } from 'framer-motion'
import { Checkbox } from '@/components/ui/checkbox'
import type { MergedShoppingItem } from '@/types/shopping'

interface ShoppingItemProps {
  item: MergedShoppingItem
  onToggle: (ids: string[], checked: boolean) => void
}

export function ShoppingItem({ item, onToggle }: ShoppingItemProps) {
  const id = item.ids[0]
  return (
    <div className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-muted/50 transition-colors min-w-0">
      <Checkbox
        id={id}
        checked={item.checked}
        onCheckedChange={(checked) => onToggle(item.ids, !!checked)}
        className="flex-shrink-0 border-foreground/40 size-5"
      />
      <label htmlFor={id} className="flex flex-col cursor-pointer min-w-0">
        <motion.span
          animate={{ opacity: item.checked ? 0.4 : 1 }}
          className="text-sm text-foreground leading-snug"
          style={{ textDecoration: item.checked ? 'line-through' : 'none' }}
        >
          {item.ingredient}
        </motion.span>
        {item.quantity && (
          <span className="text-xs text-muted-foreground leading-snug">
            {item.quantity}
          </span>
        )}
      </label>
    </div>
  )
}
