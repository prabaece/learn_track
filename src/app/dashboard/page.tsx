'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Task, LearningLog } from '@/lib/types'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const F = "'DM Sans','Segoe UI',sans-serif"

export default function DashboardPage() {
  const router = useRouter()
  const [tasks,    setTasks]    = useState<Task[]>([])
  const [logs,     setLogs]     = useState<LearningLog[]>([])
  const [loading,  setLoading]  = useState(true)
  const [userName, setUserName] = useState('')
  const [mounted,  setMounted]  = useState(false)

  useEffect(() => {
    setMounted(true)
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'there')
      const [{ data: t }, { data: l }] = await Promise.all([
        supabase.from('tasks').select('*,categories(*)').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('learning_logs').select('*').eq('user_id', user.id).eq('logged_date', new Date().toISOString().split('T')[0]),
      ])
      setTasks(t || [])
      setLogs(l || [])
      setLoading(false)
    }
    init()
  }, [router])

  const total      = tasks.length
  const completed  = tasks.filter(t => t.status === 'completed').length
  const inProgress = tasks.filter(t => t.status === 'in_progress').length
  const todo       = tasks.filter(t => t.status === 'todo').length
  const todayMins  = logs.reduce((s, l) => s + l.time_spent_mins, 0)
  const rate       = total > 0 ? Math.round((completed / total) * 100) : 0

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100%', background:'var(--bg-page)', fontFamily:F }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:36, height:36, border:'3px solid var(--accent-bg)', borderTopColor:'var(--accent)', borderRadius:'50%', animation:'spin .8s linear infinite', margin:'0 auto 10px' }} />
        <p style={{ color:'var(--text-muted)', fontSize:13 }}>Loading dashboard...</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ minHeight:'100%', background:'var(--bg-page)', padding:'28px 32px', fontFamily:F, opacity:mounted?1:0, transition:'opacity .4s ease' }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 }}>
        <div>
          <p style={{ color:'var(--text-muted)', fontSize:13, margin:'0 0 4px' }}>{greeting()},</p>
          <h1 style={{ color:'var(--text-primary)', fontSize:26, fontWeight:700, margin:0 }}>
            {userName} <span style={{ fontSize:22 }}>👋</span>
          </h1>
          <p style={{ color:'var(--text-muted)', fontSize:13, marginTop:4 }}>
            {new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
          </p>
        </div>
        <Link href="/tasks" style={{
          textDecoration:'none', padding:'10px 18px', borderRadius:12,
          background:'linear-gradient(135deg,var(--accent),var(--accent-2))',
          color:'#fff', fontSize:13, fontWeight:600,
          boxShadow:'0 4px 18px rgba(124,58,237,0.3)',
          display:'flex', alignItems:'center', gap:7,
        }}>
          <span style={{ fontSize:16, lineHeight:1 }}>+</span> Add Task
        </Link>
      </div>

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:22 }}>
        {[
          { label:'Total Tasks',  value:total,      icon:'📋', color:'#818cf8', border:'rgba(129,140,248,0.2)', sub:'all time' },
          { label:'Completed',    value:completed,  icon:'✅', color:'var(--green)',  border:'rgba(52,211,153,0.2)',  sub:`${rate}% done` },
          { label:'In Progress',  value:inProgress, icon:'⚡', color:'var(--yellow)', border:'rgba(251,191,36,0.2)',  sub:'active now' },
          { label:'Today (mins)', value:todayMins,  icon:'⏱️', color:'var(--blue)',   border:'rgba(56,189,248,0.2)',  sub:'logged today' },
        ].map((s, i) => (
          <div key={i} style={{
            background:'var(--bg-card)', border:`1px solid ${s.border}`,
            borderRadius:16, padding:'18px 20px', cursor:'default',
            transition:'transform .2s, box-shadow .2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=`0 8px 24px ${s.border}` }}
          onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none' }}
          >
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
              <p style={{ color:'var(--text-secondary)', fontSize:12, margin:0 }}>{s.label}</p>
              <span style={{ fontSize:18 }}>{s.icon}</span>
            </div>
            <p style={{ color:s.color, fontSize:30, fontWeight:700, margin:'0 0 4px', lineHeight:1 }}>{s.value}</p>
            <p style={{ color:'var(--text-muted)', fontSize:11, margin:0 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Progress + Quick actions */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:14, marginBottom:22 }}>

        {/* Progress */}
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding:'20px 24px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div>
              <p style={{ color:'var(--text-primary)', fontSize:14, fontWeight:600, margin:0 }}>Overall Progress</p>
              <p style={{ color:'var(--text-muted)', fontSize:12, marginTop:2 }}>{completed} of {total} tasks completed</p>
            </div>
            <div style={{
              width:52, height:52, borderRadius:'50%', flexShrink:0,
              background:`conic-gradient(var(--accent) ${rate*3.6}deg, var(--border) 0deg)`,
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <div style={{ width:38, height:38, borderRadius:'50%', background:'var(--bg-card)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span style={{ color:'var(--accent-text)', fontSize:11, fontWeight:700 }}>{rate}%</span>
              </div>
            </div>
          </div>

          <div style={{ height:8, borderRadius:8, background:'var(--border)', overflow:'hidden', display:'flex', marginBottom:12 }}>
            {completed>0  && <div style={{ width:`${total>0?(completed/total)*100:0}%`,  background:'linear-gradient(90deg,var(--accent),var(--accent-2))', transition:'width .8s ease' }} />}
            {inProgress>0 && <div style={{ width:`${total>0?(inProgress/total)*100:0}%`, background:'var(--yellow)', transition:'width .8s ease' }} />}
            {todo>0       && <div style={{ width:`${total>0?(todo/total)*100:0}%`,        background:'var(--border-hover)', transition:'width .8s ease' }} />}
          </div>

          <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
            {[
              { color:'var(--accent)',         label:'Completed',   count:completed  },
              { color:'var(--yellow)',          label:'In Progress', count:inProgress },
              { color:'var(--text-hint)',       label:'To Do',       count:todo       },
            ].map(l => (
              <div key={l.label} style={{ display:'flex', alignItems:'center', gap:5 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:l.color, flexShrink:0 }} />
                <span style={{ color:'var(--text-muted)', fontSize:11 }}>{l.label} ({l.count})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding:'20px', display:'flex', flexDirection:'column', gap:10 }}>
          <p style={{ color:'var(--text-muted)', fontSize:11, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', margin:0 }}>Quick Actions</p>
          {[
            { href:'/tasks',     label:'Add new task',   sub:'Create & track',    icon:'+' },
            { href:'/tasks',     label:'View all tasks', sub:`${total} total`,     icon:'✓' },
            { href:'/analytics', label:'Analytics',      sub:'Charts & progress',  icon:'↗' },
          ].map(a => (
            <Link key={a.href+a.label} href={a.href} style={{
              textDecoration:'none', display:'flex', alignItems:'center', gap:12,
              padding:'10px 12px', borderRadius:10,
              background:'var(--bg-page)', border:'1px solid var(--border)',
              transition:'all .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background='var(--accent-bg)'; e.currentTarget.style.borderColor='var(--accent-border)' }}
            onMouseLeave={e => { e.currentTarget.style.background='var(--bg-page)'; e.currentTarget.style.borderColor='var(--border)' }}
            >
              <div style={{
                width:32, height:32, borderRadius:8, flexShrink:0,
                background:'var(--accent-bg)', border:'1px solid var(--accent-border)',
                display:'flex', alignItems:'center', justifyContent:'center',
                color:'var(--accent-text)', fontSize:15, fontWeight:700,
              }}>{a.icon}</div>
              <div>
                <p style={{ color:'var(--text-primary)', fontSize:12, fontWeight:500, margin:0 }}>{a.label}</p>
                <p style={{ color:'var(--text-muted)', fontSize:11, margin:0 }}>{a.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent tasks */}
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding:'20px 24px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div>
            <p style={{ color:'var(--text-primary)', fontSize:14, fontWeight:600, margin:0 }}>Recent Tasks</p>
            <p style={{ color:'var(--text-muted)', fontSize:12, marginTop:2 }}>Your latest learning activities</p>
          </div>
          <Link href="/tasks" style={{
            textDecoration:'none', color:'var(--accent-text)', fontSize:12, fontWeight:500,
            padding:'6px 12px', borderRadius:8,
            border:'1px solid var(--accent-border)', background:'var(--accent-bg)',
          }}>View all →</Link>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {tasks.slice(0,6).map(task => {
            const sc: Record<string,{color:string;bg:string;label:string}> = {
              completed:   { color:'var(--green)',          bg:'var(--green-bg)',  label:'Done'        },
              in_progress: { color:'var(--yellow)',         bg:'var(--yellow-bg)', label:'In Progress' },
              todo:        { color:'var(--text-secondary)', bg:'var(--border)',    label:'To Do'       },
            }
            const pc: Record<string,string> = { high:'var(--red)', medium:'var(--yellow)', low:'var(--green)' }
            const s = sc[task.status]
            return (
              <div key={task.id} style={{
                display:'flex', alignItems:'center', gap:12,
                padding:'11px 14px', borderRadius:12,
                background:'var(--bg-page)', border:'1px solid var(--border)',
                transition:'all .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background='var(--bg-card-hover)'; e.currentTarget.style.borderColor='var(--border-hover)' }}
              onMouseLeave={e => { e.currentTarget.style.background='var(--bg-page)'; e.currentTarget.style.borderColor='var(--border)' }}
              >
                <div style={{ width:8, height:8, borderRadius:'50%', background:s.color, flexShrink:0 }} />
                <span style={{ flex:1, fontSize:13, minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:task.status==='completed'?'var(--text-hint)':'var(--text-primary)', textDecoration:task.status==='completed'?'line-through':'none' }}>
                  {task.title}
                </span>
                {task.categories && (
                  <span style={{ fontSize:11, padding:'2px 8px', borderRadius:6, background:'var(--border)', color:'var(--text-secondary)', flexShrink:0 }}>
                    {(task.categories as any).name}
                  </span>
                )}
                <span style={{ fontSize:11, fontWeight:500, color:pc[task.priority], flexShrink:0 }}>{task.priority}</span>
                <span style={{ fontSize:10, padding:'2px 8px', borderRadius:6, background:s.bg, color:s.color, fontWeight:600, flexShrink:0 }}>{s.label}</span>
              </div>
            )
          })}
          {tasks.length===0 && (
            <div style={{ textAlign:'center', padding:'32px 0' }}>
              <p style={{ fontSize:32, margin:'0 0 8px' }}>📝</p>
              <p style={{ color:'var(--text-muted)', fontSize:13, margin:'0 0 12px' }}>No tasks yet. Start your learning journey!</p>
              <Link href="/tasks" style={{ textDecoration:'none', color:'var(--accent-text)', fontSize:13, fontWeight:500, padding:'8px 16px', borderRadius:8, border:'1px solid var(--accent-border)', background:'var(--accent-bg)' }}>
                Add your first task →
              </Link>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
