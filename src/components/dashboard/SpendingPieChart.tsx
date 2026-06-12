import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { Expense, CategoryLimit } from '../../types'
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../../types'

interface Props {
  expenses: Expense[]
  categoryLimits: CategoryLimit[]
  totalSpent: number
}

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: { name: string; value: number; color: string } }[] }) => {
  if (!active || !payload?.length) return null
  const { name, value, color } = payload[0].payload
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl px-3 py-2 shadow-lg border border-gray-100 dark:border-gray-700 text-xs">
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="font-medium text-gray-800 dark:text-gray-200">{name}</span>
      </div>
      <p className="mt-0.5 font-bold text-gray-900 dark:text-white">{fmt(value)}</p>
    </div>
  )
}

export function SpendingPieChart({ expenses, categoryLimits, totalSpent }: Props) {
  const colorMap: Record<string, string> = {}
  const iconMap: Record<string, string> = {}
  for (const cl of categoryLimits) {
    colorMap[cl.name] = cl.color
    iconMap[cl.name] = cl.icon
  }

  const byCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + Number(e.amount)
    return acc
  }, {})

  const data = Object.entries(byCategory)
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({
      name,
      value,
      color: colorMap[name] ?? CATEGORY_COLORS[name] ?? '#6b7280',
      icon:  iconMap[name]  ?? CATEGORY_ICONS[name]  ?? '📦',
    }))

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-8 text-gray-400 dark:text-gray-600 text-sm">
        Sem dados para exibir
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs text-gray-400 dark:text-gray-500">Total</span>
          <span className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
            {fmt(totalSpent)}
          </span>
        </div>
      </div>

      {/* Legend */}
      <ul className="space-y-2">
        {data.slice(0, 6).map(({ name, value, color, icon }) => {
          const pct = totalSpent > 0 ? (value / totalSpent) * 100 : 0
          return (
            <li key={name} className="flex items-center gap-2">
              <span className="text-sm leading-none">{icon}</span>
              <span className="flex-1 text-xs text-gray-600 dark:text-gray-400 truncate">{name}</span>
              <span className="text-xs font-semibold text-gray-900 dark:text-white tabular-nums">{fmt(value)}</span>
              <span
                className="text-xs font-medium w-8 text-right tabular-nums"
                style={{ color }}
              >
                {pct.toFixed(0)}%
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
