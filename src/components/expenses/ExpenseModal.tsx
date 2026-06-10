import { Modal } from '../ui/Modal'
import { ExpenseForm } from './ExpenseForm'
import type { Expense, ExpenseFormData } from '../../types'

interface Props {
  open: boolean
  onClose: () => void
  expense?: Expense
  onSubmit: (data: ExpenseFormData) => Promise<void>
}

export function ExpenseModal({ open, onClose, expense, onSubmit }: Props) {
  const title = expense ? 'Editar gasto' : 'Novo gasto'

  const handleSubmit = async (data: ExpenseFormData) => {
    await onSubmit(data)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <ExpenseForm initial={expense} onSubmit={handleSubmit} onCancel={onClose} />
    </Modal>
  )
}
