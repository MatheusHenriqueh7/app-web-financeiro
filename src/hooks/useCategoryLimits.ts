import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { DEFAULT_CATEGORY_SEEDS } from '../types'
import type { CategoryLimit } from '../types'

export function useCategoryLimits() {
  const { user } = useAuth()
  const [categories, setCategories] = useState<CategoryLimit[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCategories = useCallback(async () => {
    if (!user) { setLoading(false); return }
    setLoading(true)
    const { data, error } = await supabase
      .from('category_limits')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order')

    if (error) {
      console.error('[useCategoryLimits] fetch error:', error.message)
      setLoading(false)
      return
    }

    if (!data || data.length === 0) {
      const inserts = DEFAULT_CATEGORY_SEEDS.map(c => ({ ...c, user_id: user.id }))
      const { error: seedError } = await supabase
        .from('category_limits')
        .insert(inserts)

      if (seedError) {
        console.error('[useCategoryLimits] seed error:', seedError.message)
        setLoading(false)
        return
      }

      const { data: seeded } = await supabase
        .from('category_limits')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order')
      setCategories((seeded ?? []) as CategoryLimit[])
    } else {
      setCategories(data as CategoryLimit[])
    }
    setLoading(false)
  }, [user])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  const updateLimit = async (id: string, monthly_limit: number) => {
    const { error } = await supabase
      .from('category_limits')
      .update({ monthly_limit, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (!error) setCategories(prev => prev.map(c => c.id === id ? { ...c, monthly_limit } : c))
    return { error: error?.message ?? null }
  }

  const updateCategory = async (id: string, fields: Partial<Pick<CategoryLimit, 'name' | 'icon' | 'color'>>) => {
    const { error } = await supabase
      .from('category_limits')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (!error) setCategories(prev => prev.map(c => c.id === id ? { ...c, ...fields } : c))
    return { error: error?.message ?? null }
  }

  const addCustomCategory = async (name: string, icon: string, color: string, monthly_limit = 0) => {
    if (!user) return { error: 'Not authenticated', data: null }
    const sort_order = categories.length
    const { data, error } = await supabase
      .from('category_limits')
      .insert({ user_id: user.id, name, icon, color, monthly_limit, is_custom: true, sort_order })
      .select()
      .single()
    if (!error && data) setCategories(prev => [...prev, data as CategoryLimit])
    return { error: error?.message ?? null, data: data as CategoryLimit | null }
  }

  const deleteCustomCategory = async (id: string) => {
    const { error } = await supabase
      .from('category_limits')
      .delete()
      .eq('id', id)
    if (!error) setCategories(prev => prev.filter(c => c.id !== id))
    return { error: error?.message ?? null }
  }

  const seedDefaultCategories = async () => {
    if (!user) return { error: 'Not authenticated' }
    const inserts = DEFAULT_CATEGORY_SEEDS.map(c => ({ ...c, user_id: user.id }))
    const { error } = await supabase.from('category_limits').insert(inserts)
    if (error) return { error: error.message }
    await fetchCategories()
    return { error: null }
  }

  return {
    categories,
    loading,
    updateLimit,
    updateCategory,
    addCustomCategory,
    deleteCustomCategory,
    seedDefaultCategories,
    refetch: fetchCategories,
  }
}
