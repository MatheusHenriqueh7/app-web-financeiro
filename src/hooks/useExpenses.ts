import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Expense, ExpenseFormData } from '../types'

export function useExpenses(year: number, month: number) {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]

  const fetchExpenses = useCallback(async () => {
    if (!user) { setLoading(false); return }
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setExpenses((data ?? []) as Expense[])
    setLoading(false)
  }, [user, startDate, endDate])

  useEffect(() => { fetchExpenses() }, [fetchExpenses])

  const addExpense = async (formData: ExpenseFormData) => {
    if (!user) return { error: 'Not authenticated' }
    const { data: inserted, error } = await supabase
      .from('expenses')
      .insert({
        user_id:        user.id,
        description:    formData.description,
        amount:         formData.amount,
        category:       formData.category,
        payment_method: formData.payment_method,
        date:           formData.date,
        notes:          formData.notes ?? null,
      })
      .select()
      .single()
    if (error) return { error: error.message }
    setExpenses(prev => [inserted as Expense, ...prev])
    return { error: null }
  }

  const updateExpense = async (id: string, formData: Partial<ExpenseFormData>) => {
    const updatePayload: Record<string, unknown> = {}
    if (formData.description    !== undefined) updatePayload.description    = formData.description
    if (formData.amount         !== undefined) updatePayload.amount         = formData.amount
    if (formData.category       !== undefined) updatePayload.category       = formData.category
    if (formData.payment_method !== undefined) updatePayload.payment_method = formData.payment_method
    if (formData.date           !== undefined) updatePayload.date           = formData.date
    if (formData.notes          !== undefined) updatePayload.notes          = formData.notes ?? null

    const { error } = await supabase
      .from('expenses')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update(updatePayload as any)
      .eq('id', id)
    if (error) return { error: error.message }
    setExpenses(prev =>
      prev.map(e => e.id === id ? { ...e, ...formData } : e)
    )
    return { error: null }
  }

  const deleteExpense = async (id: string) => {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
    if (error) return { error: error.message }
    setExpenses(prev => prev.filter(e => e.id !== id))
    return { error: null }
  }

  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

  return { expenses, loading, error, totalSpent, addExpense, updateExpense, deleteExpense, refetch: fetchExpenses }
}
