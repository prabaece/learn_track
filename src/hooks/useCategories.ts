'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Category } from '@/lib/types'

const catCache: { data: Category[] | null; ts: number } = { data: null, ts: 0 }
const CAT_TTL = 60_000

export function useCategories(userId: string) {
  const [categories, setCategories] = useState<Category[]>(catCache.data || [])
  const [loading,    setLoading]    = useState(!catCache.data)

  const fetchCategories = useCallback(async (force = false) => {
    if (!userId) return
    if (!force && catCache.data && Date.now() - catCache.ts < CAT_TTL) {
      setCategories(catCache.data)
      setLoading(false)
      return
    }
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
    const d       = data || []
    catCache.data = d
    catCache.ts   = Date.now()
    setCategories(d)
    setLoading(false)
  }, [userId])

  useEffect(() => {
    if (userId) fetchCategories()
  }, [userId, fetchCategories])

  const addCategory = useCallback(async (name: string, color = '#7F77DD') => {
    const { data, error } = await supabase
      .from('categories')
      .insert({ user_id: userId, name, color })
      .select()
    if (!error && data?.[0]) {
      const updated = [...categories, data[0]]
      catCache.data = updated
      setCategories(updated)
    }
    return { error: error?.message || null }
  }, [userId, categories])

  return {
    categories,
    loading,
    refetch: () => fetchCategories(true),
    addCategory,
  }
}
