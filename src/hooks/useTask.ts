'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Task, TaskStatus } from '@/lib/types'

const cache: { tasks: Task[] | null; ts: number } = { tasks: null, ts: 0 }
const CACHE_TTL = 30_000

export function useTasks(userId: string) {
  const [tasks,   setTasks]   = useState<Task[]>(cache.tasks || [])
  const [loading, setLoading] = useState(!cache.tasks)
  const [error,   setError]   = useState<string | null>(null)
  const ref = useRef(userId)
  ref.current = userId

  const fetchTasks = useCallback(async (force = false) => {
    const uid = ref.current
    if (!uid) return
    if (!force && cache.tasks && Date.now() - cache.ts < CACHE_TTL) {
      setTasks(cache.tasks)
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error: err } = await supabase
      .from('tasks')
      .select('*, categories(*)')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
    if (err) {
      setError(err.message)
    } else {
      const t = data || []
      cache.tasks = t
      cache.ts    = Date.now()
      setTasks(t)
      setError(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (userId) fetchTasks()
  }, [userId, fetchTasks])

  const addTask = useCallback(async (payload: Partial<Task>) => {
    const { data, error: err } = await supabase
      .from('tasks')
      .insert(payload)
      .select('*, categories(*)')
    if (err) return { error: err.message }
    if (data?.[0]) {
      const updated = [data[0], ...(cache.tasks || [])]
      cache.tasks = updated
      setTasks(updated)
    }
    return { error: null }
  }, [])

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    const prev    = cache.tasks || []
    const updated = prev.map(t => t.id === id ? { ...t, ...updates } : t)
    cache.tasks   = updated
    setTasks(updated)
    const { error: err } = await supabase.from('tasks').update(updates).eq('id', id)
    if (err) {
      cache.tasks = prev
      setTasks(prev)
      return { error: err.message }
    }
    return { error: null }
  }, [])

  const deleteTask = useCallback(async (id: string) => {
    const prev    = cache.tasks || []
    const updated = prev.filter(t => t.id !== id)
    cache.tasks   = updated
    setTasks(updated)
    const { error: err } = await supabase.from('tasks').delete().eq('id', id)
    if (err) {
      cache.tasks = prev
      setTasks(prev)
      return { error: err.message }
    }
    return { error: null }
  }, [])

  const updateStatus = useCallback(async (id: string, status: TaskStatus) => {
    const updates: Partial<Task> = { status }
    if (status === 'completed') updates.completed_at = new Date().toISOString()
    else updates.completed_at = null
    return updateTask(id, updates)
  }, [updateTask])

  return {
    tasks,
    loading,
    error,
    refetch: () => fetchTasks(true),
    addTask,
    updateTask,
    deleteTask,
    updateStatus,
  }
}
