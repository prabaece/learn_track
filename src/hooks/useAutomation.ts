'use client'

// src/hooks/useAutomation.ts
// 1. Auto-prioritize overdue tasks
// 2. Smart suggestions based on weak topics
// 3. Streak calculation

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Task } from '@/lib/types'

export interface Suggestion {
  id: string
  title: string
  reason: string
  category: string
  priority: 'high' | 'medium'
}

export interface StreakData {
  current: number
  longest: number
  todayDone: boolean
}

export function useAutomation(userId: string, tasks: Task[]) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [streak,      setStreak]      = useState<StreakData>({ current: 0, longest: 0, todayDone: false })
  const [autoFixed,   setAutoFixed]   = useState(0) // count of auto-prioritized tasks

  // ── 1. Auto-prioritize overdue tasks ──────────────────
  const autoPrioritize = useCallback(async () => {
    if (!userId || tasks.length === 0) return
    const today    = new Date().toISOString().split('T')[0]
    const overdue  = tasks.filter(t =>
      t.due_date &&
      t.due_date < today &&
      t.status !== 'completed' &&
      t.priority !== 'high'
    )
    if (overdue.length === 0) return

    for (const task of overdue) {
      await supabase.from('tasks')
        .update({ priority: 'high' })
        .eq('id', task.id)
    }
    setAutoFixed(overdue.length)
  }, [userId, tasks])

  // ── 2. Smart suggestions ──────────────────────────────
  const generateSuggestions = useCallback(() => {
    if (tasks.length === 0) return

    const result: Suggestion[] = []

    // Find categories with low completion rate
    const catStats: Record<string, { done: number; total: number; name: string }> = {}
    tasks.forEach(t => {
      const name = (t.categories as any)?.name || 'General'
      if (!catStats[name]) catStats[name] = { done: 0, total: 0, name }
      catStats[name].total++
      if (t.status === 'completed') catStats[name].done++
    })

    // Weak categories (< 50% completion)
    Object.entries(catStats).forEach(([, stat]) => {
      const pct = stat.total > 0 ? (stat.done / stat.total) * 100 : 0
      if (pct < 50 && stat.total >= 2) {
        result.push({
          id:       `weak-${stat.name}`,
          title:    `Focus on ${stat.name} today`,
          reason:   `Only ${Math.round(pct)}% completed in ${stat.name}`,
          category: stat.name,
          priority: pct < 30 ? 'high' : 'medium',
        })
      }
    })

    // Stale in-progress tasks (stuck for too long)
    const inProgress = tasks.filter(t => t.status === 'in_progress')
    if (inProgress.length > 3) {
      result.push({
        id:       'too-many-wip',
        title:    'Complete or defer in-progress tasks',
        reason:   `${inProgress.length} tasks stuck in progress`,
        category: 'Productivity',
        priority: 'high',
      })
    }

    // No tasks due this week
    const thisWeek = new Date()
    thisWeek.setDate(thisWeek.getDate() + 7)
    const dueSoon = tasks.filter(t =>
      t.due_date &&
      new Date(t.due_date) <= thisWeek &&
      t.status !== 'completed'
    )
    if (dueSoon.length > 0) {
      result.push({
        id:       'due-soon',
        title:    `${dueSoon.length} task${dueSoon.length > 1 ? 's' : ''} due this week`,
        reason:   dueSoon.map(t => t.title).slice(0, 2).join(', '),
        category: 'Deadline',
        priority: 'high',
      })
    }

    // High priority todo tasks untouched
    const highPrioTodo = tasks.filter(t => t.priority === 'high' && t.status === 'todo')
    if (highPrioTodo.length > 0) {
      result.push({
        id:       'high-prio-todo',
        title:    `Start "${highPrioTodo[0].title}"`,
        reason:   `High priority task not started yet`,
        category: (highPrioTodo[0].categories as any)?.name || 'Tasks',
        priority: 'high',
      })
    }

    setSuggestions(result.slice(0, 4))
  }, [tasks])

  // ── 3. Streak calculation ─────────────────────────────
  const calcStreak = useCallback(async () => {
    if (!userId) return
    const { data: logs } = await supabase
      .from('learning_logs')
      .select('logged_date')
      .eq('user_id', userId)
      .order('logged_date', { ascending: false })

    if (!logs || logs.length === 0) return

   const dates = Array.from(new Set(logs.map(l => l.logged_date))).sort().reverse()
    const today = new Date().toISOString().split('T')[0]

    let current = 0
    let longest = 0
    let temp    = 0
    let prev: string | null = null

    for (const date of dates) {
      if (!prev) {
        temp = 1
        current = date === today ? 1 : 0
      } else {
        const d1   = new Date(date)
        const d2   = new Date(prev)
        const diff = Math.round((d2.getTime() - d1.getTime()) / 86400000)
        if (diff === 1) {
          temp++
          if (prev === today || current > 0) current++
        } else {
          longest = Math.max(longest, temp)
          temp    = 1
          if (current === 0 && date !== today) break
        }
      }
      prev = date
    }
    longest = Math.max(longest, temp)

    setStreak({
      current,
      longest,
      todayDone: dates[0] === today,
    })
  }, [userId])

  useEffect(() => {
    if (!userId) return
    autoPrioritize()
    generateSuggestions()
    calcStreak()
  }, [userId, tasks.length, autoPrioritize, generateSuggestions, calcStreak])

  const dismissSuggestion = (id: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== id))
  }

  return { suggestions, streak, autoFixed, dismissSuggestion }
}
