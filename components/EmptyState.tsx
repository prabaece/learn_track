'use client'

// src/components/EmptyState.tsx
// Use this everywhere — consistent empty state across app

const F = "'DM Sans','Segoe UI',sans-serif"

interface EmptyStateProps {
  message:  string
  subtext?: string
  action?:  { label: string; onClick: () => void }
  icon?:    'tasks' | 'analytics' | 'categories' | 'default'
}

const icons = {
  tasks: (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--border-hover)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4"/>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  ),
  analytics: (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--border-hover)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6"  y1="20" x2="6"  y2="14"/>
      <line x1="2"  y1="20" x2="22" y2="20"/>
    </svg>
  ),
  categories: (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--border-hover)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  default: (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--border-hover)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  ),
}

export function EmptyState({ message, subtext, action, icon = 'default' }: EmptyStateProps) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'48px 24px', textAlign:'center', fontFamily:F }}>
      <div style={{ marginBottom:16, opacity:0.6 }}>
        {icons[icon]}
      </div>
      <p style={{ color:'var(--text-secondary)', fontSize:14, fontWeight:500, margin:'0 0 6px' }}>
        Nothing here yet
      </p>
      <p style={{ color:'var(--text-muted)', fontSize:13, margin:'0 0 16px', maxWidth:280, lineHeight:1.5 }}>
        {message}
      </p>
      {subtext && (
        <p style={{ color:'var(--text-hint)', fontSize:12, margin:'0 0 16px' }}>{subtext}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          style={{ padding:'8px 18px', borderRadius:10, border:'1px solid var(--accent-border)', background:'var(--accent-bg)', color:'var(--accent-text)', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:F, transition:'all .15s' }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(124,58,237,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background='var(--accent-bg)'}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}


// ─────────────────────────────────────────────────────
// src/components/PageLoader.tsx
// ─────────────────────────────────────────────────────

export function PageLoader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100%', background:'var(--bg-page)', fontFamily:F }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:34, height:34, border:'3px solid var(--accent-bg)', borderTopColor:'var(--accent)', borderRadius:'50%', animation:'spin .8s linear infinite', margin:'0 auto 10px' }} />
        <p style={{ color:'var(--text-muted)', fontSize:13 }}>{text}</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
