'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Task, Category, TaskStatus, Priority } from '@/lib/types'
import { useRouter } from 'next/navigation'

const F = "'DM Sans','Segoe UI',sans-serif"

const inp: React.CSSProperties = {
  width:'100%', boxSizing:'border-box',
  background:'var(--bg-input)', border:'1px solid var(--border-input)',
  borderRadius:10, padding:'10px 14px',
  color:'var(--text-primary)', fontSize:13, outline:'none', fontFamily:F,
  transition:'border-color .2s',
}

export default function TasksPage() {
  const router = useRouter()
  const [tasks,      setTasks]      = useState<Task[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filter,     setFilter]     = useState<TaskStatus|'all'>('all')
  const [showModal,  setShowModal]  = useState(false)
  const [editTask,   setEditTask]   = useState<Task|null>(null)
  const [userId,     setUserId]     = useState('')
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [mounted,    setMounted]    = useState(false)

  const fetchTasks = useCallback(async (uid: string) => {
    const { data } = await supabase.from('tasks').select('*,categories(*)').eq('user_id', uid).order('created_at', { ascending:false })
    setTasks(data || [])
  }, [])

  const fetchCategories = useCallback(async (uid: string) => {
    const { data } = await supabase.from('categories').select('*').eq('user_id', uid)
    setCategories(data || [])
  }, [])

  useEffect(() => {
    setMounted(true)
    const init = async () => {
      const { data:{ user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)
      await Promise.all([fetchTasks(user.id), fetchCategories(user.id)])
      setLoading(false)
    }
    init()
  }, [router, fetchTasks, fetchCategories])

  const updateStatus = async (id: string, status: TaskStatus) => {
    const updates: Partial<Task> = { status }
    if (status==='completed') updates.completed_at = new Date().toISOString()
    else updates.completed_at = null
    await supabase.from('tasks').update(updates).eq('id', id)
    setTasks(prev => prev.map(t => t.id===id ? { ...t, ...updates } : t))
  }

  const deleteTask = async (id: string) => {
    if (!confirm('Delete this task?')) return
    await supabase.from('tasks').delete().eq('id', id)
    setTasks(prev => prev.filter(t => t.id!==id))
  }

  const counts = {
    all: tasks.length,
    todo: tasks.filter(t=>t.status==='todo').length,
    in_progress: tasks.filter(t=>t.status==='in_progress').length,
    completed: tasks.filter(t=>t.status==='completed').length,
  }

  const filtered = (filter==='all' ? tasks : tasks.filter(t=>t.status===filter))
    .filter(t => !search || t.title.toLowerCase().includes(search.toLowerCase()))

  const tabs = [
    { key:'all',         label:'All',        count:counts.all,         color:'var(--accent-text)' },
    { key:'todo',        label:'To Do',       count:counts.todo,        color:'var(--text-secondary)' },
    { key:'in_progress', label:'In Progress', count:counts.in_progress, color:'var(--yellow)' },
    { key:'completed',   label:'Completed',   count:counts.completed,   color:'var(--green)' },
  ] as const

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100%', background:'var(--bg-page)', fontFamily:F }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:36, height:36, border:'3px solid var(--accent-bg)', borderTopColor:'var(--accent)', borderRadius:'50%', animation:'spin .8s linear infinite', margin:'0 auto 10px' }} />
        <p style={{ color:'var(--text-muted)', fontSize:13 }}>Loading tasks...</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ minHeight:'100%', background:'var(--bg-page)', padding:'28px 32px', fontFamily:F, opacity:mounted?1:0, transition:'opacity .4s ease' }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 }}>
        <div>
          <h1 style={{ color:'var(--text-primary)', fontSize:26, fontWeight:700, margin:0 }}>Tasks</h1>
          <p style={{ color:'var(--text-muted)', fontSize:13, marginTop:4 }}>{tasks.length} total tasks</p>
        </div>
        <button onClick={() => { setEditTask(null); setShowModal(true) }}
          style={{
            padding:'10px 20px', borderRadius:12, border:'none',
            background:'linear-gradient(135deg,var(--accent),var(--accent-2))',
            color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer',
            boxShadow:'0 4px 18px rgba(124,58,237,0.3)',
            display:'flex', alignItems:'center', gap:7, fontFamily:F,
          }}
        >
          <span style={{ fontSize:18, lineHeight:1 }}>+</span> Add Task
        </button>
      </div>

      {/* Search + Filters */}
      <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ position:'relative', flex:'1 1 220px', minWidth:180 }}>
          <svg style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', pointerEvents:'none' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search tasks..."
            style={{ ...inp, paddingLeft:36 }}
          />
        </div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {tabs.map(tab => {
            const active = filter===tab.key
            return (
              <button key={tab.key} onClick={()=>setFilter(tab.key)}
                style={{
                  padding:'7px 14px', borderRadius:10, border:'none', cursor:'pointer',
                  fontSize:12, fontWeight:600, fontFamily:F, transition:'all .15s',
                  background: active ? 'var(--accent-bg)' : 'var(--bg-card)',
                  color: active ? tab.color : 'var(--text-muted)',
                  outline: active ? '1px solid var(--accent-border)' : '1px solid var(--border)',
                }}
              >
                {tab.label}
                <span style={{ marginLeft:6, opacity:.6, fontSize:11 }}>({tab.count})</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Task list */}
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {filtered.map(task => (
          <TaskCard key={task.id} task={task}
            onStatusChange={updateStatus}
            onEdit={() => { setEditTask(task); setShowModal(true) }}
            onDelete={() => deleteTask(task.id)}
          />
        ))}
        {filtered.length===0 && (
          <div style={{ textAlign:'center', padding:'64px 0' }}>
            <p style={{ fontSize:40, margin:'0 0 12px' }}>📝</p>
            <p style={{ color:'var(--text-muted)', fontSize:14, margin:'0 0 16px' }}>
              {search ? `No tasks found for "${search}"` : 'No tasks here. Add one!'}
            </p>
            {!search && (
              <button onClick={() => { setEditTask(null); setShowModal(true) }}
                style={{ padding:'9px 20px', borderRadius:10, border:'1px solid var(--accent-border)', background:'var(--accent-bg)', color:'var(--accent-text)', fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:F }}
              >+ Add your first task</button>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <TaskModal task={editTask} categories={categories} userId={userId}
          onClose={()=>setShowModal(false)}
          onSave={()=>{ setShowModal(false); fetchTasks(userId) }}
        />
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// ── TaskCard ──────────────────────────────────────────
function TaskCard({ task, onStatusChange, onEdit, onDelete }: {
  task: Task
  onStatusChange: (id:string, s:TaskStatus) => void
  onEdit: () => void
  onDelete: () => void
}) {
  const [hovered, setHovered] = useState(false)

  const pc: Record<Priority,{color:string;bg:string}> = {
    high:   { color:'var(--red)',    bg:'var(--red-bg)'    },
    medium: { color:'var(--yellow)', bg:'var(--yellow-bg)' },
    low:    { color:'var(--green)',  bg:'var(--green-bg)'  },
  }
  const sc: Record<TaskStatus,{color:string;bg:string;label:string}> = {
    completed:   { color:'var(--green)',          bg:'var(--green-bg)',  label:'Done'        },
    in_progress: { color:'var(--yellow)',         bg:'var(--yellow-bg)', label:'In Progress' },
    todo:        { color:'var(--text-secondary)', bg:'var(--border)',    label:'To Do'       },
  }
  const p  = pc[task.priority]
  const s  = sc[task.status]
  const done = task.status==='completed'

  return (
    <div
      onMouseEnter={()=>setHovered(true)}
      onMouseLeave={()=>setHovered(false)}
      style={{
        background: hovered ? 'var(--bg-card-hover)' : 'var(--bg-card)',
        border:`1px solid ${hovered ? 'var(--border-hover)' : 'var(--border)'}`,
        borderRadius:14, padding:'14px 16px', transition:'all .15s', fontFamily:F,
      }}
    >
      <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>

        {/* Toggle */}
        <button onClick={()=>onStatusChange(task.id, done?'todo':'completed')}
          style={{
            width:22, height:22, borderRadius:'50%', flexShrink:0, marginTop:1,
            border:`2px solid ${done?'var(--green)':'var(--border-hover)'}`,
            background: done ? 'var(--green)' : 'transparent',
            cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
            transition:'all .2s',
          }}
        >
          {done && <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </button>

        {/* Body */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:8, marginBottom:4 }}>
            <span style={{ fontSize:14, fontWeight:500, color:done?'var(--text-hint)':'var(--text-primary)', textDecoration:done?'line-through':'none' }}>
              {task.title}
            </span>
            <span style={{ fontSize:11, padding:'2px 8px', borderRadius:6, fontWeight:600, background:p.bg, color:p.color }}>
              {task.priority}
            </span>
            {task.categories && (
              <span style={{ fontSize:11, padding:'2px 8px', borderRadius:6, background:'var(--border)', color:'var(--text-secondary)' }}>
                {(task.categories as any).name}
              </span>
            )}
            <span style={{ fontSize:11, padding:'2px 8px', borderRadius:6, fontWeight:600, background:s.bg, color:s.color, marginLeft:'auto' }}>
              {s.label}
            </span>
          </div>
          {task.description && (
            <p style={{ fontSize:12, color:'var(--text-muted)', margin:'4px 0 6px', lineHeight:1.5 }}>{task.description}</p>
          )}
          {task.due_date && (
            <p style={{ fontSize:11, color:'var(--text-muted)', margin:'4px 0 6px' }}>
              📅 Due: {new Date(task.due_date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
            </p>
          )}
          {/* Status pills */}
          <div style={{ display:'flex', gap:6, marginTop:8 }}>
            {(['todo','in_progress','completed'] as TaskStatus[]).map(st => {
              const active = task.status===st
              const cfg = sc[st]
              return (
                <button key={st} onClick={()=>onStatusChange(task.id, st)}
                  style={{
                    padding:'4px 10px', borderRadius:7, border:'none',
                    fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:F,
                    background: active ? cfg.bg : 'var(--bg-page)',
                    color: active ? cfg.color : 'var(--text-muted)',
                    outline: active ? `1px solid ${cfg.color}40` : `1px solid var(--border)`,
                    transition:'all .15s',
                  }}
                >{cfg.label}</button>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display:'flex', gap:6, flexShrink:0, opacity:hovered?1:0, transition:'opacity .15s' }}>
          <button onClick={onEdit}
            style={{ padding:'5px 10px', borderRadius:7, background:'var(--accent-bg)', border:'1px solid var(--accent-border)', color:'var(--accent-text)', fontSize:12, cursor:'pointer', fontFamily:F }}
          >Edit</button>
          <button onClick={onDelete}
            style={{ padding:'5px 10px', borderRadius:7, background:'var(--red-bg)', border:'1px solid rgba(239,68,68,0.2)', color:'var(--red)', fontSize:12, cursor:'pointer', fontFamily:F }}
          >Delete</button>
        </div>
      </div>
    </div>
  )
}

// ── TaskModal ──────────────────────────────────────────
function TaskModal({ task, categories, userId, onClose, onSave }: {
  task: Task|null; categories: Category[]; userId: string
  onClose: ()=>void; onSave: ()=>void
}) {
  const [form, setForm] = useState({
    title:       task?.title       || '',
    description: task?.description || '',
    priority:    task?.priority    || 'medium' as Priority,
    category_id: task?.category_id || '',
    due_date:    task?.due_date    || '',
    status:      task?.status      || 'todo' as TaskStatus,
  })
  const [saving,   setSaving]   = useState(false)
  const [titleErr, setTitleErr] = useState('')
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]:v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { setTitleErr('Task title is required'); return }
    setSaving(true)
    const payload = { ...form, user_id:userId, category_id:form.category_id||null }
    if (task) await supabase.from('tasks').update(payload).eq('id', task.id)
    else      await supabase.from('tasks').insert(payload)
    setSaving(false)
    onSave()
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:16 }} onClick={onClose}>
      <div style={{
        background:'var(--bg-card)', border:'1px solid var(--border)',
        borderRadius:20, padding:'28px', width:'100%', maxWidth:460,
        boxShadow:'0 32px 80px rgba(0,0,0,0.4)', fontFamily:F,
      }} onClick={e=>e.stopPropagation()}>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
          <div>
            <h2 style={{ color:'var(--text-primary)', fontSize:17, fontWeight:700, margin:0 }}>{task?'Edit Task':'Add New Task'}</h2>
            <p style={{ color:'var(--text-muted)', fontSize:12, marginTop:3 }}>{task?'Update your task details':'Track your learning goal'}</p>
          </div>
          <button onClick={onClose} style={{ background:'var(--bg-page)', border:'1px solid var(--border)', borderRadius:8, width:32, height:32, color:'var(--text-secondary)', cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <Label text="Task Title *" />
          <input style={{ ...inp, borderColor:titleErr?'var(--red)':'var(--border-input)', marginBottom:titleErr?4:14 }}
            placeholder="e.g. Learn JavaScript Closures"
            value={form.title}
            onChange={e=>{ set('title',e.target.value); if(e.target.value) setTitleErr('') }}
          />
          {titleErr && <p style={{ color:'var(--red)', fontSize:12, marginBottom:10 }}>⚠ {titleErr}</p>}

          <Label text="Description" />
          <textarea style={{ ...inp, resize:'none', marginBottom:14 }} placeholder="What will you learn? (optional)" rows={2}
            value={form.description} onChange={e=>set('description',e.target.value)}
          />

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
            <div>
              <Label text="Priority" />
              <select style={inp} value={form.priority} onChange={e=>set('priority',e.target.value)}>
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>
            <div>
              <Label text="Category" />
              <select style={inp} value={form.category_id} onChange={e=>set('category_id',e.target.value)}>
                <option value="">No category</option>
                {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:task?'1fr 1fr':'1fr', gap:12, marginBottom:22 }}>
            <div>
              <Label text="Due Date" />
              <input type="date" style={inp} value={form.due_date} onChange={e=>set('due_date',e.target.value)}/>
            </div>
            {task && (
              <div>
                <Label text="Status" />
                <select style={inp} value={form.status} onChange={e=>set('status',e.target.value)}>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            )}
          </div>

          <div style={{ display:'flex', gap:10 }}>
            <button type="button" onClick={onClose}
              style={{ flex:1, padding:'11px 0', borderRadius:10, border:'1px solid var(--border)', background:'var(--bg-page)', color:'var(--text-secondary)', fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:F }}
            >Cancel</button>
            <button type="submit" disabled={saving}
              style={{ flex:1, padding:'11px 0', borderRadius:10, border:'none', background:saving?'var(--accent-bg)':'linear-gradient(135deg,var(--accent),var(--accent-2))', color:saving?'var(--accent-text)':'#fff', fontSize:13, fontWeight:600, cursor:saving?'not-allowed':'pointer', fontFamily:F }}
            >{saving?'Saving...':task?'Update Task':'Add Task'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Label({ text }: { text: string }) {
  return <label style={{ display:'block', color:'var(--text-muted)', fontSize:11, fontWeight:600, marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>{text}</label>
}
