import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Profile } from '../types'

export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    if (!user) { setLoading(false); return }
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    if (error) setError(error.message)
    else setProfile(data as Profile)
    setLoading(false)
  }, [user])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  const updateProfile = async (updates: Partial<Pick<Profile, 'name' | 'monthly_income'>>) => {
    if (!user) return { error: 'Not authenticated' }
    const payload: Record<string, unknown> = {}
    if (updates.name           !== undefined) payload.name           = updates.name
    if (updates.monthly_income !== undefined) payload.monthly_income = updates.monthly_income

    const { error } = await supabase
      .from('profiles')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update(payload as any)
      .eq('id', user.id)
    if (!error) setProfile(prev => prev ? { ...prev, ...updates } : prev)
    return { error: error?.message ?? null }
  }

  return { profile, loading, error, updateProfile, refetch: fetchProfile }
}
