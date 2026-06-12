import { useState, useEffect, useCallback, useRef } from 'react'
import { addMonths, parseISO, format } from 'date-fns'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Expense, ExpenseFormData } from '../types'

export function useExpenses(year: number, month: number) {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const autoPostedRef = useRef<Set<string>>(new Set())

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]

  const autoPostRecurring = useCallback(async () => {
    if (!user) return
    const now = new Date()
    if (year !== now.getFullYear() || month !== now.getMonth() + 1) return

    const sessionKey = `${user.id}-${year}-${month}`
    if (autoPostedRef.current.has(sessionKey)) return

    const { data: recurring } = await supabase
      .from('recurring_expenses')
      .select('*')
      .eq('user_id', user.id)
      .eq('active', true)

    if (!recurring?.length) { autoPostedRef.current.add(sessionKey); return }

    const { data: existing } = await supabase
      .from('expenses')
      .select('recurring_expense_id')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate)
      .not('recurring_expense_id', 'is', null)

    const postedIds = new Set((existing ?? []).map(e => e.recurring_expense_id))

    const toInsert = recurring
      .filter(r => !postedIds.has(r.id))
      .map(r => ({
        user_id:              user.id,
        description:          r.description,
        amount:               r.amount,
        category:             r.category,
        payment_method:       r.payment_method,
        date:                 startDate,
        notes:                null,
        installment_index:    1,
        installment_count:    1,
        recurring_expense_id: r.id,
      }))

    if (toInsert.length > 0) {
      await supabase.from('expenses').insert(toInsert)
    }

    autoPostedRef.current.add(sessionKey)
  }, [user, year, month, startDate, endDate])

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

  useEffect(() => {
    if (!user) { setLoading(false); return }
    autoPostRecurring().then(() => fetchExpenses())
  }, [user, autoPostRecurring, fetchExpenses])

  const addExpense = async (formData: ExpenseFormData) => {
    if (!user) return { error: 'Not authenticated' }

    const installmentCount = formData.installment_count && formData.installment_count > 1
      ? formData.installment_count
      : 1

    if (installmentCount === 1) {
      const { data: inserted, error } = await supabase
        .from('expenses')
        .insert({
          user_id:           user.id,
          description:       formData.description,
          amount:            formData.amount,
          category:          formData.category,
          payment_method:    formData.payment_method,
          date:              formData.date,
          notes:             formData.notes ?? null,
          installment_index: 1,
          installment_count: 1,
        })
        .select()
        .single()
      if (error) return { error: error.message }
      setExpenses(prev => [inserted as Expense, ...prev])
      return { error: null }
    }

    const groupId = crypto.randomUUID()
    const baseDate = parseISO(formData.date)
    const rows = Array.from({ length: installmentCount }, (_, i) => ({
      user_id:              user.id,
      description:          formData.description,
      amount:               formData.amount,
      category:             formData.category,
      payment_method:       formData.payment_method,
      date:                 format(addMonths(baseDate, i), 'yyyy-MM-dd'),
      notes:                formData.notes ?? null,
      installment_group_id: groupId,
      installment_index:    i + 1,
      installment_count:    installmentCount,
    }))

    const { data: inserted, error } = await supabase
      .from('expenses')
      .insert(rows)
      .select()
    if (error) return { error: error.message }

    const currentMonthRows = ((inserted ?? []) as Expense[]).filter(e => {
      const d = parseISO(e.date)
      return d.getFullYear() === year && d.getMonth() + 1 === month
    })
    setExpenses(prev =>
      [...currentMonthRows, ...prev].sort((a, b) =>
        b.date.localeCompare(a.date) || b.created_at.localeCompare(a.created_at)
      )
    )
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

  const deleteExpense = async (id: string, deleteGroup = false) => {
    if (deleteGroup) {
      const expense = expenses.find(e => e.id === id)
      if (expense?.installment_group_id) {
        const { error } = await supabase
          .from('expenses')
          .delete()
          .eq('installment_group_id', expense.installment_group_id)
        if (error) return { error: error.message }
        setExpenses(prev => prev.filter(e => e.installment_group_id !== expense.installment_group_id))
        return { error: null }
      }
    }
    const { error } = await supabase.from('expenses').delete().eq('id', id)
    if (error) return { error: error.message }
    setExpenses(prev => prev.filter(e => e.id !== id))
    return { error: null }
  }

  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

  return { expenses, loading, error, totalSpent, addExpense, updateExpense, deleteExpense, refetch: fetchExpenses }
}
