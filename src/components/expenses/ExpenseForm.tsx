import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { PAYMENT_METHODS } from '../../types'
import { useCategoryNames } from '../../hooks/useCategoryNames'
import type { Expense, ExpenseFormData } from '../../types'

const schema = z.object({
  description:    z.string().min(1, 'Descrição obrigatória').max(100),
  amount:         z.string().min(1, 'Valor obrigatório'),
  category:       z.string().min(1),
  payment_method: z.string().min(1),
  date:           z.string().min(1, 'Data obrigatória'),
  notes:          z.string().optional(),
})

type FormFields = z.infer<typeof schema>

const INSTALLMENT_OPTIONS = Array.from({ length: 23 }, (_, i) => {
  const n = i + 2
  return { value: String(n), label: `${n}x` }
})

interface Props {
  initial?: Expense
  onSubmit: (data: ExpenseFormData) => Promise<void>
  onCancel: () => void
}

export function ExpenseForm({ initial, onSubmit, onCancel }: Props) {
  const categories = useCategoryNames()
  const [isInstallment, setIsInstallment] = useState(false)
  const [installmentCount, setInstallmentCount] = useState(2)

  const isEditing = Boolean(initial)
  const existingInstallment = initial && initial.installment_count > 1

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
    defaultValues: initial
      ? {
          description:    initial.description,
          amount:         String(initial.amount),
          category:       initial.category,
          payment_method: initial.payment_method,
          date:           initial.date,
          notes:          initial.notes ?? '',
        }
      : {
          amount:         '',
          date:           format(new Date(), 'yyyy-MM-dd'),
          category:       'Outros',
          payment_method: 'Pix',
        },
  })

  const handleFormSubmit = async (fields: FormFields) => {
    const amount = parseFloat(fields.amount.replace(',', '.'))
    if (isNaN(amount) || amount <= 0) return
    await onSubmit({
      description:       fields.description,
      amount,
      category:          fields.category,
      payment_method:    fields.payment_method as ExpenseFormData['payment_method'],
      date:              fields.date,
      notes:             fields.notes,
      installment_count: (!isEditing && isInstallment) ? installmentCount : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label="Descrição"
        placeholder="Ex: Almoço restaurante"
        error={errors.description?.message}
        {...register('description')}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Valor (R$)"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0,00"
          error={errors.amount?.message}
          {...register('amount')}
        />
        <Input
          label="Data"
          type="date"
          error={errors.date?.message}
          {...register('date')}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Categoria"
          options={categories.map(c => ({ value: c, label: c }))}
          error={errors.category?.message}
          {...register('category')}
        />
        <Select
          label="Pagamento"
          options={PAYMENT_METHODS.map(p => ({ value: p, label: p }))}
          error={errors.payment_method?.message}
          {...register('payment_method')}
        />
      </div>

      {/* Parcelamento */}
      {existingInstallment ? (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            Parcela {initial.installment_index}/{initial.installment_count}
          </span>
          <span className="text-xs text-indigo-500 dark:text-indigo-400">
            · Editando apenas esta parcela
          </span>
        </div>
      ) : !isEditing ? (
        <div className="space-y-2">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isInstallment}
              onChange={e => setIsInstallment(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-brand-500 focus:ring-brand-500 accent-brand-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Parcelado?</span>
          </label>

          {isInstallment && (
            <div className="flex items-center gap-3 pl-6">
              <Select
                label="Número de parcelas"
                options={INSTALLMENT_OPTIONS}
                value={String(installmentCount)}
                onChange={e => setInstallmentCount(Number(e.target.value))}
                className="w-36"
              />
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-5">
                {installmentCount} lançamentos serão criados automaticamente
              </p>
            </div>
          )}
        </div>
      ) : null}

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Observações <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <textarea
          className="w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors resize-none"
          rows={2}
          placeholder="Anotações adicionais..."
          {...register('notes')}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" loading={isSubmitting} className="flex-1">
          {initial ? 'Salvar' : isInstallment ? `Parcelar em ${installmentCount}x` : 'Adicionar'}
        </Button>
      </div>
    </form>
  )
}
