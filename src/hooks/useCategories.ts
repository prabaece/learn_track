// 'use client'

// import { useState, useEffect, useCallback } from 'react'
// import { supabase } from '@/lib/supabase'
// import { Category } from '@/lib/types'

// const catCache: { data: Category[] | null; ts: number } = { data: null, ts: 0 }
// const CAT_TTL = 60_000

// export function useCategories(userId: string) {
//   const [categories, setCategories] = useState<Category[]>(catCache.data || [])
//   const [loading,    setLoading]    = useState(!catCache.data)

//   const fetchCategories = useCallback(async (force = false) => {
//     if (!userId) return
//     if (!force && catCache.data && Date.now() - catCache.ts < CAT_TTL) {
//       setCategories(catCache.data)
//       setLoading(false)
//       return
//     }
//     const { data } = await supabase
//       .from('categories')
//       .select('*')
//       .eq('user_id', userId)
//     const d       = data || []
//     catCache.data = d
//     catCache.ts   = Date.now()
//     setCategories(d)
//     setLoading(false)
//   }, [userId])

//   useEffect(() => {
//     if (userId) fetchCategories()
//   }, [userId, fetchCategories])

//   const addCategory = useCallback(async (name: string, color = '#7F77DD') => {
//     const { data, error } = await supabase
//       .from('categories')
//       .insert({ user_id: userId, name, color })
//       .select()
//     if (!error && data?.[0]) {
//       const updated = [...categories, data[0]]
//       catCache.data = updated
//       setCategories(updated)
//     }
//     return { error: error?.message || null }
//   }, [userId, categories])

//   return {
//     categories,
//     loading,
//     refetch: () => fetchCategories(true),
//     addCategory,
//   }
// }
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Category } from '@/lib/types'

export function useCategories(userId: string) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading,    setLoading]    = useState(true)
  const fetchedRef = useRef(false)
  const userIdRef  = useRef('')

  const fetchCategories = useCallback(async (force = false) => {
    if (!userId) return

    // Already fetched for this user — skip unless forced
    if (!force && fetchedRef.current && userIdRef.current === userId) return

    setLoading(true)
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true })

    if (!error) {
      // Deduplicate by id — safety net
      const seen  = new Set<string>()
      const clean = (data || []).filter(c => {
        if (seen.has(c.id)) return false
        seen.add(c.id)
        return true
      })
      setCategories(clean)
      fetchedRef.current = true
      userIdRef.current  = userId
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    // Reset on userId change
    if (userIdRef.current !== userId) {
      fetchedRef.current = false
      setCategories([])
    }
    if (userId) fetchCategories()
  }, [userId, fetchCategories])

  const addCategory = useCallback(async (name: string, color = '#7F77DD') => {
    if (!name.trim()) return { error: 'Name is required' }

    const exists = categories.some(
      c => c.name.toLowerCase() === name.trim().toLowerCase()
    )
    if (exists) return { error: 'Category already exists' }

    const { data, error } = await supabase
      .from('categories')
      .insert({ user_id: userId, name: name.trim(), color })
      .select()
      .single()

    if (!error && data) {
      setCategories(prev => {
        const updated = [...prev, data].sort((a, b) => a.name.localeCompare(b.name))
        return updated
      })
    }
    return { error: error?.message || null }
  }, [userId, categories])

  const deleteCategory = useCallback(async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (!error) {
      setCategories(prev => prev.filter(c => c.id !== id))
    }
    return { error: error?.message || null }
  }, [])

  return {
    categories,
    loading,
    refetch:        () => fetchCategories(true),
    addCategory,
    deleteCategory,
  }
}