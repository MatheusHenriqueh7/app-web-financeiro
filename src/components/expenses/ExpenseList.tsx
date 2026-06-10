import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Pencil, Trash2, MoreVertical } from 'lucide-react'
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../../types'
import type { Expense, Category } from '../../types'

interface Props {
  expenses: Expense[]
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
  compact?: boolean
}

function PaymentBadge({ method }: { method: string }) {
  const color =
    method === 'Crédito' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
    method === 'Débito'  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                           'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${color}`}>
      {method}
    </span>
  )
}

function ActionMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 w-36 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 overflow-hidden">
            <button
              onClick={() => { onEdit(); setOpen(false) }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Pencil className="w-3.5 h-3.5" /> Editar
            </button>
            <button
              onClick={() => { onDelete(); setOpen(false) }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="w-3.5 h-3.5" /> Excluir
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export function ExpenseList({ expenses, onEdit, onDelete, compact = false }: Props) {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 dark:text-gray-600">
        <p className="text-3xl mb-2">💸</p>
        <p className="text-sm">Nenhum gasto registrado</p>
      </div>
    )
  }

  return (
    <ul className="divide-y divide-gray-50 dark:divide-gray-800">
      {expenses.map(expense => {
        const color = CATEGORY_COLORS[expense.category as Category] ?? '#6b7280'
        const icon  = CATEGORY_ICONS[expense.category as Category]  ?? '📦'
        return (
          <li key={expense.id} className="flex items-center gap-3 py-3 group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
              style={{ backgroundColor: color + '20' }}
            >
              {icon}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {expense.description}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {expense.category}
                </span>
                {!compact && (
                  <>
                    <span className="text-gray-200 dark:text-gray-700">·</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {format(parseISO(expense.date), "d 'de' MMM", { locale: ptBR })}
                    </span>
                    <span className="text-gray-200 dark:text-gray-700">·</span>
                    <PaymentBadge method={expense.payment_method} />
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                {Number(expense.amount).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </span>
              {!compact && (
                <ActionMenu onEdit={() => onEdit(expense)} onDelete={() => onDelete(expense.id)} />
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
