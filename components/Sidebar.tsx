'use client'

// components/Sidebar.tsx — clean version (toggle moved to Header)

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

const navItems = [
  {
    href: '/dashboard', label: 'Dashboard',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    href: '/tasks', label: 'Tasks',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
  },
  {
    href: '/analytics', label: 'Analytics',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6"  y1="20" x2="6"  y2="14"/>
      </svg>
    ),
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const [email,    setEmail]    = useState('')
  const [initials, setInitials] = useState('')
  const [time,     setTime]     = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const e    = data.user?.email || ''
      const name = data.user?.user_metadata?.full_name || e.split('@')[0] || '?'
      setEmail(e)
      setInitials(name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2))
    })
    const tick = () => setTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside style={{
      width: 220, minHeight: '100vh', flexShrink: 0,
      background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'DM Sans','Segoe UI',sans-serif",
    }}>

      {/* Brand */}
      <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(124,58,237,0.35)',
          }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>L</span>
          </div>
          <div>
            <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 14, lineHeight: 1, margin: 0 }}>LearnTrack</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 3 }}>Interview Prep</p>
          </div>
        </div>

        {/* Live clock */}
        <div style={{
          marginTop: 12, padding: '6px 10px', borderRadius: 8,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }} />
          <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{time}</span>
          <span style={{ color: 'var(--text-hint)', fontSize: 11, marginLeft: 'auto' }}>Live</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px' }}>
        <p style={{ color: 'var(--text-hint)', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 8px', marginBottom: 6 }}>
          Menu
        </p>
        {navItems.map(item => {
          const active = pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 10, marginBottom: 2,
              textDecoration: 'none', transition: 'all 0.15s ease',
              background: active ? 'var(--nav-active-bg)' : 'transparent',
              border: active ? '1px solid var(--nav-active-border)' : '1px solid transparent',
              color: active ? 'var(--accent-text)' : 'var(--text-secondary)',
              position: 'relative',
            }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--nav-hover-bg)'; e.currentTarget.style.color = 'var(--text-primary)' }}}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}}
            >
              {active && (
                <div style={{
                  position: 'absolute', left: 0, top: '20%', bottom: '20%',
                  width: 3, borderRadius: '0 3px 3px 0',
                  background: 'linear-gradient(180deg,#7c3aed,#4f46e5)',
                }} />
              )}
              <span style={{ color: active ? 'var(--accent-text)' : 'currentColor', display: 'flex' }}>{item.icon}</span>
              <span style={{ fontSize: 13, fontWeight: active ? 600 : 400 }}>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
        <div style={{
          padding: '10px 12px', borderRadius: 10, marginBottom: 8,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: '#fff',
          }}>
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ color: 'var(--text-primary)', fontSize: 12, fontWeight: 500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {email.split('@')[0]}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: 10, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {email}
            </p>
          </div>
        </div>

        <button onClick={handleLogout}
          style={{
            width: '100%', padding: '9px 12px', borderRadius: 10,
            background: 'transparent', border: '1px solid rgba(239,68,68,0.15)',
            color: 'var(--red)', fontSize: 12, fontWeight: 500, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            opacity: 0.65, transition: 'all 0.15s',
            fontFamily: "'DM Sans','Segoe UI',sans-serif",
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'var(--red-bg)' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '0.65'; e.currentTarget.style.background = 'transparent' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16,17 21,12 16,7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  )
}