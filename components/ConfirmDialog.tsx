'use client'

// src/components/ConfirmDialog.tsx
// Reusable confirm popup — replaces browser alert()

const F = "'DM Sans','Segoe UI',sans-serif"

interface ConfirmDialogProps {
  open:      boolean
  title:     string
  message:   string
  confirmLabel?: string
  cancelLabel?:  string
  danger?:   boolean
  onConfirm: () => void
  onCancel:  () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel  = 'Cancel',
  danger       = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:16, fontFamily:F }}
      onClick={onCancel}
    >
      <div
        style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:18, padding:'24px', width:'100%', maxWidth:380, boxShadow:'0 24px 64px rgba(0,0,0,0.35)', animation:'popIn .15s ease' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Icon */}
        <div style={{ width:44, height:44, borderRadius:12, background: danger ? 'var(--red-bg)' : 'var(--accent-bg)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
          {danger ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          )}
        </div>

        {/* Title */}
        <h3 style={{ color:'var(--text-primary)', fontSize:16, fontWeight:700, margin:'0 0 8px' }}>
          {title}
        </h3>

        {/* Message */}
        <p style={{ color:'var(--text-muted)', fontSize:13, lineHeight:1.6, margin:'0 0 22px' }}>
          {message}
        </p>

        {/* Buttons */}
        <div style={{ display:'flex', gap:10 }}>
          <button
            onClick={onCancel}
            style={{ flex:1, padding:'10px 0', borderRadius:10, border:'1px solid var(--border)', background:'var(--bg-page)', color:'var(--text-secondary)', fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:F, transition:'all .15s' }}
            onMouseEnter={e => e.currentTarget.style.background='var(--bg-card-hover)'}
            onMouseLeave={e => e.currentTarget.style.background='var(--bg-page)'}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={{ flex:1, padding:'10px 0', borderRadius:10, border:'none', background: danger ? 'var(--red)' : 'linear-gradient(135deg,var(--accent),var(--accent-2))', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:F, transition:'all .15s', boxShadow: danger ? '0 4px 14px rgba(220,38,38,0.3)' : '0 4px 14px rgba(124,58,237,0.3)' }}
            onMouseEnter={e => e.currentTarget.style.opacity='0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity='1'}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
      <style>{`@keyframes popIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  )
}

// ── useConfirm hook — easy to use anywhere ─────────────
import { useState, useCallback } from 'react'

interface ConfirmOptions {
  title:         string
  message:       string
  confirmLabel?: string
  danger?:       boolean
}

export function useConfirm() {
  const [state, setState] = useState<{
    open:     boolean
    options:  ConfirmOptions
    resolve:  (val: boolean) => void
  }>({
    open:    false,
    options: { title:'', message:'' },
    resolve: () => {},
  })

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise(resolve => {
      setState({ open: true, options, resolve })
    })
  }, [])

  const handleConfirm = useCallback(() => {
    state.resolve(true)
    setState(p => ({ ...p, open: false }))
  }, [state])

  const handleCancel = useCallback(() => {
    state.resolve(false)
    setState(p => ({ ...p, open: false }))
  }, [state])

  const Dialog = (
    <ConfirmDialog
      open={state.open}
      title={state.options.title}
      message={state.options.message}
      confirmLabel={state.options.confirmLabel}
      danger={state.options.danger ?? true}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  )

  return { confirm, Dialog }
}
