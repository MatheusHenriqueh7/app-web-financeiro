import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { CATEGORIES } from '../types'

export function useCategoryNames(): string[] {
  const { user } = useAuth()
  const [names, setNames] = useState<string[]>([...CATEGORIES])

  useEffect(() => {
    if (!user) return
    supabase
      .from('category_limits')
      .select('name, sort_order')
      .eq('user_id', user.id)
      .order('sort_order')
      .then(({ data }) => {
        if (data && data.length > 0) {
          setNames(data.map(d => d.name as string))
        }
      })
  }, [user])

  return names
}
