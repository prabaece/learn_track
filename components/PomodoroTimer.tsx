'use client'

// src/components/PomodoroTimer.tsx
// 25min work + 5min break cycle with sound notification

import { useState, useEffect, useCallback, useRef } from 'react'

const WORK_MINS  = 25
const BREAK_MINS = 5

type Phase = 'idle' | 'work' | 'break'

export default function PomodoroTimer() {
  const [phase,    setPhase]    = useState<Phase>('idle')
  const [secs,     setSecs]     = useState(WORK_MINS * 60)
  const [cycles,   setCycles]   = useState(0)
  const [expanded, setExpanded] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
  }, [])

  const notify = (msg: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('LearnTrack ⏱', { body: msg, icon: '/favicon.ico' })
    }
  }

  useEffect(() => {
    if (phase === 'idle') return
    intervalRef.current = setInterval(() => {
      setSecs(prev => {
        if (prev <= 1) {
          if (phase === 'work') {
            notify('Work session done! Take a 5 min break 🎉')
            setPhase('break')
            return BREAK_MINS * 60
          } else {
            notify('Break over! Back to work 💪')
            setCycles(c => c + 1)
            setPhase('work')
            return WORK_MINS * 60
          }
        }
        return prev - 1
      })
    }, 1000)
    return stop
  }, [phase, stop])

  const startWork = () => {
    stop()
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
    setPhase('work')
    setSecs(WORK_MINS * 60)
  }

  const reset = () => {
    stop()
    setPhase('idle')
    setSecs(WORK_MINS * 60)
  }

  const mins    = Math.floor(secs / 60)
  const secDisp = (secs % 60).toString().padStart(2, '0')
  const total   = phase === 'work' ? WORK_MINS * 60 : BREAK_MINS * 60
  const pct     = ((total - secs) / total) * 100

  const colors = {
    idle:  { ring: 'var(--border)',  text: 'var(--text-muted)',    bg: 'var(--bg-card)'    },
    work:  { ring: 'var(--accent)', text: 'var(--accent-text)',   bg: 'var(--accent-bg)'  },
    break: { ring: 'var(--green)',  text: 'var(--green)',         bg: 'var(--green-bg)'   },
  }
  const c = colors[phase]

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '7px 14px', borderRadius: 10,
          background: c.bg, border: `1px solid ${phase === 'idle' ? 'var(--border)' : c.ring}`,
          color: c.text, fontSize: 12, fontWeight: 600,
          cursor: 'pointer', fontFamily: "'DM Sans','Segoe UI',sans-serif",
          transition: 'all .2s',
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        {phase === 'idle' ? 'Pomodoro' : `${mins}:${secDisp} ${phase === 'work' ? '— Focus' : '— Break'}`}
        {cycles > 0 && <span style={{ background: 'var(--accent-bg)', color: 'var(--accent-text)', borderRadius: 6, padding: '1px 6px', fontSize: 10 }}>{cycles} 🍅</span>}
      </button>
    )
  }

  return (
    <div style={{
      position: 'fixed', top: 70, right: 20, zIndex: 200,
      background: 'var(--bg-card)', border: `1px solid ${c.ring}`,
      borderRadius: 20, padding: '24px',
      boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
      width: 220, fontFamily: "'DM Sans','Segoe UI',sans-serif",
    }}>
      {/* Close */}
      <button onClick={() => setExpanded(false)}
        style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}
      >×</button>

      {/* Phase label */}
      <p style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: c.text, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 16px' }}>
        {phase === 'idle' ? 'Pomodoro Timer' : phase === 'work' ? '🎯 Focus Time' : '☕ Break Time'}
      </p>

      {/* Ring */}
      <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 20px' }}>
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border)" strokeWidth="8"/>
          <circle cx="60" cy="60" r="52" fill="none" stroke={c.ring} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 52}`}
            strokeDashoffset={`${2 * Math.PI * 52 * (1 - pct / 100)}`}
            transform="rotate(-90 60 60)"
            style={{ transition: 'stroke-dashoffset .9s linear' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
            {mins}:{secDisp}
          </span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
            {cycles} cycles done
          </span>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8 }}>
        {phase === 'idle' ? (
          <button onClick={startWork}
            style={{ flex: 1, padding: '9px 0', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,var(--accent),var(--accent-2))', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}
          >▶ Start</button>
        ) : (
          <>
            <button onClick={reset}
              style={{ flex: 1, padding: '9px 0', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-page)', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}
            >Reset</button>
            <button onClick={() => { stop(); setPhase('idle') }}
              style={{ flex: 1, padding: '9px 0', borderRadius: 10, border: 'none', background: 'var(--red-bg)', color: 'var(--red)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}
            >■ Stop</button>
          </>
        )}
      </div>

      <p style={{ fontSize: 10, color: 'var(--text-hint)', textAlign: 'center', marginTop: 10 }}>
        25 min work · 5 min break
      </p>
    </div>
  )
}
