'use client'

// components/Header.tsx

import { useTheme } from '@/src/app/lib/theme'
import { usePathname } from 'next/navigation'

const pageTitles: Record<string, { title: string; sub: string }> = {
  '/dashboard':  { title: 'Dashboard',  sub: 'Your learning overview'     },
  '/tasks':      { title: 'Tasks',      sub: 'Manage your learning tasks' },
  '/analytics':  { title: 'Analytics',  sub: 'Track your progress'        },
}

export default function Header() {
  const { isDark, toggleTheme } = useTheme()
  const pathname = usePathname()
  const page = pageTitles[pathname] || { title: 'LearnTrack', sub: '' }

  return (
    <header style={{
      height: 60,
      background: 'var(--bg-sidebar)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      fontFamily: "'DM Sans','Segoe UI',sans-serif",
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>

      {/* Page title */}
      <div>
        <h2 style={{ color: 'var(--text-primary)', fontSize: 15, fontWeight: 700, margin: 0, lineHeight: 1 }}>
          {page.title}
        </h2>
        {page.sub && (
          <p style={{ color: 'var(--text-muted)', fontSize: 11, margin: '3px 0 0' }}>{page.sub}</p>
        )}
      </div>

      {/* Right side actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

        {/* Date pill */}
        <div style={{
          padding: '5px 12px', borderRadius: 20,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          fontSize: 12, color: 'var(--text-muted)',
        }}>
          {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            width: 38, height: 38, borderRadius: 10,
            border: '1px solid var(--border)',
            background: 'var(--bg-card)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s ease',
            color: 'var(--text-secondary)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--accent-bg)'
            e.currentTarget.style.borderColor = 'var(--accent-border)'
            e.currentTarget.style.color = 'var(--accent-text)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'var(--bg-card)'
            e.currentTarget.style.borderColor = 'var(--border)'
            e.currentTarget.style.color = 'var(--text-secondary)'
          }}
        >
          {isDark ? (
            // Sun icon — switch to light
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            // Moon icon — switch to dark
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
      </div>
    </header>
  )
}
