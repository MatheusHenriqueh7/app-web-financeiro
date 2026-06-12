export type Category = string
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

export interface CategoryLimit {
  id: string
  user_id: string
  name: string
  icon: string
  color: string
  monthly_limit: number
  is_custom: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface RecurringExpense {
  id: string
  user_id: string
  description: string
  amount: number
  category: string
  payment_method: string
  active: boolean
  created_at: string
  updated_at: string
}

export const DEFAULT_CATEGORIES = [
  'Alimentação',
  'Lazer',
  'Transporte',
  'Moradia',
  'Saúde',
  'Educação',
  'Roupas',
  'Assinaturas',
  'Outros',
] as const

export const CATEGORIES: string[] = [...DEFAULT_CATEGORIES]

export const PAYMENT_METHODS: PaymentMethod[] = ['Débito', 'Crédito', 'Pix']

export const CATEGORY_COLORS: Record<string, string> = {
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

export const CATEGORY_ICONS: Record<string, string> = {
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

export const DEFAULT_CATEGORY_SEEDS: Omit<CategoryLimit, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = [
  { name: 'Alimentação', icon: '🍔', color: '#f97316', monthly_limit: 0, is_custom: false, sort_order: 0 },
  { name: 'Lazer',       icon: '🎮', color: '#a855f7', monthly_limit: 0, is_custom: false, sort_order: 1 },
  { name: 'Transporte',  icon: '🚗', color: '#3b82f6', monthly_limit: 0, is_custom: false, sort_order: 2 },
  { name: 'Moradia',     icon: '🏠', color: '#14b8a6', monthly_limit: 0, is_custom: false, sort_order: 3 },
  { name: 'Saúde',       icon: '❤️', color: '#ef4444', monthly_limit: 0, is_custom: false, sort_order: 4 },
  { name: 'Educação',    icon: '📚', color: '#eab308', monthly_limit: 0, is_custom: false, sort_order: 5 },
  { name: 'Roupas',      icon: '👕', color: '#ec4899', monthly_limit: 0, is_custom: false, sort_order: 6 },
  { name: 'Assinaturas', icon: '📱', color: '#6366f1', monthly_limit: 0, is_custom: false, sort_order: 7 },
  { name: 'Outros',      icon: '📦', color: '#6b7280', monthly_limit: 0, is_custom: false, sort_order: 8 },
]

export const PRESET_COLORS = [
  '#f97316', '#ef4444', '#ec4899', '#a855f7',
  '#6366f1', '#3b82f6', '#14b8a6', '#10b981',
  '#eab308', '#6b7280', '#f59e0b', '#84cc16',
]
