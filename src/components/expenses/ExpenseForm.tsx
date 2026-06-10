import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { CATEGORIES, PAYMENT_METHODS } from '../../types'
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

interface Props {
  initial?: Expense
  onSubmit: (data: ExpenseFormData) => Promise<void>
  onCancel: () => void
}

export function ExpenseForm({ initial, onSubmit, onCancel }: Props) {
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
      description:    fields.description,
      amount,
      category:       fields.category as ExpenseFormData['category'],
      payment_method: fields.payment_method as ExpenseFormData['payment_method'],
      date:           fields.date,
      notes:          fields.notes,
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
          options={CATEGORIES.map(c => ({ value: c, label: c }))}
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

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Observações <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <textarea
          className="w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors resize-none"
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
          {initial ? 'Salvar' : 'Adicionar'}
        </Button>
      </div>
    </form>
  )
}
