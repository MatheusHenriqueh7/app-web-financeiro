import { CATEGORY_COLORS, CATEGORY_ICONS } from '../../types'
import type { Expense, Category } from '../../types'

interface Props {
  expenses: Expense[]
  totalSpent: number
}

export function CategoryBreakdown({ expenses, totalSpent }: Props) {
  const byCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + Number(e.amount)
    return acc
  }, {})

  const sorted = Object.entries(byCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)

  if (sorted.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 dark:text-gray-600 text-sm">
        Sem dados para exibir
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {sorted.map(([category, amount]) => {
        const pct   = totalSpent > 0 ? (amount / totalSpent) * 100 : 0
        const color = CATEGORY_COLORS[category as Category] ?? '#6b7280'
        const icon  = CATEGORY_ICONS[category as Category]  ?? '📦'
        return (
          <li key={category}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-sm">{icon}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{category}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
                  {amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 w-8 text-right">
                  {pct.toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
