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

const tt = {
  contentStyle: { background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, fontSize:12, fontFamily:F, boxShadow:'0 8px 24px rgba(0,0,0,0.15)', color:'var(--text-primary)' },
  labelStyle:   { color:'var(--text-primary)', fontWeight:600 },
  itemStyle:    { color:'var(--text-secondary)' },
  cursor:       { fill:'var(--border)' },
}
const ax = { tick:{ fill:'var(--text-muted)', fontSize:11, fontFamily:F }, axisLine:false as const, tickLine:false as const }

export default function AnalyticsPage() {
  const router = useRouter()
  const [weeklyData,   setWeeklyData]   = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [streak,       setStreak]       = useState(0)
  const [totalTime,    setTotalTime]    = useState(0)
  const [totalDone,    setTotalDone]    = useState(0)
  const [bestDay,      setBestDay]      = useState(0)
  const [loading,      setLoading]      = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const last7 = Array.from({ length:7 }, (_,i) => {
        const d = new Date(); d.setDate(d.getDate()-(6-i))
        return d.toISOString().split('T')[0]
      })

      const [{ data:logsData }, { data:tasksData }, { data:allTasks }] = await Promise.all([
        supabase.from('learning_logs').select('logged_date,time_spent_mins').eq('user_id',user.id).gte('logged_date',last7[0]),
        supabase.from('tasks').select('completed_at,categories(name)').eq('user_id',user.id).eq('status','completed').gte('completed_at',last7[0]+'T00:00:00'),
        supabase.from('tasks').select('status,categories(name)').eq('user_id',user.id),
      ])

      const weekly = last7.map(date => ({
        day:       new Date(date+'T00:00:00').toLocaleDateString('en-IN',{weekday:'short'}),
        time:      (logsData?.filter(l=>l.logged_date===date)||[]).reduce((s,l)=>s+l.time_spent_mins,0),
        completed: (tasksData?.filter(t=>t.completed_at?.startsWith(date))||[]).length,
      }))
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
      for (let i=last7.length-1;i>=0;i--) {
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
        <div style={{ width:34, height:34, border:'3px solid var(--accent-bg)', borderTopColor:'var(--accent)', borderRadius:'50%', animation:'spin .8s linear infinite', margin:'0 auto 10px' }} />
        <p style={{ color:'var(--text-muted)', fontSize:13 }}>Loading analytics...</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const hrs  = Math.floor(totalTime/60)
  const mins = totalTime%60

  return (
    <div className="page-wrap" style={{ minHeight:'100%', background:'var(--bg-page)', padding:'20px 24px', fontFamily:F }}>

      <div style={{ marginBottom:20 }}>
        <h1 style={{ color:'var(--text-primary)', fontSize:22, fontWeight:700, margin:0 }}>Analytics</h1>
        <p style={{ color:'var(--text-muted)', fontSize:12, marginTop:3 }}>Last 7 days overview</p>
      </div>

      {/* Stat cards */}
      <div className="stats-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:18 }}>
        {[
          { label:'Streak',        value:`${streak}d`,                                icon:'🔥', color:'#f97316', border:'rgba(249,115,22,0.2)',  sub:streak>0?'Keep going!':'Start today' },
          { label:'Time logged',   value: hrs>0?`${hrs}h ${mins}m`:`${totalTime}m`,  icon:'⏱️', color:'var(--green)',  border:'rgba(52,211,153,0.2)',  sub:'this week' },
          { label:'Tasks done',    value:`${totalDone}`,                              icon:'✅', color:'#818cf8',      border:'rgba(129,140,248,0.2)', sub:'this week' },
          { label:'Best day',      value:`${bestDay} tasks`,                          icon:'🏆', color:'var(--yellow)', border:'rgba(251,191,36,0.2)',  sub:'single day' },
        ].map((s,i) => (
          <div key={i} style={{ background:'var(--bg-card)', border:`1px solid ${s.border}`, borderRadius:14, padding:'14px 16px', cursor:'default', transition:'transform .2s' }}
            onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
            onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}
          >
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
              <p style={{ color:'var(--text-secondary)', fontSize:11, margin:0 }}>{s.label}</p>
              <span style={{ fontSize:16 }}>{s.icon}</span>
            </div>
            <p style={{ color:s.color, fontSize:20, fontWeight:700, margin:'0 0 3px', lineHeight:1 }}>{s.value}</p>
            <p style={{ color:'var(--text-muted)', fontSize:10, margin:0 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts — stack on mobile */}
      <div className="charts-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>

        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, padding:'16px' }}>
          <p style={{ color:'var(--text-primary)', fontSize:12, fontWeight:600, margin:'0 0 3px' }}>Tasks completed</p>
          <p style={{ color:'var(--text-muted)', fontSize:11, margin:'0 0 14px' }}>Per day this week</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weeklyData} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
              <XAxis dataKey="day" {...ax}/>
              <YAxis {...ax} allowDecimals={false}/>
              <Tooltip {...tt}/>
              <Bar dataKey="completed" name="Tasks" fill="var(--accent)" radius={[5,5,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, padding:'16px' }}>
          <p style={{ color:'var(--text-primary)', fontSize:12, fontWeight:600, margin:'0 0 3px' }}>Learning time</p>
          <p style={{ color:'var(--text-muted)', fontSize:11, margin:'0 0 14px' }}>Minutes per day</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
              <XAxis dataKey="day" {...ax}/>
              <YAxis {...ax}/>
              <Tooltip {...tt}/>
              <Line type="monotone" dataKey="time" name="Minutes" stroke="var(--green)" strokeWidth={2.5}
                dot={{ fill:'var(--green)', r:3, strokeWidth:0 }} activeDot={{ r:5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category breakdown */}
  {categoryData.length > 0 ? (
  <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, padding:'16px 20px' }}>
    <p style={{ color:'var(--text-primary)', fontSize:12, fontWeight:600, margin:'0 0 3px' }}>Category breakdown</p>
    <p style={{ color:'var(--text-muted)', fontSize:11, margin:'0 0 16px' }}>Completion per topic</p>

    {/* Mobile: stack vertically, Desktop: side by side */}
    <div className="pie-wrap" style={{ display:'flex', alignItems:'center', gap:24 }}>
      {/* Pie chart — full width on mobile */}
    <div style={{ flexShrink:0, width:'100%', maxWidth:220, margin:'0 auto' }}>
  <ResponsiveContainer width="100%" height={220}>
    <PieChart>
      <Pie
        data={categoryData}
        dataKey="total"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={90}
        innerRadius={50}
        paddingAngle={3}
      >
        {categoryData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
      </Pie>
      <Tooltip {...tt}/>
    </PieChart>
  </ResponsiveContainer>
</div>

      {/* Progress bars */}
      <div style={{ flex:1, minWidth:0, width:'100%' }}>
        {categoryData.map((cat,i) => {
          const pct   = cat.total>0 ? Math.round((cat.completed/cat.total)*100) : 0
          const color = COLORS[i%COLORS.length]
          return (
            <div key={cat.name} style={{ marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
                <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                  <div style={{ width:9, height:9, borderRadius:'50%', background:color }}/>
                  <span style={{ color:'var(--text-primary)', fontSize:12, fontWeight:500 }}>{cat.name}</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ color:'var(--text-muted)', fontSize:11 }}>{cat.completed}/{cat.total}</span>
                  <span style={{ color, fontSize:11, fontWeight:700, minWidth:30, textAlign:'right' }}>{pct}%</span>
                </div>
              </div>
              <div style={{ height:5, borderRadius:5, background:'var(--border)', overflow:'hidden' }}>
                <div style={{ height:'100%', borderRadius:5, background:color, width:`${pct}%`, transition:'width .8s ease' }}/>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  </div>
) : (
  <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, padding:'40px', textAlign:'center' }}>
    <p style={{ fontSize:32, margin:'0 0 10px' }}>📊</p>
    <p style={{ color:'var(--text-muted)', fontSize:13 }}>Complete tasks to see analytics!</p>
  </div>
)}

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:768px){
          .stats-grid{grid-template-columns:repeat(2,1fr)!important;gap:10px!important}
          .charts-grid{grid-template-columns:1fr!important}
          .pie-wrap{flex-direction:column!important}
          .page-wrap{padding:14px!important}
        }
      `}</style>
    </div>
  )
}
