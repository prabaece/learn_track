'use client'

// src/hooks/useTimer.ts
// Manages active timers per task — persists across re-renders via module-level state

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

// Module-level timer state — survives component re-mounts
const activeTimers: Record<string, number> = {} // taskId → startTimestamp

export function useTimer(userId: string) {
  const [running, setRunning] = useState<Record<string, boolean>>({})
  const [elapsed, setElapsed] = useState<Record<string, number>>({})   // taskId → seconds

  // Tick every second for all active timers
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now()
      const updated: Record<string, number> = {}
      let hasActive = false
      for (const [taskId, start] of Object.entries(activeTimers)) {
        updated[taskId] = Math.floor((now - start) / 1000)
        hasActive = true
      }
      if (hasActive) setElapsed(prev => ({ ...prev, ...updated }))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const startTimer = useCallback((taskId: string) => {
    activeTimers[taskId] = Date.now()
    setRunning(prev => ({ ...prev, [taskId]: true }))
    setElapsed(prev => ({ ...prev, [taskId]: 0 }))
  }, [])

  const stopTimer = useCallback(async (taskId: string, taskTitle: string) => {
    const start = activeTimers[taskId]
    if (!start) return 0

    const mins = Math.max(1, Math.round((Date.now() - start) / 60000))
    delete activeTimers[taskId]
    setRunning(prev => ({ ...prev, [taskId]: false }))

    // Save to learning_logs
    await supabase.from('learning_logs').insert({
      user_id:         userId,
      task_id:         taskId,
      note:            `Worked on: ${taskTitle}`,
      time_spent_mins: mins,
      logged_date:     new Date().toISOString().split('T')[0],
    })
    return mins
  }, [userId])

  const logManual = useCallback(async (taskId: string, taskTitle: string, mins: number) => {
    if (!userId || !taskId || mins < 1) return
    await supabase.from('learning_logs').insert({
      user_id:         userId,
      task_id:         taskId,
      note:            `Manual log: ${taskTitle}`,
      time_spent_mins: mins,
      logged_date:     new Date().toISOString().split('T')[0],
    })
  }, [userId])

  const formatElapsed = (taskId: string) => {
    const secs = elapsed[taskId] || 0
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return { running, elapsed, startTimer, stopTimer, logManual, formatElapsed }
}
