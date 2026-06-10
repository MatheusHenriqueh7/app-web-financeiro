export type Category =
  | 'Alimentação'
  | 'Lazer'
  | 'Transporte'
  | 'Moradia'
  | 'Saúde'
  | 'Educação'
  | 'Roupas'
  | 'Assinaturas'
  | 'Outros'

export type PaymentMethod = 'Débito' | 'Crédito' | 'Pix'

export interface Profile {
  id: string
  email: string | null
  name: string | null
  monthly_income: number
  created_at: string
  updated_at: string
}

export interface Expense {
  id: string
  user_id: string
  description: string
  amount: number
  category: Category
  payment_method: PaymentMethod
  date: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ExpenseFormData {
  description: string
  amount: number
  category: Category
  payment_method: PaymentMethod
  date: string
  notes?: string
}

export const CATEGORIES: Category[] = [
  'Alimentação',
  'Lazer',
  'Transporte',
  'Moradia',
  'Saúde',
  'Educação',
  'Roupas',
  'Assinaturas',
  'Outros',
]

export const PAYMENT_METHODS: PaymentMethod[] = ['Débito', 'Crédito', 'Pix']

export const CATEGORY_COLORS: Record<Category, string> = {
  Alimentação:  '#f97316',
  Lazer:        '#a855f7',
  Transporte:   '#3b82f6',
  Moradia:      '#14b8a6',
  Saúde:        '#ef4444',
  Educação:     '#eab308',
  Roupas:       '#ec4899',
  Assinaturas:  '#6366f1',
  Outros:       '#6b7280',
}

export const CATEGORY_ICONS: Record<Category, string> = {
  Alimentação:  '🍔',
  Lazer:        '🎮',
  Transporte:   '🚗',
  Moradia:      '🏠',
  Saúde:        '❤️',
  Educação:     '📚',
  Roupas:       '👕',
  Assinaturas:  '📱',
  Outros:       '📦',
}
