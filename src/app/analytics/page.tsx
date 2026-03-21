'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, CartesianGrid,
} from 'recharts'

const F      = "'DM Sans','Segoe UI',sans-serif"
const COLORS = ['#818cf8','#34d399','#f87171','#fbbf24','#f472b6','#38bdf8']

export default function AnalyticsPage() {
  const router = useRouter()
  const [weeklyData,   setWeeklyData]   = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [streak,       setStreak]       = useState(0)
  const [totalTime,    setTotalTime]    = useState(0)
  const [totalDone,    setTotalDone]    = useState(0)
  const [bestDay,      setBestDay]      = useState(0)
  const [loading,      setLoading]      = useState(true)
  const [mounted,      setMounted]      = useState(false)

  // Read CSS variable at runtime for chart theming
  const getVar = (v: string) => {
    if (typeof window === 'undefined') return '#fff'
    return getComputedStyle(document.documentElement).getPropertyValue(v).trim()
  }

  useEffect(() => {
    setMounted(true)
    const load = async () => {
      const { data:{ user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const last7 = Array.from({ length:7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate()-(6-i))
        return d.toISOString().split('T')[0]
      })

      const [{ data:logsData }, { data:tasksData }, { data:allTasks }] = await Promise.all([
        supabase.from('learning_logs').select('logged_date,time_spent_mins').eq('user_id',user.id).gte('logged_date',last7[0]),
        supabase.from('tasks').select('completed_at,categories(name)').eq('user_id',user.id).eq('status','completed').gte('completed_at',last7[0]+'T00:00:00'),
        supabase.from('tasks').select('status,categories(name)').eq('user_id',user.id),
      ])

      const weekly = last7.map(date => {
        const dayLogs  = logsData?.filter(l=>l.logged_date===date)||[]
        const dayTasks = tasksData?.filter(t=>t.completed_at?.startsWith(date))||[]
        return {
          day:       new Date(date+'T00:00:00').toLocaleDateString('en-IN',{weekday:'short'}),
          time:      dayLogs.reduce((s,l)=>s+l.time_spent_mins,0),
          completed: dayTasks.length,
        }
      })
      setWeeklyData(weekly)
      setBestDay(Math.max(0,...weekly.map(d=>d.completed)))

      const catMap: Record<string,{completed:number;total:number}> = {}
      allTasks?.forEach(t => {
        const name = (t.categories as any)?.name||'Uncategorised'
        if (!catMap[name]) catMap[name] = { completed:0, total:0 }
        catMap[name].total++
        if (t.status==='completed') catMap[name].completed++
      })
      setCategoryData(Object.entries(catMap).map(([name,v])=>({ name,...v })))
      setTotalTime(logsData?.reduce((s,l)=>s+l.time_spent_mins,0)||0)
      setTotalDone(tasksData?.length||0)

      let s = 0
      for (let i=last7.length-1; i>=0; i--) {
        if (logsData?.some(l=>l.logged_date===last7[i])) s++
        else break
      }
      setStreak(s)
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100%', background:'var(--bg-page)', fontFamily:F }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:36, height:36, border:'3px solid var(--accent-bg)', borderTopColor:'var(--accent)', borderRadius:'50%', animation:'spin .8s linear infinite', margin:'0 auto 10px' }} />
        <p style={{ color:'var(--text-muted)', fontSize:13 }}>Loading analytics...</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const tooltipStyle = {
    contentStyle: {
      background:'var(--bg-card)', border:'1px solid var(--border)',
      borderRadius:10, fontSize:12, fontFamily:F,
      boxShadow:'0 8px 24px rgba(0,0,0,0.15)',
      color:'var(--text-primary)',
    },
    labelStyle:  { color:'var(--text-primary)', fontWeight:600 },
    itemStyle:   { color:'var(--text-secondary)' },
    cursor:      { fill:'var(--border)' },
  }

  const axisProps = {
    tick: { fill:'var(--text-muted)', fontSize:11, fontFamily:F },
    axisLine: false as const,
    tickLine: false as const,
  }

  return (
    <div style={{ minHeight:'100%', background:'var(--bg-page)', padding:'28px 32px', fontFamily:F, opacity:mounted?1:0, transition:'opacity .4s ease' }}>

      {/* Header */}
      <div style={{ marginBottom:28 }}>
        <h1 style={{ color:'var(--text-primary)', fontSize:26, fontWeight:700, margin:0 }}>Analytics</h1>
        <p style={{ color:'var(--text-muted)', fontSize:13, marginTop:4 }}>Your learning progress — last 7 days</p>
      </div>

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:22 }}>
        {[
          { label:'Current Streak',  value:`${streak} day${streak!==1?'s':''}`, icon:'🔥', color:'#f97316', border:'rgba(249,115,22,0.2)',  sub:streak>0?'Keep it up!':'Start today' },
          { label:'Time This Week',  value:`${totalTime} min`,                   icon:'⏱️', color:'var(--green)',  border:'rgba(52,211,153,0.2)',  sub:`${Math.round(totalTime/60*10)/10}h total` },
          { label:'Tasks Completed', value:`${totalDone}`,                       icon:'✅', color:'#818cf8',      border:'rgba(129,140,248,0.2)', sub:'this week' },
          { label:'Best Day',        value:`${bestDay} tasks`,                   icon:'🏆', color:'var(--yellow)', border:'rgba(251,191,36,0.2)',  sub:'single day record' },
        ].map((s,i) => (
          <div key={i} style={{
            background:'var(--bg-card)', border:`1px solid ${s.border}`,
            borderRadius:16, padding:'18px 20px', cursor:'default',
            transition:'transform .2s',
          }}
          onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
          onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}
          >
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
              <p style={{ color:'var(--text-secondary)', fontSize:12, margin:0 }}>{s.label}</p>
              <span style={{ fontSize:20 }}>{s.icon}</span>
            </div>
            <p style={{ color:s.color, fontSize:26, fontWeight:700, margin:'0 0 4px', lineHeight:1 }}>{s.value}</p>
            <p style={{ color:'var(--text-muted)', fontSize:11, margin:0 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>

        {/* Bar chart */}
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding:'20px 20px 12px' }}>
          <p style={{ color:'var(--text-primary)', fontSize:13, fontWeight:600, margin:'0 0 4px' }}>Tasks completed</p>
          <p style={{ color:'var(--text-muted)', fontSize:12, margin:'0 0 16px' }}>Per day this week</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
              <XAxis dataKey="day" {...axisProps}/>
              <YAxis {...axisProps} allowDecimals={false}/>
              <Tooltip {...tooltipStyle}/>
              <Bar dataKey="completed" name="Tasks" radius={[6,6,0,0]} fill="var(--accent)"/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line chart */}
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding:'20px 20px 12px' }}>
          <p style={{ color:'var(--text-primary)', fontSize:13, fontWeight:600, margin:'0 0 4px' }}>Learning time</p>
          <p style={{ color:'var(--text-muted)', fontSize:12, margin:'0 0 16px' }}>Minutes per day</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
              <XAxis dataKey="day" {...axisProps}/>
              <YAxis {...axisProps}/>
              <Tooltip {...tooltipStyle}/>
              <Line type="monotone" dataKey="time" name="Minutes" stroke="var(--green)" strokeWidth={2.5}
                dot={{ fill:'var(--green)', r:4, strokeWidth:0 }}
                activeDot={{ r:6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category breakdown */}
      {categoryData.length>0 ? (
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding:'20px 24px' }}>
          <p style={{ color:'var(--text-primary)', fontSize:13, fontWeight:600, margin:'0 0 4px' }}>Category breakdown</p>
          <p style={{ color:'var(--text-muted)', fontSize:12, margin:'0 0 20px' }}>Tasks completed per topic</p>
          <div style={{ display:'flex', alignItems:'center', gap:32, flexWrap:'wrap' }}>
            <div style={{ flexShrink:0 }}>
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={categoryData} dataKey="total" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={48} paddingAngle={3}>
                    {categoryData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                  </Pie>
                  <Tooltip {...tooltipStyle}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex:1, minWidth:200 }}>
              {categoryData.map((cat,i) => {
                const pct = cat.total>0 ? Math.round((cat.completed/cat.total)*100) : 0
                const color = COLORS[i%COLORS.length]
                return (
                  <div key={cat.name} style={{ marginBottom:14 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ width:10, height:10, borderRadius:'50%', background:color }}/>
                        <span style={{ color:'var(--text-primary)', fontSize:13, fontWeight:500 }}>{cat.name}</span>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ color:'var(--text-muted)', fontSize:12 }}>{cat.completed}/{cat.total}</span>
                        <span style={{ color, fontSize:12, fontWeight:700, minWidth:34, textAlign:'right' }}>{pct}%</span>
                      </div>
                    </div>
                    <div style={{ height:6, borderRadius:6, background:'var(--border)', overflow:'hidden' }}>
                      <div style={{ height:'100%', borderRadius:6, background:color, width:`${pct}%`, transition:'width .8s ease' }}/>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding:'48px 24px', textAlign:'center' }}>
          <p style={{ fontSize:36, margin:'0 0 12px' }}>📊</p>
          <p style={{ color:'var(--text-muted)', fontSize:13, margin:0 }}>Complete some tasks to see category analytics!</p>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
