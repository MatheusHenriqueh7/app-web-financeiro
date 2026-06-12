import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2, Check, X, Sparkles } from 'lucide-react'
import { useCategoryLimits } from '../hooks/useCategoryLimits'
import { useExpenses } from '../hooks/useExpenses'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { PRESET_COLORS } from '../types'
import type { CategoryLimit } from '../types'

function ProgressBar({ spent, limit }: { spent: number; limit: number }) {
  if (limit === 0) {
    return (
      <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <div className="h-full w-full rounded-full bg-gray-200 dark:bg-gray-700" />
      </div>
    )
  }
  const pct = Math.min((spent / limit) * 100, 100)
  const colorClass =
    spent >= limit
      ? 'bg-rose-500'
      : spent >= limit * 0.8
      ? 'bg-amber-500'
      : 'bg-emerald-500'
  return (
    <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${colorClass}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

interface NewCategoryState {
  name: string
  icon: string
  color: string
  monthly_limit: string
}

export function CategoriesPage() {
  const now = new Date()
  const [year, setYear]   = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const { categories, loading, updateLimit, updateCategory, addCustomCategory, deleteCustomCategory, seedDefaultCategories } = useCategoryLimits()
  const { expenses } = useExpenses(year, month)

  const [editingLimitId, setEditingLimitId]   = useState<string | null>(null)
  const [limitInput, setLimitInput]           = useState('')
  const [editingNameId, setEditingNameId]     = useState<string | null>(null)
  const [nameInput, setNameInput]             = useState('')
  const [iconInput, setIconInput]             = useState('')
  const [showNewModal, setShowNewModal]       = useState(false)
  const [newCat, setNewCat]                   = useState<NewCategoryState>({ name: '', icon: '📦', color: '#6366f1', monthly_limit: '' })
  const [saving, setSaving]                   = useState(false)
  const [seeding, setSeeding]                 = useState(false)

  const handleSeedDefaults = async () => {
    setSeeding(true)
    await seedDefaultCategories()
    setSeeding(false)
  }

  const spentByCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + Number(e.amount)
    return acc
  }, {})

  const prevMonth = () => { if (month === 1) { setYear(y => y - 1); setMonth(12) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 12) { setYear(y => y + 1); setMonth(1) } else setMonth(m => m + 1) }
  const monthLabel = format(new Date(year, month - 1), 'MMMM yyyy', { locale: ptBR })

  const handleLimitEdit = (cat: CategoryLimit) => {
    setEditingLimitId(cat.id)
    setLimitInput(cat.monthly_limit === 0 ? '' : String(cat.monthly_limit))
  }
  const handleLimitSave = async (id: string) => {
    const val = parseFloat(limitInput.replace(',', '.'))
    await updateLimit(id, isNaN(val) || val < 0 ? 0 : val)
    setEditingLimitId(null)
  }
  const handleLimitCancel = () => setEditingLimitId(null)

  const handleNameEdit = (cat: CategoryLimit) => {
    setEditingNameId(cat.id)
    setNameInput(cat.name)
    setIconInput(cat.icon)
  }
  const handleNameSave = async (id: string) => {
    if (nameInput.trim()) await updateCategory(id, { name: nameInput.trim(), icon: iconInput || '📦' })
    setEditingNameId(null)
  }
  const handleNameCancel = () => setEditingNameId(null)

  const handleAddCategory = async () => {
    if (!newCat.name.trim()) return
    setSaving(true)
    const limit = parseFloat(newCat.monthly_limit.replace(',', '.'))
    await addCustomCategory(newCat.name.trim(), newCat.icon || '📦', newCat.color, isNaN(limit) ? 0 : limit)
    setNewCat({ name: '', icon: '📦', color: '#6366f1', monthly_limit: '' })
    setShowNewModal(false)
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Excluir categoria? Os gastos existentes não serão afetados.')) {
      await deleteCustomCategory(id)
    }
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Categorias</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Limites mensais por categoria</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <button onClick={prevMonth} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize min-w-[120px] text-center">
                {monthLabel}
              </span>
              <button onClick={nextMonth} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <Button size="sm" onClick={() => setShowNewModal(true)}>
              <Plus className="w-3.5 h-3.5" />
              Nova
            </Button>
          </div>
        </div>

        {/* Category grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800" />
                  <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-24" />
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full" />
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-5">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-brand-500" />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-gray-900 dark:text-white">Nenhuma categoria encontrada</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Crie as categorias padrão ou adicione a sua própria.</p>
            </div>
            <Button onClick={handleSeedDefaults} loading={seeding}>
              <Sparkles className="w-4 h-4" />
              Criar categorias padrão
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(cat => {
              const spent = spentByCategory[cat.name] ?? 0
              const pct   = cat.monthly_limit > 0 ? Math.min((spent / cat.monthly_limit) * 100, 100) : 0
              const isOverLimit  = cat.monthly_limit > 0 && spent >= cat.monthly_limit
              const isNearLimit  = cat.monthly_limit > 0 && spent >= cat.monthly_limit * 0.8 && !isOverLimit
              const isEditingLimit = editingLimitId === cat.id
              const isEditingName  = editingNameId  === cat.id

              return (
                <div
                  key={cat.id}
                  className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow group"
                >
                  {/* Header row */}
                  <div className="flex items-start gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ backgroundColor: cat.color + '20' }}
                    >
                      {isEditingName ? (
                        <input
                          type="text"
                          value={iconInput}
                          onChange={e => setIconInput(e.target.value)}
                          className="w-8 h-8 text-center text-xl bg-transparent outline-none"
                          maxLength={2}
                        />
                      ) : (
                        cat.icon
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {isEditingName ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            autoFocus
                            type="text"
                            value={nameInput}
                            onChange={e => setNameInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleNameSave(cat.id); if (e.key === 'Escape') handleNameCancel() }}
                            className="flex-1 text-sm font-semibold bg-transparent border-b border-gray-300 dark:border-gray-600 outline-none text-gray-900 dark:text-white pb-0.5"
                          />
                          <button onClick={() => handleNameSave(cat.id)} className="text-emerald-500 hover:text-emerald-600">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={handleNameCancel} className="text-gray-400 hover:text-gray-600">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{cat.name}</p>
                          <button
                            onClick={() => handleNameEdit(cat)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
                            title="Editar nome"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {/* Alert badges */}
                      {isOverLimit && (
                        <span className="text-xs font-medium text-rose-500">Limite ultrapassado</span>
                      )}
                      {isNearLimit && (
                        <span className="text-xs font-medium text-amber-500">Próximo do limite</span>
                      )}
                    </div>

                    {cat.is_custom && (
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-300 hover:text-rose-500 dark:text-gray-600 dark:hover:text-rose-400 flex-shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Progress bar */}
                  <ProgressBar spent={spent} limit={cat.monthly_limit} />

                  {/* Amounts row */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {spent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                      {cat.monthly_limit > 0 && (
                        <span>
                          {' / '}
                          {cat.monthly_limit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      )}
                    </div>

                    {/* Edit limit */}
                    {isEditingLimit ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400">R$</span>
                        <input
                          autoFocus
                          type="number"
                          min="0"
                          step="0.01"
                          value={limitInput}
                          onChange={e => setLimitInput(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleLimitSave(cat.id); if (e.key === 'Escape') handleLimitCancel() }}
                          className="w-20 text-xs text-right bg-transparent border-b border-gray-300 dark:border-gray-600 outline-none text-gray-900 dark:text-white"
                          placeholder="0,00"
                        />
                        <button onClick={() => handleLimitSave(cat.id)} className="text-emerald-500 hover:text-emerald-600">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={handleLimitCancel} className="text-gray-400 hover:text-gray-600">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleLimitEdit(cat)}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                      >
                        <Pencil className="w-3 h-3" />
                        {cat.monthly_limit === 0 ? 'Definir limite' : `${pct.toFixed(0)}%`}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* New category modal */}
      <Modal open={showNewModal} onClose={() => setShowNewModal(false)} title="Nova categoria" maxWidth="max-w-sm">
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Ícone</label>
              <input
                type="text"
                value={newCat.icon}
                onChange={e => setNewCat(p => ({ ...p, icon: e.target.value }))}
                maxLength={2}
                className="w-14 h-10 text-center text-2xl bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="flex-1">
              <Input
                label="Nome da categoria"
                placeholder="Ex: Academia"
                value={newCat.name}
                onChange={e => setNewCat(p => ({ ...p, name: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Cor</label>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setNewCat(p => ({ ...p, color: c }))}
                  className={`w-8 h-8 rounded-lg transition-transform hover:scale-110 ${newCat.color === c ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-white scale-110' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <Input
            label="Limite mensal (R$)"
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00 (opcional)"
            value={newCat.monthly_limit}
            onChange={e => setNewCat(p => ({ ...p, monthly_limit: e.target.value }))}
          />

          <div className="flex gap-3 pt-1">
            <Button variant="secondary" onClick={() => setShowNewModal(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleAddCategory} loading={saving} disabled={!newCat.name.trim()} className="flex-1">
              Criar categoria
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
