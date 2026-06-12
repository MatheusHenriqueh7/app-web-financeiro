import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, TrendingDown, TrendingUp, ArrowRight } from 'lucide-react'
import { useExpenses } from '../hooks/useExpenses'
import { useProfile } from '../hooks/useProfile'
import { useCategoryLimits } from '../hooks/useCategoryLimits'
import { useRecurringExpenses } from '../hooks/useRecurringExpenses'
import { StatsCards, FixedExpensesBanner } from '../components/dashboard/StatsCards'
import { SpendingPieChart } from '../components/dashboard/SpendingPieChart'
import { ExpenseList } from '../components/expenses/ExpenseList'
import { ExpenseModal } from '../components/expenses/ExpenseModal'
import { Button } from '../components/ui/Button'
import type { Expense, ExpenseFormData } from '../types'

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function topCategoryOf(expenses: Expense[]) {
  const map: Record<string, number> = {}
  for (const e of expenses) map[e.category] = (map[e.category] ?? 0) + Number(e.amount)
  const entries = Object.entries(map)
  if (!entries.length) return null
  const [name, total] = entries.reduce((a, b) => (b[1] > a[1] ? b : a))
  return { name, total }
}

export function DashboardPage() {
  const now = new Date()
  const [year, setYear]   = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [modalOpen, setModalOpen]           = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>()

  const prevYear  = month === 1 ? year - 1 : year
  const prevMonth = month === 1 ? 12 : month - 1

  const { profile }   = useProfile()
  const { expenses, loading, totalSpent, addExpense, updateExpense, deleteExpense } = useExpenses(year, month)
  const { expenses: prevExpenses, loading: prevLoading, totalSpent: prevTotalSpent } = useExpenses(prevYear, prevMonth)
  const { categories: categoryLimits } = useCategoryLimits()
  const { totalFixed } = useRecurringExpenses()

  const prevMonthLabel = format(new Date(prevYear, prevMonth - 1), 'MMMM', { locale: ptBR })

  const prevMonth_ = () => { if (month === 1) { setYear(y => y - 1); setMonth(12) } else setMonth(m => m - 1) }
  const nextMonth_ = () => { if (month === 12) { setYear(y => y + 1); setMonth(1) } else setMonth(m => m + 1) }

  const handleAdd    = async (data: ExpenseFormData) => { await addExpense(data) }
  const handleUpdate = async (data: ExpenseFormData) => { if (editingExpense) await updateExpense(editingExpense.id, data) }
  const handleEdit   = (expense: Expense) => { setEditingExpense(expense); setModalOpen(true) }

  const handleDelete = async (id: string) => {
    if (window.confirm('Excluir este gasto?')) await deleteExpense(id)
  }

  const handleCloseModal = () => { setModalOpen(false); setEditingExpense(undefined) }

  const monthLabel   = format(new Date(year, month - 1), 'MMMM yyyy', { locale: ptBR })
  const income       = profile?.monthly_income ?? 0
  const recentExpenses = expenses.slice(0, 5)
  const creditTotal  = expenses
    .filter(e => e.payment_method === 'Crédito')
    .reduce((sum, e) => sum + Number(e.amount), 0)

  const diffPct = prevTotalSpent > 0
    ? ((totalSpent - prevTotalSpent) / prevTotalSpent) * 100
    : null
  const topPrev = topCategoryOf(prevExpenses)

  return (
    <>
      <div className="space-y-6">
        {/* Month navigator */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white capitalize">{monthLabel}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Visão geral do mês</p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={prevMonth_} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={nextMonth_} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <StatsCards
          totalSpent={totalSpent}
          income={income}
          expenseCount={expenses.length}
          creditTotal={creditTotal}
          totalFixed={totalFixed}
        />

        {/* Fixed expenses banner */}
        <FixedExpensesBanner totalFixed={totalFixed} />

        {/* Budget progress */}
        {income > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Orçamento utilizado
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {Math.min((totalSpent / income) * 100, 100).toFixed(1)}%
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  totalSpent / income > 0.9
                    ? 'bg-rose-500'
                    : totalSpent / income > 0.7
                    ? 'bg-amber-500'
                    : 'bg-brand-500'
                }`}
                style={{ width: `${Math.min((totalSpent / income) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Comparativo mês anterior */}
        {!prevLoading && prevTotalSpent > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 capitalize">
              Comparativo com {prevMonthLabel}
            </h2>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 dark:text-gray-500 capitalize mb-0.5">{prevMonthLabel}</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(prevTotalSpent)}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 dark:text-gray-500 capitalize mb-0.5">
                  {format(new Date(year, month - 1), 'MMMM', { locale: ptBR })}
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(totalSpent)}</p>
              </div>
              {diffPct !== null && (
                <div className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-semibold flex-shrink-0 ${
                  diffPct > 0
                    ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400'
                    : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                }`}>
                  {diffPct > 0
                    ? <TrendingUp className="w-3.5 h-3.5" />
                    : <TrendingDown className="w-3.5 h-3.5" />
                  }
                  {diffPct > 0 ? '+' : ''}{diffPct.toFixed(1)}%
                </div>
              )}
            </div>
            {topPrev && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                Maior categoria em {prevMonthLabel}:{' '}
                <span className="font-medium text-gray-700 dark:text-gray-300">{topPrev.name}</span>
                {' '}· {formatCurrency(topPrev.total)}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Recent expenses */}
          <div className="lg:col-span-3 bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Gastos recentes</h2>
              <Button size="sm" onClick={() => { setEditingExpense(undefined); setModalOpen(true) }}>
                <Plus className="w-3.5 h-3.5" />
                Novo
              </Button>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
                      <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ExpenseList
                expenses={recentExpenses}
                onEdit={handleEdit}
                onDelete={handleDelete}
                compact
              />
            )}
          </div>

          {/* Pie chart */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Por categoria</h2>
            <SpendingPieChart
              expenses={expenses}
              categoryLimits={categoryLimits}
              totalSpent={totalSpent}
            />
          </div>
        </div>
      </div>

      <ExpenseModal
        open={modalOpen}
        onClose={handleCloseModal}
        expense={editingExpense}
        onSubmit={editingExpense ? handleUpdate : handleAdd}
      />
    </>
  )
}
