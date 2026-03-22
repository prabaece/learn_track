'use client'

import { useEffect, useState } from 'react'
import { supabase }    from '@/lib/supabase'
import { useAuth }     from '@/src/hooks/useAuth'
import { useRouter }   from 'next/navigation'

const F = "'DM Sans','Segoe UI',sans-serif"
const inp: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: 'var(--bg-input)', border: '1px solid var(--border-input)',
  borderRadius: 10, padding: '10px 14px',
  color: 'var(--text-primary)', fontSize: 13,
  outline: 'none', fontFamily: F,
}

export default function SettingsPage() {
  const router = useRouter()
  const { userId, email: authEmail, loading: authLoading } = useAuth()
  const [form,    setForm]    = useState({ whatsapp_number:'', email:'', due_reminder:true, daily_summary:true })
  const [saving,  setSaving]  = useState(false)
  const [testing, setTesting] = useState('')
  const [toast,   setToast]   = useState({ msg:'', type:'' })
  const [loaded,  setLoaded]  = useState(false)

  useEffect(() => {
    if (!userId) return
    const load = async () => {
      const { data } = await supabase.from('notification_settings').select('*').eq('user_id', userId).single()
      if (data) setForm({ whatsapp_number: data.whatsapp_number||'', email: data.email||authEmail, due_reminder: data.due_reminder, daily_summary: data.daily_summary })
      else setForm(p => ({ ...p, email: authEmail }))
      setLoaded(true)
    }
    load()
  }, [userId, authEmail])

  const showToast = (msg: string, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast({ msg:'', type:'' }), 3000) }

  const handleSave = async () => {
    if (!userId) return
    setSaving(true)
    const { error } = await supabase.from('notification_settings').upsert({ ...form, user_id:userId, updated_at:new Date().toISOString() }, { onConflict:'user_id' })
    if (error) showToast('Failed: ' + error.message, 'error')
    else showToast('Settings saved! 🎉')
    setSaving(false)
  }

  if (authLoading || !loaded) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100%', background:'var(--bg-page)', fontFamily:F }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:34, height:34, border:'3px solid var(--accent-bg)', borderTopColor:'var(--accent)', borderRadius:'50%', animation:'spin .8s linear infinite', margin:'0 auto 10px' }} />
        <p style={{ color:'var(--text-muted)', fontSize:13 }}>Loading...</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div className="page-wrap" style={{ minHeight:'100%', background:'var(--bg-page)', padding:'20px 24px', fontFamily:F }}>

      {/* Toast */}
      {toast.msg && (
        <div style={{ position:'fixed', top:20, right:20, zIndex:100, background:'var(--bg-card)', border:`1px solid ${toast.type==='error'?'var(--red)':'var(--green)'}`, borderRadius:12, padding:'11px 16px', color:'var(--text-primary)', fontSize:13, fontWeight:500, boxShadow:'0 8px 24px rgba(0,0,0,0.15)', animation:'slideIn .2s ease', maxWidth:'calc(100vw - 40px)' }}>
          {toast.msg}
        </div>
      )}

      {/* Header with back button */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
        <button
          onClick={() => router.back()}
          style={{ width:36, height:36, borderRadius:10, border:'1px solid var(--border)', background:'var(--bg-card)', color:'var(--text-secondary)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .15s' }}
          onMouseEnter={e => { e.currentTarget.style.background='var(--accent-bg)'; e.currentTarget.style.color='var(--accent-text)' }}
          onMouseLeave={e => { e.currentTarget.style.background='var(--bg-card)'; e.currentTarget.style.color='var(--text-secondary)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>
          </svg>
        </button>
        <div>
          <h1 style={{ color:'var(--text-primary)', fontSize:20, fontWeight:700, margin:0 }}>Settings</h1>
          <p style={{ color:'var(--text-muted)', fontSize:12, marginTop:2 }}>Notification preferences</p>
        </div>
      </div>

      {/* WhatsApp */}
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, padding:'18px 20px', marginBottom:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
          <span style={{ fontSize:20 }}>📱</span>
          <div>
            <p style={{ color:'var(--text-primary)', fontSize:13, fontWeight:600, margin:0 }}>WhatsApp</p>
            <p style={{ color:'var(--text-muted)', fontSize:11, margin:'2px 0 0' }}>Receive alerts on WhatsApp</p>
          </div>
        </div>
        <Lbl text="WhatsApp Number (with country code)" />
        <input style={inp} placeholder="+919876543210" value={form.whatsapp_number} onChange={e => setForm(p => ({ ...p, whatsapp_number: e.target.value }))} />
        <p style={{ color:'var(--text-hint)', fontSize:11, margin:'6px 0 0' }}>
          ⚠ First send "join &lt;sandbox-code&gt;" to +1 415 523 8886 on WhatsApp
        </p>
      </div>

      {/* Email */}
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, padding:'18px 20px', marginBottom:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
          <span style={{ fontSize:20 }}>📧</span>
          <div>
            <p style={{ color:'var(--text-primary)', fontSize:13, fontWeight:600, margin:0 }}>Email</p>
            <p style={{ color:'var(--text-muted)', fontSize:11, margin:'2px 0 0' }}>Receive alerts via email</p>
          </div>
        </div>
        <Lbl text="Email Address" />
        <input style={inp} type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
      </div>

      {/* Notification types */}
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, padding:'18px 20px', marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
          <span style={{ fontSize:20 }}>🔔</span>
          <p style={{ color:'var(--text-primary)', fontSize:13, fontWeight:600, margin:0 }}>Notification Types</p>
        </div>
        {[
          { key:'due_reminder' as const, icon:'⏰', title:'Due Date Reminder', desc:'1 day before task due', time:'9:00 AM IST daily' },
          { key:'daily_summary' as const, icon:'📊', title:'Daily Summary',     desc:'Tasks done + time logged',  time:'7:00 PM IST daily' },
        ].map(item => (
          <div key={item.key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', borderRadius:12, marginBottom:8, background:'var(--bg-page)', border:'1px solid var(--border)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, flex:1, minWidth:0 }}>
              <span style={{ fontSize:20, flexShrink:0 }}>{item.icon}</span>
              <div style={{ minWidth:0 }}>
                <p style={{ color:'var(--text-primary)', fontSize:13, fontWeight:600, margin:0 }}>{item.title}</p>
                <p style={{ color:'var(--text-muted)', fontSize:11, margin:'2px 0 0' }}>{item.desc}</p>
                <p style={{ color:'var(--text-hint)', fontSize:10, margin:'1px 0 0' }}>🕐 {item.time}</p>
              </div>
            </div>
            {/* Toggle */}
            <button
              onClick={() => setForm(p => ({ ...p, [item.key]: !p[item.key] }))}
              style={{ width:42, height:23, borderRadius:12, border:'none', background: form[item.key] ? 'linear-gradient(135deg,var(--accent),var(--accent-2))' : 'var(--border)', cursor:'pointer', position:'relative', transition:'all .2s', flexShrink:0, marginLeft:12 }}
            >
              <div style={{ position:'absolute', top:2, left: form[item.key] ? 21 : 2, width:19, height:19, borderRadius:'50%', background:'#fff', transition:'left .2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }} />
            </button>
          </div>
        ))}
      </div>

      {/* Save button */}
      <button onClick={handleSave} disabled={saving}
        style={{ width:'100%', padding:'13px 0', borderRadius:12, border:'none', background: saving ? 'var(--accent-bg)' : 'linear-gradient(135deg,var(--accent),var(--accent-2))', color: saving ? 'var(--accent-text)' : '#fff', fontSize:14, fontWeight:600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily:F, boxShadow: saving ? 'none' : '0 4px 16px rgba(124,58,237,0.3)' }}
      >
        {saving ? 'Saving...' : '💾 Save Settings'}
      </button>

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        input::placeholder{color:var(--text-muted)}
        @media(max-width:768px){ .page-wrap{padding:14px!important} }
      `}</style>
    </div>
  )
}

function Lbl({ text }: { text: string }) {
  return <label style={{ display:'block', color:'var(--text-muted)', fontSize:11, fontWeight:600, marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>{text}</label>
}
