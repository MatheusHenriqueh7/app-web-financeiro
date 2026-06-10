import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react'
import { useExpenses } from '../hooks/useExpenses'
import { ExpenseList } from '../components/expenses/ExpenseList'
import { ExpenseModal } from '../components/expenses/ExpenseModal'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Select'
import { CATEGORIES, PAYMENT_METHODS } from '../types'
import type { Expense, ExpenseFormData } from '../types'

export function ExpensesPage() {
  const now = new Date()
  const [year, setYear]   = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [search, setSearch]             = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterPayment, setFilterPayment]   = useState<string>('all')
  const [modalOpen, setModalOpen]           = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>()

  const { expenses, loading, addExpense, updateExpense, deleteExpense } = useExpenses(year, month)

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  const filtered = expenses.filter(e => {
    const matchSearch   = e.description.toLowerCase().includes(search.toLowerCase())
    const matchCategory = filterCategory === 'all' || e.category === filterCategory
    const matchPayment  = filterPayment  === 'all' || e.payment_method === filterPayment
    return matchSearch && matchCategory && matchPayment
  })

  const handleAdd    = async (data: ExpenseFormData) => { await addExpense(data) }
  const handleUpdate = async (data: ExpenseFormData) => {
    if (editingExpense) await updateExpense(editingExpense.id, data)
  }
  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setModalOpen(true)
  }
  const handleDelete = async (id: string) => {
    if (window.confirm('Excluir este gasto?')) await deleteExpense(id)
  }
  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingExpense(undefined)
  }

  const monthLabel = format(new Date(year, month - 1), 'MMMM yyyy', { locale: ptBR })

  return (
    <>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
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
          <Button onClick={() => { setEditingExpense(undefined); setModalOpen(true) }}>
            <Plus className="w-4 h-4" />
            Novo gasto
          </Button>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Pesquisar gastos..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
              />
            </div>
            <Select
              options={[
                { value: 'all', label: 'Todas categorias' },
                ...CATEGORIES.map(c => ({ value: c, label: c })),
              ]}
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="sm:w-44"
            />
            <Select
              options={[
                { value: 'all', label: 'Todos pagamentos' },
                ...PAYMENT_METHODS.map(p => ({ value: p, label: p })),
              ]}
              value={filterPayment}
              onChange={e => setFilterPayment(e.target.value)}
              className="sm:w-44"
            />
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filtered.length} gasto{filtered.length !== 1 ? 's' : ''}
            {filtered.length !== expenses.length && ` (de ${expenses.length})`}
          </p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {filtered.reduce((s, e) => s + Number(e.amount), 0).toLocaleString('pt-BR', {
              style: 'currency', currency: 'BRL',
            })}
          </p>
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
            <ExpenseList expenses={filtered} onEdit={handleEdit} onDelete={handleDelete} />
          )}
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
