import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ReactNode } from 'react'
import { User, DollarSign, Palette, RefreshCw, Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import { useProfile } from '../hooks/useProfile'
import { useTheme } from '../contexts/ThemeContext'
import { useRecurringExpenses } from '../hooks/useRecurringExpenses'
import { useCategoryNames } from '../hooks/useCategoryNames'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Button } from '../components/ui/Button'
import { PAYMENT_METHODS } from '../types'
import type { RecurringExpense } from '../types'
import type { RecurringExpenseFormData } from '../hooks/useRecurringExpenses'

const profileSchema = z.object({
  name:           z.string().min(2, 'Nome obrigatório'),
  monthly_income: z.string().min(1, 'Informe sua renda'),
})
type ProfileFields = z.infer<typeof profileSchema>

function Section({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50 dark:border-gray-800">
        <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400">
          {icon}
        </div>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

const emptyForm: RecurringExpenseFormData = {
  description:    '',
  amount:         0,
  category:       'Outros',
  payment_method: 'Débito',
}

function RecurringExpensesSection() {
  const { expenses, totalFixed, loading, add, update, remove, toggleActive } = useRecurringExpenses()
  const categories = useCategoryNames()

  const [showForm, setShowForm]             = useState(false)
  const [editingId, setEditingId]           = useState<string | null>(null)
  const [form, setForm]                     = useState<RecurringExpenseFormData & { amountStr: string }>({
    ...emptyForm, amountStr: '',
  })

  const handleOpen = (exp?: RecurringExpense) => {
    if (exp) {
      setEditingId(exp.id)
      setForm({ description: exp.description, amount: exp.amount, category: exp.category, payment_method: exp.payment_method, amountStr: String(exp.amount) })
    } else {
      setEditingId(null)
      setForm({ ...emptyForm, amountStr: '', category: categories[0] ?? 'Outros' })
    }
    setShowForm(true)
  }

  const handleClose = () => { setShowForm(false); setEditingId(null) }

  const handleSave = async () => {
    if (!form.description.trim()) return
    const amount = parseFloat(form.amountStr.replace(',', '.'))
    if (isNaN(amount) || amount <= 0) return
    const data = { description: form.description.trim(), amount, category: form.category, payment_method: form.payment_method }
    if (editingId) {
      await update(editingId, data)
    } else {
      await add(data)
    }
    handleClose()
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Excluir este gasto fixo?')) await remove(id)
  }

  return (
    <Section icon={<RefreshCw className="w-4 h-4" />} title="Gastos Fixos Mensais">
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-gray-50 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : expenses.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-2">
            Nenhum gasto fixo cadastrado
          </p>
        ) : (
          <ul className="space-y-2">
            {expenses.map(exp => (
              <li
                key={exp.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                  exp.active
                    ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700'
                    : 'bg-gray-50/50 dark:bg-gray-800/20 border-gray-100/50 dark:border-gray-700/50 opacity-60'
                }`}
              >
                {/* Toggle */}
                <button
                  onClick={() => toggleActive(exp.id, !exp.active)}
                  className={`relative w-9 h-5 rounded-full flex-shrink-0 transition-colors ${exp.active ? 'bg-brand-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                  title={exp.active ? 'Desativar' : 'Ativar'}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${exp.active ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{exp.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{exp.category} · {exp.payment_method}</p>
                </div>

                <span className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums flex-shrink-0">
                  {Number(exp.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <button onClick={() => handleOpen(exp)} className="p-1.5 text-gray-400 hover:text-brand-500 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(exp.id)} className="p-1.5 text-gray-400 hover:text-rose-500 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Total */}
        {totalFixed > 0 && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
            <span className="text-xs text-gray-500 dark:text-gray-400">Total fixo mensal</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {totalFixed.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        )}

        {/* Add form */}
        {showForm ? (
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3 bg-gray-50 dark:bg-gray-800/50">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {editingId ? 'Editar gasto fixo' : 'Novo gasto fixo'}
            </p>
            <Input
              label="Descrição"
              placeholder="Ex: Faculdade, Netflix, Seguro..."
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Valor (R$)"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0,00"
                value={form.amountStr}
                onChange={e => setForm(p => ({ ...p, amountStr: e.target.value, amount: parseFloat(e.target.value) || 0 }))}
              />
              <Select
                label="Pagamento"
                options={PAYMENT_METHODS.map(p => ({ value: p, label: p }))}
                value={form.payment_method}
                onChange={e => setForm(p => ({ ...p, payment_method: e.target.value }))}
              />
            </div>
            <Select
              label="Categoria"
              options={categories.map(c => ({ value: c, label: c }))}
              value={form.category}
              onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
            />
            <div className="flex gap-2 pt-1">
              <Button variant="secondary" size="sm" onClick={handleClose} className="flex-1">
                <X className="w-3.5 h-3.5" /> Cancelar
              </Button>
              <Button size="sm" onClick={handleSave} className="flex-1">
                <Check className="w-3.5 h-3.5" /> Salvar
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => handleOpen()}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 hover:border-brand-400 hover:text-brand-600 dark:hover:border-brand-500 dark:hover:text-brand-400 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adicionar gasto fixo
          </button>
        )}
      </div>
    </Section>
  )
}

export function SettingsPage() {
  const { profile, loading, updateProfile } = useProfile()
  const { theme, toggleTheme } = useTheme()
  const [saved, setSaved] = useState(false)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm<ProfileFields>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', monthly_income: '0' },
  })

  useEffect(() => {
    if (profile) {
      reset({
        name:           profile.name ?? '',
        monthly_income: String(profile.monthly_income ?? 0),
      })
    }
  }, [profile, reset])

  const onSubmit = async (fields: ProfileFields) => {
    const monthly_income = parseFloat(fields.monthly_income.replace(',', '.')) || 0
    const { error } = await updateProfile({ name: fields.name, monthly_income })
    if (!error) {
      setSaved(true)
      reset(fields)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  return (
    <div className="space-y-5 max-w-lg">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Ajustes</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Personalize sua conta</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Section icon={<User className="w-4 h-4" />} title="Perfil">
          <Input
            label="Nome"
            placeholder="Seu nome"
            disabled={loading}
            error={errors.name?.message}
            {...register('name')}
          />
        </Section>

        <Section icon={<DollarSign className="w-4 h-4" />} title="Finanças">
          <div className="space-y-3">
            <Input
              label="Renda mensal (R$)"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              disabled={loading}
              error={errors.monthly_income?.message}
              {...register('monthly_income')}
            />
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Usada para calcular o saldo disponível no dashboard.
            </p>
          </div>
        </Section>

        {saved && (
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
            <p className="text-sm text-emerald-700 dark:text-emerald-400">Configurações salvas!</p>
          </div>
        )}

        <Button type="submit" loading={isSubmitting} disabled={!isDirty} className="w-full" size="lg">
          Salvar alterações
        </Button>
      </form>

      {/* Recurring expenses section (outside the profile form) */}
      <RecurringExpensesSection />

      <Section icon={<Palette className="w-4 h-4" />} title="Aparência">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Tema</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Atualmente: {theme === 'dark' ? 'Escuro' : 'Claro'}
            </p>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className={`relative w-12 h-6 rounded-full transition-colors ${theme === 'dark' ? 'bg-brand-600' : 'bg-gray-200'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>
      </Section>
    </div>
  )
}
