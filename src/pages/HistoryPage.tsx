import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Search, Receipt, ListChecks, Trophy } from 'lucide-react'
import { useExpenses } from '../hooks/useExpenses'
import { useCategoryNames } from '../hooks/useCategoryNames'
import { ExpenseList } from '../components/expenses/ExpenseList'
import { ExpenseModal } from '../components/expenses/ExpenseModal'
import { Select } from '../components/ui/Select'
import { PAYMENT_METHODS } from '../types'
import type { Expense, ExpenseFormData } from '../types'

type TypeFilter = 'all' | 'fixo' | 'parcelado' | 'normal'

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: 'all',       label: 'Todos os tipos' },
  { value: 'normal',    label: 'Normal' },
  { value: 'fixo',      label: 'Fixo' },
  { value: 'parcelado', label: 'Parcelado' },
]

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function expenseType(e: Expense): TypeFilter {
  if (e.recurring_expense_id) return 'fixo'
  if (e.installment_count > 1) return 'parcelado'
  return 'normal'
}

function SummaryCard({
  icon,
  title,
  value,
  subtitle,
  colorClass,
}: {
  icon: React.ReactNode
  title: string
  value: string
  subtitle: string
  colorClass: string
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">{value}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">{subtitle}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export function HistoryPage() {
  const now = new Date()
  const [year, setYear]   = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [search, setSearch]                 = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterPayment, setFilterPayment]   = useState('all')
  const [filterType, setFilterType]         = useState<TypeFilter>('all')
  const [modalOpen, setModalOpen]           = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>()

  const categories = useCategoryNames()
  const { expenses, loading, updateExpense, deleteExpense } = useExpenses(year, month)

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  const filtered = useMemo(() => expenses.filter(e => {
    const matchSearch   = e.description.toLowerCase().includes(search.toLowerCase())
    const matchCategory = filterCategory === 'all' || e.category === filterCategory
    const matchPayment  = filterPayment  === 'all' || e.payment_method === filterPayment
    const matchType     = filterType     === 'all' || expenseType(e) === filterType
    return matchSearch && matchCategory && matchPayment && matchType
  }), [expenses, search, filterCategory, filterPayment, filterType])

  const totalFiltered = filtered.reduce((s, e) => s + Number(e.amount), 0)
  const biggest = filtered.reduce<Expense | undefined>(
    (max, e) => (!max || Number(e.amount) > Number(max.amount)) ? e : max,
    undefined
  )

  const handleUpdate = async (data: ExpenseFormData) => {
    if (editingExpense) await updateExpense(editingExpense.id, data)
  }
  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setModalOpen(true)
  }
  const handleDelete = async (id: string) => {
    if (window.confirm('Excluir este gasto?')) await deleteExpense(id, 'single')
  }
  const handleDeleteFuture = async (id: string) => {
    const expense = expenses.find(e => e.id === id)
    if (!expense) return
    const remaining = expense.installment_count - expense.installment_index + 1
    if (window.confirm(`Excluir a parcela ${expense.installment_index}/${expense.installment_count} e as ${remaining - 1} futuras de "${expense.description}"?`)) {
      await deleteExpense(id, 'future')
    }
  }
  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingExpense(undefined)
  }

  const monthLabel = format(new Date(year, month - 1), 'MMMM yyyy', { locale: ptBR })

  return (
    <>
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white capitalize min-w-[160px] text-center">
            {monthLabel}
          </h1>
          <button onClick={nextMonth} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryCard
            title="Total no período"
            value={formatCurrency(totalFiltered)}
            subtitle={`${filtered.length} de ${expenses.length} gasto${expenses.length !== 1 ? 's' : ''} no mês`}
            icon={<Receipt className="w-5 h-5 text-rose-600" />}
            colorClass="bg-rose-50 dark:bg-rose-900/20"
          />
          <SummaryCard
            title="Transações"
            value={String(filtered.length)}
            subtitle={filtered.length === 1 ? 'gasto encontrado' : 'gastos encontrados'}
            icon={<ListChecks className="w-5 h-5 text-brand-600" />}
            colorClass="bg-brand-50 dark:bg-brand-900/20"
          />
          <SummaryCard
            title="Maior gasto"
            value={biggest ? formatCurrency(Number(biggest.amount)) : formatCurrency(0)}
            subtitle={biggest ? biggest.description : 'Nenhum gasto no período'}
            icon={<Trophy className="w-5 h-5 text-violet-600" />}
            colorClass="bg-violet-50 dark:bg-violet-900/20"
          />
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Pesquisar por nome ou descrição..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              options={[
                { value: 'all', label: 'Todas categorias' },
                ...categories.map(c => ({ value: c, label: c })),
              ]}
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
            />
            <Select
              options={[
                { value: 'all', label: 'Todos pagamentos' },
                ...PAYMENT_METHODS.map(p => ({ value: p, label: p })),
              ]}
              value={filterPayment}
              onChange={e => setFilterPayment(e.target.value)}
            />
            <Select
              options={TYPE_OPTIONS}
              value={filterType}
              onChange={e => setFilterType(e.target.value as TypeFilter)}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-5 py-2">
          {loading ? (
            <div className="space-y-4 py-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-2/3" />
                    <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded w-1/3" />
                  </div>
                  <div className="h-4 w-20 bg-gray-100 dark:bg-gray-800 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <ExpenseList
              expenses={filtered}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDeleteGroup={handleDeleteFuture}
              showTypeTag
              futureMode
            />
          )}
        </div>
      </div>

      <ExpenseModal
        open={modalOpen}
        onClose={handleCloseModal}
        expense={editingExpense}
        onSubmit={handleUpdate}
      />
    </>
  )
}
