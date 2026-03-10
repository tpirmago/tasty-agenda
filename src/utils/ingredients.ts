import type { GroceryCategory, ShoppingItem } from '@/types/shopping'
import type { PlannerSlot } from '@/types/planner'

const REFERENCE_PORTIONS = 4

export const CATEGORY_MAP: Record<string, GroceryCategory> = {
  // meat & fish
  chicken: 'meat', beef: 'meat', pork: 'meat', lamb: 'meat', turkey: 'meat',
  fish: 'meat', salmon: 'meat', tuna: 'meat', shrimp: 'meat', prawn: 'meat',
  mince: 'meat', bacon: 'meat', sausage: 'meat', ham: 'meat',
  // dairy
  milk: 'dairy', cheese: 'dairy', butter: 'dairy', cream: 'dairy',
  yogurt: 'dairy', egg: 'dairy', parmesan: 'dairy', mozzarella: 'dairy',
  // produce
  tomato: 'produce', onion: 'produce', garlic: 'produce', pepper: 'produce',
  spinach: 'produce', lettuce: 'produce', carrot: 'produce', potato: 'produce',
  celery: 'produce', cucumber: 'produce', zucchini: 'produce', mushroom: 'produce',
  lemon: 'produce', lime: 'produce', ginger: 'produce', broccoli: 'produce',
  cabbage: 'produce', leek: 'produce', avocado: 'produce', herb: 'produce',
  basil: 'produce', parsley: 'produce', cilantro: 'produce', thyme: 'produce',
  rosemary: 'produce', mint: 'produce', chilli: 'produce',
  // pantry
  flour: 'pantry', sugar: 'pantry', salt: 'pantry', oil: 'pantry',
  rice: 'pantry', pasta: 'pantry', noodle: 'pantry', stock: 'pantry',
  broth: 'pantry', sauce: 'pantry', vinegar: 'pantry', soy: 'pantry',
  honey: 'pantry', cumin: 'pantry', paprika: 'pantry', oregano: 'pantry',
  cinnamon: 'pantry', nutmeg: 'pantry', peppercorn: 'pantry', bean: 'pantry',
  lentil: 'pantry', chickpea: 'pantry', tin: 'pantry', canned: 'pantry',
  // bakery
  bread: 'bakery', roll: 'bakery', bun: 'bakery', pita: 'bakery', tortilla: 'bakery',
}

const UNIT_ALIASES: Record<string, string> = {
  tablespoon: 'tbsp', tablespoons: 'tbsp', tbs: 'tbsp',
  teaspoon: 'tsp', teaspoons: 'tsp',
  gram: 'g', grams: 'g', kilogram: 'kg', kilograms: 'kg',
  milliliter: 'ml', milliliters: 'ml', millilitre: 'ml', millilitres: 'ml',
  liter: 'l', liters: 'l', litre: 'l', litres: 'l',
  ounce: 'oz', ounces: 'oz', pound: 'lb', pounds: 'lb',
  cup: 'cup', cups: 'cup',
  piece: 'pc', pieces: 'pc',
}

function parseFraction(str: string): number {
  const trimmed = str.trim()
  const mixed = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)$/)
  if (mixed) return +mixed[1] + +mixed[2] / +mixed[3]
  const fraction = trimmed.match(/^(\d+)\/(\d+)$/)
  if (fraction) return +fraction[1] / +fraction[2]
  return parseFloat(trimmed) || 0
}

function parseMeasure(measure: string): { amount: number; unit: string } {
  const m = measure.trim().match(/^([\d\s./]+)\s*(.*)$/)
  if (!m) return { amount: 0, unit: measure.trim().toLowerCase() }
  const amount = parseFraction(m[1])
  const rawUnit = m[2].trim().toLowerCase()
  const unit = UNIT_ALIASES[rawUnit] ?? rawUnit
  return { amount, unit }
}

function normalizeName(name: string): string {
  let n = name.toLowerCase().trim()
  // remove trailing 's' for simple plurals (tomatoes → tomato, etc.)
  if (n.length > 4 && n.endsWith('s') && !n.endsWith('ss')) {
    n = n.slice(0, -1)
  }
  return n
}

function categorize(name: string): GroceryCategory {
  const normalized = name.toLowerCase()
  for (const [keyword, category] of Object.entries(CATEGORY_MAP)) {
    if (normalized.includes(keyword)) return category
  }
  return 'other'
}

type RawItem = { name: string; amount: number; unit: string }
type AggKey = string

export function aggregateIngredients(
  slots: PlannerSlot[],
  familySize: number
): Omit<ShoppingItem, 'id' | 'userId' | 'weekStart'>[] {
  const map = new Map<AggKey, RawItem & { originalName: string }>()

  for (const slot of slots) {
    if (!slot.recipe) continue
    const scale = familySize / REFERENCE_PORTIONS

    for (const ing of slot.recipe.ingredients) {
      const normalized = normalizeName(ing.name)
      const { amount, unit } = parseMeasure(`${ing.amount} ${ing.unit}`)
      const key = `${normalized}::${unit}`
      const scaledAmount = amount * scale

      const existing = map.get(key)
      if (existing) {
        existing.amount += scaledAmount
      } else {
        map.set(key, {
          name: normalized,
          originalName: ing.name,
          amount: scaledAmount,
          unit,
        })
      }
    }
  }

  return Array.from(map.values()).map(({ originalName, amount, unit }) => ({
    ingredient: originalName,
    amount: amount > 0 ? formatAmount(amount) : null,
    unit: unit || null,
    checked: false,
    day: null,
    category: categorize(originalName),
  }))
}

function formatAmount(n: number): string {
  if (n === Math.floor(n)) return String(Math.floor(n))
  const frac = n - Math.floor(n)
  if (Math.abs(frac - 0.5) < 0.05) return n > 1 ? `${Math.floor(n)}½` : '½'
  if (Math.abs(frac - 0.25) < 0.05) return n > 1 ? `${Math.floor(n)}¼` : '¼'
  if (Math.abs(frac - 0.75) < 0.05) return n > 1 ? `${Math.floor(n)}¾` : '¾'
  return n.toFixed(1)
}

export function groupByCategory(
  items: ShoppingItem[]
): Partial<Record<GroceryCategory, ShoppingItem[]>> {
  const result: Partial<Record<GroceryCategory, ShoppingItem[]>> = {}
  for (const item of items) {
    if (!result[item.category]) result[item.category] = []
    result[item.category]!.push(item)
  }
  return result
}
