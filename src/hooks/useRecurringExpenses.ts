import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { RecurringExpense } from '../types'

export interface RecurringExpenseFormData {
  description: string
  amount: number
  category: string
  payment_method: string
}

export function useRecurringExpenses() {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<RecurringExpense[]>([])
  const [loading, setLoading] = useState(true)

  const fetchExpenses = useCallback(async () => {
    if (!user) { setLoading(false); return }
    const { data } = await supabase
      .from('recurring_expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at')
    setExpenses((data ?? []) as RecurringExpense[])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchExpenses() }, [fetchExpenses])

  const add = async (formData: RecurringExpenseFormData) => {
    if (!user) return { error: 'Not authenticated' }
    const { data, error } = await supabase
      .from('recurring_expenses')
      .insert({ user_id: user.id, ...formData, active: true })
      .select()
      .single()
    if (!error && data) setExpenses(prev => [...prev, data as RecurringExpense])
    return { error: error?.message ?? null }
  }

  const update = async (id: string, formData: Partial<RecurringExpenseFormData>) => {
    const { error } = await supabase
      .from('recurring_expenses')
      .update({ ...formData, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (!error) setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...formData } : e))
    return { error: error?.message ?? null }
  }

  const remove = async (id: string) => {
    const { error } = await supabase
      .from('recurring_expenses')
      .delete()
      .eq('id', id)
    if (!error) setExpenses(prev => prev.filter(e => e.id !== id))
    return { error: error?.message ?? null }
  }

  const toggleActive = async (id: string, active: boolean) => {
    const { error } = await supabase
      .from('recurring_expenses')
      .update({ active, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (!error) setExpenses(prev => prev.map(e => e.id === id ? { ...e, active } : e))
    return { error: error?.message ?? null }
  }

  const totalFixed = expenses
    .filter(e => e.active)
    .reduce((sum, e) => sum + Number(e.amount), 0)

  return { expenses, loading, totalFixed, add, update, remove, toggleActive, refetch: fetchExpenses }
}
