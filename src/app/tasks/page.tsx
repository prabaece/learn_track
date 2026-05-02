

// 'use client'

// // src/app/tasks/page.tsx
// // Tasks page using reusable DataTable — responsive, search, filter, sort

// import { useState, useCallback }  from 'react'
// import { Task, Category, TaskStatus, Priority } from '@/lib/types'
// import { supabase }      from '@/lib/supabase'
// import { DataTable, Column } from '@/components/DataTable'
// import { useTasks } from "@/src/hooks/useTask";
// import { useCategories } from "@/src/hooks/useCategories";
// import { useAuth } from "@/src/hooks/useAuth";
// import { useTimer }      from '@/src/hooks/useTimer'
// import { useConfirm } from '@/components/ConfirmDialog'
// const F = "'DM Sans','Segoe UI',sans-serif"

// const inp: React.CSSProperties = {
//   width: '100%', boxSizing: 'border-box',
//   background: 'var(--bg-input)', border: '1px solid var(--border-input)',
//   borderRadius: 10, padding: '10px 14px',
//   color: 'var(--text-primary)', fontSize: 13,
//   outline: 'none', fontFamily: F,
// }

// const priorityColor: Record<Priority, { color: string; bg: string }> = {
//   high:   { color: 'var(--red)',    bg: 'var(--red-bg)'    },
//   medium: { color: 'var(--yellow)', bg: 'var(--yellow-bg)' },
//   low:    { color: 'var(--green)',  bg: 'var(--green-bg)'  },
// }
// const statusColor: Record<TaskStatus, { color: string; bg: string; label: string }> = {
//   completed:   { color: 'var(--green)',          bg: 'var(--green-bg)',  label: 'Done'        },
//   in_progress: { color: 'var(--yellow)',         bg: 'var(--yellow-bg)', label: 'In Progress' },
//   todo:        { color: 'var(--text-secondary)', bg: 'var(--border)',    label: 'To Do'       },
// }

// export default function TasksPage() {
  
//   const { userId, loading: authLoading }                    = useAuth()
//   const { tasks, loading, addTask, updateStatus, deleteTask } = useTasks(userId)
//   const { categories }                                       = useCategories(userId)
//   const { running, startTimer, stopTimer, logManual, formatElapsed } = useTimer(userId)

//   const [showModal, setShowModal] = useState(false)
//   const [editTask,  setEditTask]  = useState<Task | null>(null)
//   const [toast,     setToast]     = useState('')
//   const [view,      setView]      = useState<'table' | 'card'>('table')

//   const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

//   const handleStatusChange = useCallback(async (id: string, status: TaskStatus) => {
//     const task = tasks.find(t => t.id === id)
//     if (!task) return
//     if (running[id]) {
//       const mins = await stopTimer(id, task.title)
//       if (mins > 0) showToast(`⏱ ${mins} min logged`)
//     }
//     if (status === 'completed' && !running[id]) {
//       await logManual(id, task.title, 30)
//       showToast('✅ Completed! 30 min logged.')
//     }
//     await updateStatus(id, status)
//   }, [tasks, running, stopTimer, logManual, updateStatus])

//   const handleSave = useCallback(async (payload: Partial<Task>, taskId?: string) => {
//     if (taskId) await supabase.from('tasks').update(payload).eq('id', taskId)
//     else        await addTask({ ...payload, user_id: userId })
//     setShowModal(false)
//   }, [addTask, userId])

//   // ── DataTable columns definition ──────────────────────
//   const columns: Column<Task>[] = [
//     {
//       key:      'title',
//       label:    'Task',
//       sortable: true,
//       width:    '35%',
//       render:   (row) => (
//         <div>
//           <p style={{ fontWeight: 500, color: row.status === 'completed' ? 'var(--text-hint)' : 'var(--text-primary)', textDecoration: row.status === 'completed' ? 'line-through' : 'none', margin: 0, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 280 }}>
//             {row.title}
//           </p>
//           {row.description && (
//             <p style={{ color: 'var(--text-muted)', fontSize: 11, margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>{row.description}</p>
//           )}
//         </div>
//       ),
//     },
//     {
//       key:           'status',
//       label:         'Status',
//       sortable:      true,
//       filterOptions: ['todo', 'in_progress', 'completed'],
//       render:        (row) => {
//         const s = statusColor[row.status]
//         return (
//           <select
//             value={row.status}
//             onChange={e => handleStatusChange(row.id, e.target.value as TaskStatus)}
//             onClick={e => e.stopPropagation()}
//             style={{ background: s.bg, color: s.color, border: 'none', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 600, cursor: 'pointer', outline: 'none', fontFamily: F }}
//           >
//             <option value="todo">To Do</option>
//             <option value="in_progress">In Progress</option>
//             <option value="completed">Done</option>
//           </select>
//         )
//       },
//     },
//     {
//       key:           'priority',
//       label:         'Priority',
//       sortable:      true,
//       filterOptions: ['low', 'medium', 'high'],
//       render:        (row) => {
//         const p = priorityColor[row.priority]
//         return (
//           <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 6, fontWeight: 600, background: p.bg, color: p.color, display: 'inline-block' }}>
//             {row.priority}
//           </span>
//         )
//       },
//     },
//     {
//       key:      'categories',
//       label:    'Category',
//       sortable: false,
//       render:   (row) => row.categories ? (
//         <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 6, background: 'var(--border)', color: 'var(--text-secondary)', display: 'inline-block' }}>
//           {(row.categories as any).name}
//         </span>
//       ) : <span style={{ color: 'var(--text-hint)', fontSize: 11 }}>—</span>,
//     },
//     {
//       key:      'due_date',
//       label:    'Due Date',
//       sortable: true,
//       render:   (row) => {
//         if (!row.due_date) return <span style={{ color: 'var(--text-hint)', fontSize: 11 }}>—</span>
//         const isOverdue = row.due_date < new Date().toISOString().split('T')[0] && row.status !== 'completed'
//         return (
//           <span style={{ fontSize: 12, color: isOverdue ? 'var(--red)' : 'var(--text-secondary)', fontWeight: isOverdue ? 600 : 400 }}>
//             {isOverdue ? '⚠ ' : ''}{new Date(row.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
//           </span>
//         )
//       },
//     },
//     {
//       key:    'timer',
//       label:  'Timer',
//       render: (row) => {
//         if (row.status === 'completed') return <span style={{ color: 'var(--text-hint)', fontSize: 11 }}>✓</span>
//         return running[row.id] ? (
//           <button
//             onClick={async (e) => { e.stopPropagation(); const m = await stopTimer(row.id, row.title); if (m > 0) showToast(`⏱ ${m} min logged`) }}
//             style={{ padding: '3px 9px', borderRadius: 6, border: 'none', background: 'var(--yellow-bg)', color: 'var(--yellow)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: F, animation: 'pulse 1.5s ease infinite' }}
//           >■ {formatElapsed(row.id)}</button>
//         ) : (
//           <button
//             onClick={(e) => { e.stopPropagation(); startTimer(row.id); if (row.status === 'todo') updateStatus(row.id, 'in_progress') }}
//             style={{ padding: '3px 9px', borderRadius: 6, border: 'none', background: 'var(--green-bg)', color: 'var(--green)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: F }}
//           >▶ Start</button>
//         )
//       },
//     },
//     {
//       key:    'actions',
//       label:  '',
//       width:  '80px',
//       render: (row) => (
//         <div style={{ display: 'flex', gap: 5 }} onClick={e => e.stopPropagation()}>
//           <button onClick={() => { setEditTask(row); setShowModal(true) }}
//             style={{ padding: '4px 9px', borderRadius: 6, background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', color: 'var(--accent-text)', fontSize: 11, cursor: 'pointer', fontFamily: F }}
//           >Edit</button>
//           <button onClick={() => { if (confirm('Delete?')) deleteTask(row.id) }}
//             style={{ padding: '4px 9px', borderRadius: 6, background: 'var(--red-bg)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--red)', fontSize: 11, cursor: 'pointer', fontFamily: F }}
//           >Del</button>
//         </div>
//       ),
//     },
//   ]

//   if (authLoading) return <PageLoader />

//   return (
//     <div style={{ minHeight: '100%', background: 'var(--bg-page)', padding: '20px 24px', fontFamily: F }}>

//       {/* Toast */}
//       {toast && (
//         <div style={{ position: 'fixed', top: 20, right: 24, zIndex: 100, background: 'var(--bg-card)', border: '1px solid var(--green)', borderRadius: 12, padding: '11px 16px', color: 'var(--text-primary)', fontSize: 13, fontWeight: 500, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', animation: 'slideIn .2s ease' }}>
//           {toast}
//         </div>
//       )}

//       {/* Header */}
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
//         <div>
//           <h1 style={{ color: 'var(--text-primary)', fontSize: 22, fontWeight: 700, margin: 0 }}>Tasks</h1>
//           <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 3 }}>{tasks.length} total</p>
//         </div>
//         <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
//           {/* View toggle */}
//           <div style={{ display: 'flex', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 9, overflow: 'hidden' }}>
//             {(['table', 'card'] as const).map(v => (
//               <button key={v} onClick={() => setView(v)}
//                 style={{ padding: '6px 12px', border: 'none', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: F, background: view === v ? 'var(--accent-bg)' : 'transparent', color: view === v ? 'var(--accent-text)' : 'var(--text-muted)', transition: 'all .15s' }}
//               >
//                 {v === 'table' ? '☰ Table' : '⊞ Cards'}
//               </button>
//             ))}
//           </div>
//           <button
//             onClick={() => { setEditTask(null); setShowModal(true) }}
//             style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,var(--accent),var(--accent-2))', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 16px rgba(124,58,237,0.3)', fontFamily: F }}
//           >+ Add Task</button>
//         </div>
//       </div>

//       {/* Table view */}
//       {view === 'table' && (
//         <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '16px' }}>
//           <DataTable
//             columns={columns}
//             data={tasks}
//             searchFields={['title', 'description']}
//             rowsPerPage={10}
//             loading={loading}
//             emptyText="No tasks yet — add your first task!"
//           />
//         </div>
//       )}

//       {/* Card view */}
//       {view === 'card' && (
//         <div>
//           {/* Search bar for card view */}
//           <div style={{ marginBottom: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
//             <div style={{ position: 'relative', flex: '1 1 200px' }}>
//               <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
//               <input placeholder="Search tasks..." style={{ ...inp, paddingLeft: 32 }} />
//             </div>
//             {(['todo', 'in_progress', 'completed', 'all'] as const).map(f => (
//               <button key={f}
//                 style={{ padding: '7px 12px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-muted)', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: F }}
//               >{f === 'all' ? 'All' : f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}</button>
//             ))}
//           </div>

//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 12 }}>
//             {tasks.map(task => {
//               const s = statusColor[task.status]
//               const p = priorityColor[task.priority]
//               return (
//                 <div key={task.id} style={{ background: 'var(--bg-card)', border: `1px solid ${running[task.id] ? 'rgba(251,191,36,0.3)' : 'var(--border)'}`, borderRadius: 14, padding: '14px 16px', fontFamily: F }}>
//                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
//                     <p style={{ fontWeight: 600, fontSize: 13, color: task.status === 'completed' ? 'var(--text-hint)' : 'var(--text-primary)', textDecoration: task.status === 'completed' ? 'line-through' : 'none', margin: 0, flex: 1, paddingRight: 8 }}>{task.title}</p>
//                     <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
//                       <button onClick={() => { setEditTask(task); setShowModal(true) }} style={{ padding: '3px 8px', borderRadius: 6, background: 'var(--accent-bg)', border: 'none', color: 'var(--accent-text)', fontSize: 11, cursor: 'pointer', fontFamily: F }}>Edit</button>
//                       <button onClick={() => { if (confirm('Delete?')) deleteTask(task.id) }} style={{ padding: '3px 8px', borderRadius: 6, background: 'var(--red-bg)', border: 'none', color: 'var(--red)', fontSize: 11, cursor: 'pointer', fontFamily: F }}>Del</button>
//                     </div>
//                   </div>
//                   {task.description && <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 10px', lineHeight: 1.5 }}>{task.description}</p>}
//                   <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
//                     <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: s.bg, color: s.color, fontWeight: 600 }}>{s.label}</span>
//                     <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: p.bg, color: p.color, fontWeight: 600 }}>{task.priority}</span>
//                     {task.categories && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'var(--border)', color: 'var(--text-secondary)' }}>{(task.categories as any).name}</span>}
//                     {task.due_date && <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>📅 {task.due_date}</span>}
//                   </div>
//                   {/* Status change */}
//                   <div style={{ display: 'flex', gap: 5, marginTop: 10 }}>
//                     {(['todo', 'in_progress', 'completed'] as TaskStatus[]).map(st => (
//                       <button key={st} onClick={() => handleStatusChange(task.id, st)}
//                         style={{ flex: 1, padding: '5px 0', borderRadius: 7, border: 'none', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: F, background: task.status === st ? statusColor[st].bg : 'var(--bg-page)', color: task.status === st ? statusColor[st].color : 'var(--text-muted)', outline: task.status === st ? `1px solid ${statusColor[st].color}40` : '1px solid var(--border)' }}
//                       >{statusColor[st].label}</button>
//                     ))}
//                   </div>
//                 </div>
//               )
//             })}
//           </div>
//         </div>
//       )}

//       {showModal && (
//         <TaskModal task={editTask} categories={categories} userId={userId} onClose={() => setShowModal(false)} onSave={handleSave} />
//       )}

//       <style>{`
//         @keyframes spin{to{transform:rotate(360deg)}}
//         @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
//         @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
//         @media(max-width:600px){
//           .tasks-header{flex-direction:column;align-items:flex-start!important}
//           .tasks-header h1{font-size:18px!important}
//         }
//       `}</style>
//     </div>
//   )
// }

// // ── TaskModal ──────────────────────────────────────────
// function TaskModal({ task, categories, userId, onClose, onSave }: {
//   task: Task | null; categories: Category[]; userId: string
//   onClose: () => void; onSave: (p: Partial<Task>, id?: string) => void
// }) {
//   const [form, setForm] = useState({
//     title:       task?.title       || '',
//     description: task?.description || '',
//     priority:    task?.priority    || 'medium' as Priority,
//     category_id: task?.category_id || '',
//     due_date:    task?.due_date    || '',
//     status:      task?.status      || 'todo' as TaskStatus,
//   })
//   const [saving,   setSaving]   = useState(false)
//   const [titleErr, setTitleErr] = useState('')
//   const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!form.title.trim()) { setTitleErr('Required'); return }
//     setSaving(true)
//     await onSave({ ...form, user_id: userId, category_id: form.category_id || null }, task?.id)
//     setSaving(false)
//   }

//   return (
//     <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }} onClick={onClose}>
//       <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '24px', width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.3)', fontFamily: F }} onClick={e => e.stopPropagation()}>
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
//           <h2 style={{ color: 'var(--text-primary)', fontSize: 16, fontWeight: 700, margin: 0 }}>{task ? 'Edit Task' : 'Add New Task'}</h2>
//           <button onClick={onClose} style={{ background: 'var(--bg-page)', border: '1px solid var(--border)', borderRadius: 8, width: 30, height: 30, color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
//         </div>
//         <form onSubmit={handleSubmit}>
//           <Lbl text="Title *" />
//           <input style={{ ...inp, borderColor: titleErr ? 'var(--red)' : 'var(--border-input)', marginBottom: titleErr ? 4 : 12 }} placeholder="e.g. Learn Closures" value={form.title} onChange={e => { set('title', e.target.value); if (e.target.value) setTitleErr('') }} />
//           {titleErr && <p style={{ color: 'var(--red)', fontSize: 11, marginBottom: 10 }}>⚠ {titleErr}</p>}
//           <Lbl text="Description" />
//           <textarea style={{ ...inp, resize: 'none', marginBottom: 12 }} rows={2} placeholder="Details (optional)" value={form.description} onChange={e => set('description', e.target.value)} />
//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
//             <div><Lbl text="Priority" /><select style={inp} value={form.priority} onChange={e => set('priority', e.target.value)}><option value="low">🟢 Low</option><option value="medium">🟡 Medium</option><option value="high">🔴 High</option></select></div>
//             <div><Lbl text="Category" /><select style={inp} value={form.category_id} onChange={e => set('category_id', e.target.value)}><option value="">None</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
//           </div>
//           <div style={{ display: 'grid', gridTemplateColumns: task ? '1fr 1fr' : '1fr', gap: 10, marginBottom: 20 }}>
//             <div><Lbl text="Due Date" /><input type="date" style={inp} value={form.due_date} onChange={e => set('due_date', e.target.value)} /></div>
//             {task && <div><Lbl text="Status" /><select style={inp} value={form.status} onChange={e => set('status', e.target.value)}><option value="todo">To Do</option><option value="in_progress">In Progress</option><option value="completed">Completed</option></select></div>}
//           </div>
//           <div style={{ display: 'flex', gap: 10 }}>
//             <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-page)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: F }}>Cancel</button>
//             <button type="submit" disabled={saving} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', background: saving ? 'var(--accent-bg)' : 'linear-gradient(135deg,var(--accent),var(--accent-2))', color: saving ? 'var(--accent-text)' : '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: F }}>{saving ? 'Saving...' : task ? 'Update' : 'Add Task'}</button>
//           </div>
//         </form>
//       </div>
//     </div>
//   )
// }

// function Lbl({ text }: { text: string }) {
//   return <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{text}</label>
// }

// function PageLoader() {
//   return (
//     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100%', background: 'var(--bg-page)', fontFamily: F }}>
//       <div style={{ textAlign: 'center' }}>
//         <div style={{ width: 34, height: 34, border: '3px solid var(--accent-bg)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 10px' }} />
//         <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading...</p>
//       </div>
//       <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
//     </div>
//   )
// }


// 'use client'

// import { useState, useMemo, useCallback, memo } from 'react'
// import { Task, Category, TaskStatus, Priority } from '@/lib/types'
// import { useTasks }      from '@/src/hooks/useTask'
// import { useCategories } from '@/src/hooks/useCategories'
// import { useAuth }       from '@/src/hooks/useAuth'
// import { useTimer }      from '@/src/hooks/useTimer'
// import { useConfirm }    from '@/components/ConfirmDialog'
// import { supabase }      from '@/lib/supabase'

// const F = "'DM Sans','Segoe UI',sans-serif"
// const inp: React.CSSProperties = {
//   width: '100%', boxSizing: 'border-box',
//   background: 'var(--bg-input)', border: '1px solid var(--border-input)',
//   borderRadius: 10, padding: '10px 14px',
//   color: 'var(--text-primary)', fontSize: 13,
//   outline: 'none', fontFamily: F, transition: 'border-color .2s',
// }

// const priorityColor: Record<Priority, { color: string; bg: string }> = {
//   high:   { color: 'var(--red)',    bg: 'var(--red-bg)'    },
//   medium: { color: 'var(--yellow)', bg: 'var(--yellow-bg)' },
//   low:    { color: 'var(--green)',  bg: 'var(--green-bg)'  },
// }
// const statusColor: Record<TaskStatus, { color: string; bg: string; label: string }> = {
//   completed:   { color: 'var(--green)',          bg: 'var(--green-bg)',  label: 'Done'        },
//   in_progress: { color: 'var(--yellow)',         bg: 'var(--yellow-bg)', label: 'In Progress' },
//   todo:        { color: 'var(--text-secondary)', bg: 'var(--border)',    label: 'To Do'       },
// }

// export default function TasksPage() {
//   const { userId, loading: authLoading }                              = useAuth()
//   const { tasks, loading, addTask, updateStatus, deleteTask }         = useTasks(userId)
//   const { categories }                                                = useCategories(userId)
//   const { running, startTimer, stopTimer, logManual, formatElapsed }  = useTimer(userId)
//   const { confirm: confirmDialog, Dialog }                            = useConfirm()

//   const [filter,    setFilter]    = useState<TaskStatus | 'all'>('all')
//   const [search,    setSearch]    = useState('')
//   const [showModal, setShowModal] = useState(false)
//   const [editTask,  setEditTask]  = useState<Task | null>(null)
//   const [toast,     setToast]     = useState('')
//   const [view,      setView]      = useState<'table' | 'card'>('table')

//   const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

//   const filtered = useMemo(() => {
//     let list = filter === 'all' ? tasks : tasks.filter(t => t.status === filter)
//     if (search) list = list.filter(t => t.title.toLowerCase().includes(search.toLowerCase()))
//     return list
//   }, [tasks, filter, search])

//   const counts = useMemo(() => ({
//     all:         tasks.length,
//     todo:        tasks.filter(t => t.status === 'todo').length,
//     in_progress: tasks.filter(t => t.status === 'in_progress').length,
//     completed:   tasks.filter(t => t.status === 'completed').length,
//   }), [tasks])

//   const handleStatusChange = useCallback(async (id: string, status: TaskStatus) => {
//     const task = tasks.find(t => t.id === id)
//     if (!task) return
//     if (running[id]) {
//       const mins = await stopTimer(id, task.title)
//       if (mins > 0) showToast(`⏱ ${mins} min logged`)
//     }
//     if (status === 'completed' && !running[id]) {
//       await logManual(id, task.title, 30)
//       showToast('✅ Completed! 30 min logged.')
//     }
//     await updateStatus(id, status)
//   }, [tasks, running, stopTimer, logManual, updateStatus])

//   const handleDelete = useCallback(async (id: string) => {
//     const task = tasks.find(t => t.id === id)
//     const ok = await confirmDialog({
//       title:        'Delete Task',
//       message:      `"${task?.title}" will be permanently deleted. This cannot be undone.`,
//       confirmLabel: 'Yes, Delete',
//       danger:       true,
//     })
//     if (!ok) return
//     deleteTask(id)
//     showToast('🗑 Task deleted')
//   }, [tasks, confirmDialog, deleteTask])

//   const handleSave = useCallback(async (payload: Partial<Task>, taskId?: string) => {
//     if (taskId) await supabase.from('tasks').update(payload).eq('id', taskId)
//     else        await addTask({ ...payload, user_id: userId })
//     setShowModal(false)
//   }, [addTask, userId])

//   const tabs = [
//     { key: 'all',         label: 'All',        count: counts.all,         color: 'var(--accent-text)'    },
//     { key: 'todo',        label: 'To Do',       count: counts.todo,        color: 'var(--text-secondary)' },
//     { key: 'in_progress', label: 'In Progress', count: counts.in_progress, color: 'var(--yellow)'         },
//     { key: 'completed',   label: 'Completed',   count: counts.completed,   color: 'var(--green)'          },
//   ] as const

//   if (authLoading) return <PageLoader />

//   return (
//     <div style={{ minHeight: '100%', background: 'var(--bg-page)', padding: '20px 24px', fontFamily: F }}>

//       {/* Toast */}
//       {toast && (
//         <div style={{ position: 'fixed', top: 20, right: 24, zIndex: 100, background: 'var(--bg-card)', border: '1px solid var(--green)', borderRadius: 12, padding: '11px 16px', color: 'var(--text-primary)', fontSize: 13, fontWeight: 500, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', animation: 'slideIn .2s ease' }}>
//           {toast}
//         </div>
//       )}

//       {/* Header */}
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
//         <div>
//           <h1 style={{ color: 'var(--text-primary)', fontSize: 22, fontWeight: 700, margin: 0 }}>Tasks</h1>
//           <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 3 }}>{tasks.length} total tasks</p>
//         </div>
//         <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
//           {/* View toggle */}
//           <div style={{ display: 'flex', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 9, overflow: 'hidden' }}>
//             {(['table', 'card'] as const).map(v => (
//               <button key={v} onClick={() => setView(v)}
//                 style={{ padding: '6px 12px', border: 'none', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: F, background: view === v ? 'var(--accent-bg)' : 'transparent', color: view === v ? 'var(--accent-text)' : 'var(--text-muted)', transition: 'all .15s' }}
//               >{v === 'table' ? '☰ Table' : '⊞ Cards'}</button>
//             ))}
//           </div>
//           <button
//             onClick={() => { setEditTask(null); setShowModal(true) }}
//             style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,var(--accent),var(--accent-2))', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 16px rgba(124,58,237,0.3)', fontFamily: F }}
//           >+ Add Task</button>
//         </div>
//       </div>

//       {/* Search + Filters */}
//       <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
//         <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 160 }}>
//           <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//             <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
//           </svg>
//           <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..."
//             style={{ ...inp, paddingLeft: 32 }}
//           />
//         </div>
//         <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
//           {tabs.map(tab => {
//             const active = filter === tab.key
//             return (
//               <button key={tab.key} onClick={() => setFilter(tab.key)}
//                 style={{ padding: '7px 12px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: F, transition: 'all .15s', background: active ? 'var(--accent-bg)' : 'var(--bg-card)', color: active ? tab.color : 'var(--text-muted)', outline: active ? '1px solid var(--accent-border)' : '1px solid var(--border)' }}
//               >
//                 {tab.label} <span style={{ marginLeft: 5, opacity: .6, fontSize: 11 }}>({tab.count})</span>
//               </button>
//             )
//           })}
//         </div>
//       </div>

//       {/* Table view */}
//       {view === 'table' && (
//         <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
//           <div style={{ overflowX: 'auto' }}>
//             <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
//               <thead>
//                 <tr style={{ background: 'var(--bg-page)', borderBottom: '1px solid var(--border)' }}>
//                   {['Task', 'Status', 'Priority', 'Category', 'Due Date', 'Timer', ''].map(h => (
//                     <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {loading ? (
//                   <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Loading...</td></tr>
//                 ) : filtered.length === 0 ? (
//                   <tr>
//                     <td colSpan={7}>
//                       <div style={{ textAlign: 'center', padding: '40px 0' }}>
//                         <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--border-hover)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 12 }}>
//                           <path d="M9 11l3 3L22 4"/>
//                           <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
//                         </svg>
//                         <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>
//                           {search ? `No tasks found for "${search}"` : 'No tasks here. Add one!'}
//                         </p>
//                       </div>
//                     </td>
//                   </tr>
//                 ) : filtered.map((task, i) => {
//                   const s    = statusColor[task.status]
//                   const p    = priorityColor[task.priority]
//                   const done = task.status === 'completed'
//                   const isOverdue = task.due_date && task.due_date < new Date().toISOString().split('T')[0] && !done
//                   return (
//                     <tr key={task.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'var(--bg-page)' : 'var(--bg-card)', transition: 'background .1s' }}
//                       onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
//                       onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'var(--bg-page)' : 'var(--bg-card)'}
//                     >
//                       {/* Title */}
//                       <td style={{ padding: '11px 14px', maxWidth: 260 }}>
//                         <p style={{ fontSize: 13, fontWeight: 500, color: done ? 'var(--text-hint)' : 'var(--text-primary)', textDecoration: done ? 'line-through' : 'none', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</p>
//                         {task.description && <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.description}</p>}
//                       </td>
//                       {/* Status */}
//                       <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
//                         <select value={task.status} onChange={e => handleStatusChange(task.id, e.target.value as TaskStatus)}
//                           style={{ background: s.bg, color: s.color, border: 'none', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 600, cursor: 'pointer', outline: 'none', fontFamily: F }}
//                         >
//                           <option value="todo">To Do</option>
//                           <option value="in_progress">In Progress</option>
//                           <option value="completed">Done</option>
//                         </select>
//                       </td>
//                       {/* Priority */}
//                       <td style={{ padding: '11px 14px' }}>
//                         <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 6, fontWeight: 600, background: p.bg, color: p.color }}>{task.priority}</span>
//                       </td>
//                       {/* Category */}
//                       <td style={{ padding: '11px 14px' }}>
//                         {task.categories ? (
//                           <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 6, background: 'var(--border)', color: 'var(--text-secondary)' }}>{(task.categories as any).name}</span>
//                         ) : <span style={{ color: 'var(--text-hint)', fontSize: 11 }}>—</span>}
//                       </td>
//                       {/* Due date */}
//                       <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
//                         {task.due_date ? (
//                           <span style={{ fontSize: 12, color: isOverdue ? 'var(--red)' : 'var(--text-secondary)', fontWeight: isOverdue ? 600 : 400 }}>
//                             {isOverdue ? '⚠ ' : ''}{new Date(task.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
//                           </span>
//                         ) : <span style={{ color: 'var(--text-hint)', fontSize: 11 }}>—</span>}
//                       </td>
//                       {/* Timer */}
//                       <td style={{ padding: '11px 14px' }}>
//                         {!done && (
//                           running[task.id] ? (
//                             <button onClick={async () => { const m = await stopTimer(task.id, task.title); if (m > 0) showToast(`⏱ ${m} min logged`) }}
//                               style={{ padding: '3px 9px', borderRadius: 6, border: 'none', background: 'var(--yellow-bg)', color: 'var(--yellow)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: F }}
//                             >■ {formatElapsed(task.id)}</button>
//                           ) : (
//                             <button onClick={() => { startTimer(task.id); if (task.status === 'todo') updateStatus(task.id, 'in_progress') }}
//                               style={{ padding: '3px 9px', borderRadius: 6, border: 'none', background: 'var(--green-bg)', color: 'var(--green)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: F }}
//                             >▶ Start</button>
//                           )
//                         )}
//                       </td>
//                       {/* Actions */}
//                       <td style={{ padding: '11px 14px' }}>
//                         <div style={{ display: 'flex', gap: 5 }}>
//                           <button onClick={() => { setEditTask(task); setShowModal(true) }}
//                             style={{ padding: '4px 10px', borderRadius: 7, background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', color: 'var(--accent-text)', fontSize: 11, cursor: 'pointer', fontFamily: F, whiteSpace: 'nowrap' }}
//                           >Edit</button>
//                           <button onClick={() => handleDelete(task.id)}
//                             style={{ padding: '4px 10px', borderRadius: 7, background: 'var(--red-bg)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--red)', fontSize: 11, cursor: 'pointer', fontFamily: F, whiteSpace: 'nowrap' }}
//                           >Delete</button>
//                         </div>
//                       </td>
//                     </tr>
//                   )
//                 })}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* Card view */}
//       {view === 'card' && (
//         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 12 }}>
//           {filtered.length === 0 ? (
//             <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px 0' }}>
//               <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--border-hover)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 12 }}>
//                 <path d="M9 11l3 3L22 4"/>
//                 <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
//               </svg>
//               <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
//                 {search ? `No tasks found for "${search}"` : 'No tasks here. Add one!'}
//               </p>
//             </div>
//           ) : filtered.map(task => (
//             <TaskCard
//               key={task.id}
//               task={task}
//               isRunning={!!running[task.id]}
//               elapsed={formatElapsed(task.id)}
//               onStatusChange={handleStatusChange}
//               onEdit={() => { setEditTask(task); setShowModal(true) }}
//               onDelete={() => handleDelete(task.id)}
//               onStartTimer={() => { startTimer(task.id); if (task.status === 'todo') updateStatus(task.id, 'in_progress') }}
//               onStopTimer={async () => { const m = await stopTimer(task.id, task.title); if (m > 0) showToast(`⏱ ${m} min logged`) }}
//               onLogManual={async (mins: number) => { await logManual(task.id, task.title, mins); showToast(`📝 ${mins} min logged`) }}
//             />
//           ))}
//         </div>
//       )}

//       {showModal && (
//         <TaskModal
//           task={editTask}
//           categories={categories}
//           userId={userId}
//           onClose={() => setShowModal(false)}
//           onSave={handleSave}
//         />
//       )}

//       {/* Confirm dialog */}
//       {Dialog}

//       <style>{`
//         @keyframes spin{to{transform:rotate(360deg)}}
//         @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
//         @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
//         input::placeholder{color:var(--text-muted)}
//         @media(max-width:768px){
//           .page-wrap{padding:14px!important}
//         }
//       `}</style>
//     </div>
//   )
// }

// // ── TaskCard ──────────────────────────────────────────
// const TaskCard = memo(function TaskCard({ task, isRunning, elapsed, onStatusChange, onEdit, onDelete, onStartTimer, onStopTimer, onLogManual }: {
//   task: Task; isRunning: boolean; elapsed: string
//   onStatusChange: (id: string, s: TaskStatus) => void
//   onEdit: () => void; onDelete: () => void
//   onStartTimer: () => void; onStopTimer: () => void
//   onLogManual: (mins: number) => void
// }) {
//   const [hovered,      setHovered]      = useState(false)
//   const [showLogInput, setShowLogInput] = useState(false)
//   const [manualMins,   setManualMins]   = useState('')

//   const p    = priorityColor[task.priority]
//   const s    = statusColor[task.status]
//   const done = task.status === 'completed'

//   return (
//     <div
//       onMouseEnter={() => setHovered(true)}
//       onMouseLeave={() => setHovered(false)}
//       style={{ background: isRunning ? 'var(--yellow-bg)' : hovered ? 'var(--bg-card-hover)' : 'var(--bg-card)', border: `1px solid ${isRunning ? 'rgba(251,191,36,0.3)' : hovered ? 'var(--border-hover)' : 'var(--border)'}`, borderRadius: 14, padding: '14px 16px', transition: 'all .15s', fontFamily: F }}
//     >
//       <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
//         <button onClick={() => onStatusChange(task.id, done ? 'todo' : 'completed')}
//           style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, marginTop: 1, border: `2px solid ${done ? 'var(--green)' : 'var(--border-hover)'}`, background: done ? 'var(--green)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}
//         >
//           {done && <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
//         </button>

//         <div style={{ flex: 1, minWidth: 0 }}>
//           <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 4 }}>
//             <span style={{ fontSize: 14, fontWeight: 500, color: done ? 'var(--text-hint)' : 'var(--text-primary)', textDecoration: done ? 'line-through' : 'none' }}>{task.title}</span>
//             <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, fontWeight: 600, background: p.bg, color: p.color }}>{task.priority}</span>
//             {task.categories && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'var(--border)', color: 'var(--text-secondary)' }}>{(task.categories as any).name}</span>}
//             {isRunning && <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 6, background: 'rgba(251,191,36,0.15)', color: 'var(--yellow)', fontWeight: 700, fontFamily: 'monospace', animation: 'pulse 1s ease infinite' }}>⏱ {elapsed}</span>}
//             <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, fontWeight: 600, background: s.bg, color: s.color, marginLeft: 'auto' }}>{s.label}</span>
//           </div>
//           {task.description && <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 6px', lineHeight: 1.5 }}>{task.description}</p>}
//           {task.due_date && <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '4px 0 6px' }}>📅 Due: {new Date(task.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>}

//           <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
//             {(['todo', 'in_progress', 'completed'] as TaskStatus[]).map(st => {
//               const active = task.status === st
//               const cfg    = statusColor[st]
//               return (
//                 <button key={st} onClick={() => onStatusChange(task.id, st)}
//                   style={{ padding: '4px 10px', borderRadius: 7, border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: F, background: active ? cfg.bg : 'var(--bg-page)', color: active ? cfg.color : 'var(--text-muted)', outline: active ? `1px solid ${cfg.color}40` : '1px solid var(--border)', transition: 'all .15s' }}
//                 >{cfg.label}</button>
//               )
//             })}
//             {!done && (
//               <>
//                 {!isRunning ? (
//                   <button onClick={onStartTimer} style={{ padding: '4px 10px', borderRadius: 7, border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: F, background: 'var(--green-bg)', color: 'var(--green)', outline: '1px solid rgba(52,211,153,0.3)', marginLeft: 4 }}>▶ Start</button>
//                 ) : (
//                   <button onClick={onStopTimer} style={{ padding: '4px 10px', borderRadius: 7, border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: F, background: 'var(--yellow-bg)', color: 'var(--yellow)', outline: '1px solid rgba(251,191,36,0.4)', animation: 'pulse 1.5s ease infinite' }}>■ Stop</button>
//                 )}
//                 <button onClick={() => setShowLogInput(p => !p)} style={{ padding: '4px 10px', borderRadius: 7, border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: F, background: 'var(--blue-bg)', color: 'var(--blue)', outline: '1px solid rgba(56,189,248,0.3)' }}>📝 Log</button>
//               </>
//             )}
//           </div>

//           {showLogInput && (
//             <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' }}>
//               <input type="number" min="1" max="480" placeholder="Minutes" value={manualMins} onChange={e => setManualMins(e.target.value)}
//                 style={{ width: 120, background: 'var(--bg-input)', border: '1px solid var(--border-input)', borderRadius: 8, padding: '6px 10px', color: 'var(--text-primary)', fontSize: 12, outline: 'none', fontFamily: F }}
//               />
//               <button onClick={() => { const m = parseInt(manualMins); if (m > 0) { onLogManual(m); setManualMins(''); setShowLogInput(false) } }}
//                 style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,var(--accent),var(--accent-2))', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: F }}
//               >Save</button>
//               <button onClick={() => setShowLogInput(false)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', fontFamily: F }}>Cancel</button>
//             </div>
//           )}
//         </div>

//         <div style={{ display: 'flex', gap: 6, flexShrink: 0, opacity: hovered ? 1 : 0, transition: 'opacity .15s' }}>
//           <button onClick={onEdit} style={{ padding: '5px 10px', borderRadius: 7, background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', color: 'var(--accent-text)', fontSize: 12, cursor: 'pointer', fontFamily: F }}>Edit</button>
//           <button onClick={onDelete} style={{ padding: '5px 10px', borderRadius: 7, background: 'var(--red-bg)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--red)', fontSize: 12, cursor: 'pointer', fontFamily: F }}>Delete</button>
//         </div>
//       </div>
//     </div>
//   )
// })

// // ── TaskModal ──────────────────────────────────────────
// function TaskModal({ task, categories, userId, onClose, onSave }: {
//   task: Task | null; categories: Category[]; userId: string
//   onClose: () => void; onSave: (p: Partial<Task>, id?: string) => void
// }) {
//   const [form, setForm] = useState({
//     title:       task?.title       || '',
//     description: task?.description || '',
//     priority:    task?.priority    || 'medium' as Priority,
//     category_id: task?.category_id || '',
//     due_date:    task?.due_date    || '',
//     status:      task?.status      || 'todo' as TaskStatus,
//   })
//   const [saving,   setSaving]   = useState(false)
//   const [titleErr, setTitleErr] = useState('')
//   const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!form.title.trim()) { setTitleErr('Required'); return }
//     setSaving(true)
//     await onSave({ ...form, user_id: userId, category_id: form.category_id || null }, task?.id)
//     setSaving(false)
//   }

//   return (
//     <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }} onClick={onClose}>
//       <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '24px', width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.3)', fontFamily: F }} onClick={e => e.stopPropagation()}>
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
//           <h2 style={{ color: 'var(--text-primary)', fontSize: 16, fontWeight: 700, margin: 0 }}>{task ? 'Edit Task' : 'Add New Task'}</h2>
//           <button onClick={onClose} style={{ background: 'var(--bg-page)', border: '1px solid var(--border)', borderRadius: 8, width: 30, height: 30, color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
//         </div>
//         <form onSubmit={handleSubmit}>
//           <Lbl text="Title *" />
//           <input style={{ ...inp, borderColor: titleErr ? 'var(--red)' : 'var(--border-input)', marginBottom: titleErr ? 4 : 12 }} placeholder="e.g. Learn Closures" value={form.title} onChange={e => { set('title', e.target.value); if (e.target.value) setTitleErr('') }} />
//           {titleErr && <p style={{ color: 'var(--red)', fontSize: 11, marginBottom: 10 }}>⚠ {titleErr}</p>}
//           <Lbl text="Description" />
//           <textarea style={{ ...inp, resize: 'none', marginBottom: 12 }} rows={2} placeholder="Details (optional)" value={form.description} onChange={e => set('description', e.target.value)} />
//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
//             <div><Lbl text="Priority" /><select style={inp} value={form.priority} onChange={e => set('priority', e.target.value)}><option value="low">🟢 Low</option><option value="medium">🟡 Medium</option><option value="high">🔴 High</option></select></div>
//             <div><Lbl text="Category" /><select style={inp} value={form.category_id} onChange={e => set('category_id', e.target.value)}><option value="">None</option>{categories.filter((c: any) => c.is_active !== false).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
//           </div>
//           <div style={{ display: 'grid', gridTemplateColumns: task ? '1fr 1fr' : '1fr', gap: 10, marginBottom: 20 }}>
//             <div><Lbl text="Due Date" /><input type="date" style={inp} value={form.due_date} onChange={e => set('due_date', e.target.value)} /></div>
//             {task && <div><Lbl text="Status" /><select style={inp} value={form.status} onChange={e => set('status', e.target.value)}><option value="todo">To Do</option><option value="in_progress">In Progress</option><option value="completed">Completed</option></select></div>}
//           </div>
//           <div style={{ display: 'flex', gap: 10 }}>
//             <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-page)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: F }}>Cancel</button>
//             <button type="submit" disabled={saving} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', background: saving ? 'var(--accent-bg)' : 'linear-gradient(135deg,var(--accent),var(--accent-2))', color: saving ? 'var(--accent-text)' : '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: F }}>{saving ? 'Saving...' : task ? 'Update' : 'Add Task'}</button>
//           </div>
//         </form>
//       </div>
//     </div>
//   )
// }

// function Lbl({ text }: { text: string }) {
//   return <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{text}</label>
// }

// function PageLoader() {
//   return (
//     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100%', background: 'var(--bg-page)', fontFamily: F }}>
//       <div style={{ textAlign: 'center' }}>
//         <div style={{ width: 34, height: 34, border: '3px solid var(--accent-bg)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 10px' }} />
//         <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading tasks...</p>
//       </div>
//       <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
//     </div>
//   )
// }

'use client'

import { useState, useMemo, useCallback, memo, useEffect, useRef } from 'react'
import { Task, Category, TaskStatus, Priority } from '@/lib/types'
import { useTasks }      from '@/src/hooks/useTask'
import { useCategories } from '@/src/hooks/useCategories'
import { useAuth }       from '@/src/hooks/useAuth'
import { useTimer }      from '@/src/hooks/useTimer'
import { useConfirm }    from '@/components/ConfirmDialog'
import { supabase }      from '@/lib/supabase'

const F = "'DM Sans','Segoe UI',sans-serif"
const inp: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: 'var(--bg-input)', border: '1px solid var(--border-input)',
  borderRadius: 10, padding: '10px 14px',
  color: 'var(--text-primary)', fontSize: 13,
  outline: 'none', fontFamily: F, transition: 'border-color .2s',
}

const priorityColor: Record<Priority, { color: string; bg: string }> = {
  high:   { color: 'var(--red)',    bg: 'var(--red-bg)'    },
  medium: { color: 'var(--yellow)', bg: 'var(--yellow-bg)' },
  low:    { color: 'var(--green)',  bg: 'var(--green-bg)'  },
}
const statusColor: Record<TaskStatus, { color: string; bg: string; label: string }> = {
  completed:   { color: 'var(--green)',          bg: 'var(--green-bg)',  label: 'Done'        },
  in_progress: { color: 'var(--yellow)',         bg: 'var(--yellow-bg)', label: 'In Progress' },
  todo:        { color: 'var(--text-secondary)', bg: 'var(--border)',    label: 'To Do'       },
}

// ── Sorting types ────────────────────────────────────────
type SortField = 'title' | 'status' | 'priority' | 'due_date' | 'created_at'
type SortDir   = 'asc' | 'desc'

const PRIORITY_ORDER: Record<Priority, number> = { high: 3, medium: 2, low: 1 }
const STATUS_ORDER:   Record<TaskStatus, number> = { todo: 1, in_progress: 2, completed: 3 }

const PAGE_SIZE      = 10   // rows per page in table view
const CARD_PAGE_SIZE = 9    // cards per page in card view

export default function TasksPage() {
  const { userId, loading: authLoading }                              = useAuth()
  const { tasks, loading, addTask, updateTask, updateStatus, deleteTask } = useTasks(userId)
  const { categories }                                                = useCategories(userId)
  const { running, startTimer, stopTimer, logManual, formatElapsed }  = useTimer(userId)
  const { confirm: confirmDialog, Dialog }                            = useConfirm()

  const [filter,    setFilter]    = useState<TaskStatus | 'all'>('all')
  const [search,    setSearch]    = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editTask,  setEditTask]  = useState<Task | null>(null)
  const [toast,     setToast]     = useState('')
  const [view,      setView]      = useState<'table' | 'card'>('table')

  // ── Table pagination & sorting ───────────────────────
  const [page,     setPage]     = useState(1)
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDir,   setSortDir]   = useState<SortDir>('desc')

  // ── Card infinite scroll ─────────────────────────────
  const [cardPage,    setCardPage]    = useState(1)
  const [cardLoading, setCardLoading] = useState(false)
  const cardLoadingRef = useRef(false)
  const hasMoreRef     = useRef(false)
  const obsRef         = useRef<IntersectionObserver | null>(null)

  // Callback ref — observer attaches/detaches whenever the sentinel node mounts/unmounts
  // (e.g. when switching between table/card views)
  const loaderRef = useCallback((node: HTMLDivElement | null) => {
    if (obsRef.current) { obsRef.current.disconnect(); obsRef.current = null }
    if (!node) return
    obsRef.current = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return
      if (cardLoadingRef.current)     return
      if (!hasMoreRef.current)        return
      cardLoadingRef.current = true
      setCardLoading(true)
      setTimeout(() => {
        setCardPage(p => p + 1)
        setCardLoading(false)
        cardLoadingRef.current = false
      }, 500)
    }, { threshold: 0.1 })
    obsRef.current.observe(node)
  }, [])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  // Reset page when filter/search/view changes
  useEffect(() => { setPage(1) }, [filter, search, view, sortField, sortDir])
  useEffect(() => { setCardPage(1) }, [filter, search])

  // ── Sort helper ──────────────────────────────────────
  const sortedFiltered = useMemo(() => {
    let list = filter === 'all' ? tasks : tasks.filter(t => t.status === filter)
    if (search) list = list.filter(t =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(search.toLowerCase())
    )
    return [...list].sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case 'title':
          cmp = a.title.localeCompare(b.title); break
        case 'status':
          cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status]; break
        case 'priority':
          cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]; break
        case 'due_date':
          cmp = (a.due_date || '9999').localeCompare(b.due_date || '9999'); break
        case 'created_at':
          cmp = (a.created_at || '').localeCompare(b.created_at || ''); break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [tasks, filter, search, sortField, sortDir])

  // ── Table pagination slice ───────────────────────────
  const totalPages  = Math.max(1, Math.ceil(sortedFiltered.length / PAGE_SIZE))
  const pagedTasks  = useMemo(() =>
    sortedFiltered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [sortedFiltered, page]
  )

  // ── Card infinite scroll slice ───────────────────────
  const cardTasks = useMemo(() =>
    sortedFiltered.slice(0, cardPage * CARD_PAGE_SIZE),
    [sortedFiltered, cardPage]
  )
  const hasMoreCards = cardTasks.length < sortedFiltered.length

  // Keep hasMoreRef in sync so the observer callback always reads the latest value
  useEffect(() => { hasMoreRef.current = hasMoreCards }, [hasMoreCards])

  const counts = useMemo(() => ({
    all:         tasks.length,
    todo:        tasks.filter(t => t.status === 'todo').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    completed:   tasks.filter(t => t.status === 'completed').length,
  }), [tasks])

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span style={{ opacity: 0.3, marginLeft: 4 }}>↕</span>
    return <span style={{ marginLeft: 4, color: 'var(--accent-text)' }}>{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  const handleStatusChange = useCallback(async (id: string, status: TaskStatus) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    if (running[id]) {
      const mins = await stopTimer(id, task.title)
      if (mins > 0) showToast(`⏱ ${mins} min logged`)
    }
    if (status === 'completed' && !running[id]) {
      await logManual(id, task.title, 30)
      showToast('✅ Completed! 30 min logged.')
    }
    await updateStatus(id, status)
  }, [tasks, running, stopTimer, logManual, updateStatus])

  const handleDelete = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id)
    const ok = await confirmDialog({
      title:        'Delete Task',
      message:      `"${task?.title}" will be permanently deleted. This cannot be undone.`,
      confirmLabel: 'Yes, Delete',
      danger:       true,
    })
    if (!ok) return
    deleteTask(id)
    showToast('🗑 Task deleted')
  }, [tasks, confirmDialog, deleteTask])

  // ── FIX: Separate create vs update, prevent duplication ──
  const handleSave = useCallback(async (payload: Partial<Task>, taskId?: string) => {
    if (taskId) {
      // UPDATE existing task
      const { error } = await supabase
        .from('tasks')
        .update(payload)
        .eq('id', taskId)
      if (error) { showToast('❌ Update failed: ' + error.message); return }
      // Refresh local state if hook exposes updateTask
      if (typeof updateTask === 'function') updateTask(taskId, payload)
      showToast('✅ Task updated!')
    } else {
      // CREATE new task — dedupe check by title+user_id
      const duplicate = tasks.find(
        t => t.title.trim().toLowerCase() === (payload.title || '').trim().toLowerCase()
      )
      if (duplicate) {
        showToast('⚠ A task with this title already exists!')
        return
      }
      await addTask({ ...payload, user_id: userId })
      showToast('✅ Task added!')
    }
    setShowModal(false)
  }, [addTask, updateTask, userId, tasks])

  const tabs = [
    { key: 'all',         label: 'All',         count: counts.all,         color: 'var(--accent-text)'    },
    { key: 'todo',        label: 'To Do',        count: counts.todo,        color: 'var(--text-secondary)' },
    { key: 'in_progress', label: 'In Progress',  count: counts.in_progress, color: 'var(--yellow)'         },
    { key: 'completed',   label: 'Completed',    count: counts.completed,   color: 'var(--green)'          },
  ] as const

  if (authLoading) return <PageLoader />

  const sortableHeaders: { label: string; field?: SortField }[] = [
    { label: 'Task',     field: 'title'      },
    { label: 'Status',   field: 'status'     },
    { label: 'Priority', field: 'priority'   },
    { label: 'Category'                      },
    { label: 'Due Date', field: 'due_date'   },
    { label: 'Timer'                         },
    { label: ''                              },
  ]

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg-page)', padding: '20px 24px', fontFamily: F }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 24, zIndex: 100, background: 'var(--bg-card)', border: '1px solid var(--green)', borderRadius: 12, padding: '11px 16px', color: 'var(--text-primary)', fontSize: 13, fontWeight: 500, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', animation: 'slideIn .2s ease' }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ color: 'var(--text-primary)', fontSize: 22, fontWeight: 700, margin: 0 }}>Tasks</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 3 }}>{tasks.length} total tasks</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 9, overflow: 'hidden' }}>
            {(['table', 'card'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                style={{ padding: '6px 12px', border: 'none', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: F, background: view === v ? 'var(--accent-bg)' : 'transparent', color: view === v ? 'var(--accent-text)' : 'var(--text-muted)', transition: 'all .15s' }}
              >{v === 'table' ? '☰ Table' : '⊞ Cards'}</button>
            ))}
          </div>
          <button
            onClick={() => { setEditTask(null); setShowModal(true) }}
            style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,var(--accent),var(--accent-2))', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 16px rgba(124,58,237,0.3)', fontFamily: F }}
          >+ Add Task</button>
        </div>
      </div>

      {/* Search + Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 160 }}>
          <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..."
            style={{ ...inp, paddingLeft: 32 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {tabs.map(tab => {
            const active = filter === tab.key
            return (
              <button key={tab.key} onClick={() => setFilter(tab.key)}
                style={{ padding: '7px 12px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: F, transition: 'all .15s', background: active ? 'var(--accent-bg)' : 'var(--bg-card)', color: active ? tab.color : 'var(--text-muted)', outline: active ? '1px solid var(--accent-border)' : '1px solid var(--border)' }}
              >
                {tab.label} <span style={{ marginLeft: 5, opacity: .6, fontSize: 11 }}>({tab.count})</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── TABLE VIEW ── */}
      {view === 'table' && (
        <>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
                <thead>
                  <tr style={{ background: 'var(--bg-page)', borderBottom: '1px solid var(--border)' }}>
                    {sortableHeaders.map(h => (
                      <th key={h.label}
                        onClick={h.field ? () => handleSort(h.field!) : undefined}
                        style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: sortField === h.field ? 'var(--accent-text)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap', cursor: h.field ? 'pointer' : 'default', userSelect: 'none' }}
                      >
                        {h.label}{h.field && <SortIcon field={h.field} />}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Loading...</td></tr>
                  ) : pagedTasks.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--border-hover)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 12 }}>
                            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                          </svg>
                          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>
                            {search ? `No tasks found for "${search}"` : 'No tasks here. Add one!'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : pagedTasks.map((task, i) => {
                    const s    = statusColor[task.status]
                    const p    = priorityColor[task.priority]
                    const done = task.status === 'completed'
                    const isOverdue = task.due_date && task.due_date < new Date().toISOString().split('T')[0] && !done
                    return (
                      <tr key={task.id}
                        style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'var(--bg-page)' : 'var(--bg-card)', transition: 'background .1s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'var(--bg-page)' : 'var(--bg-card)'}
                      >
                        <td style={{ padding: '11px 14px', maxWidth: 260 }}>
                          <p style={{ fontSize: 13, fontWeight: 500, color: done ? 'var(--text-hint)' : 'var(--text-primary)', textDecoration: done ? 'line-through' : 'none', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</p>
                          {task.description && <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.description}</p>}
                        </td>
                        <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                          <select value={task.status} onChange={e => handleStatusChange(task.id, e.target.value as TaskStatus)}
                            style={{ background: s.bg, color: s.color, border: 'none', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 600, cursor: 'pointer', outline: 'none', fontFamily: F }}
                          >
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Done</option>
                          </select>
                        </td>
                        <td style={{ padding: '11px 14px' }}>
                          <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 6, fontWeight: 600, background: p.bg, color: p.color }}>{task.priority}</span>
                        </td>
                        <td style={{ padding: '11px 14px' }}>
                          {(task.categories as any)?.name
                            ? <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 6, background: 'var(--border)', color: 'var(--text-secondary)' }}>{(task.categories as any).name}</span>
                            : <span style={{ color: 'var(--text-hint)', fontSize: 11 }}>N/A</span>
                          }
                        </td>
                        <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                          {task.due_date && task.due_date.trim() !== ''
                            ? <span style={{ fontSize: 12, color: isOverdue ? 'var(--red)' : 'var(--text-secondary)', fontWeight: isOverdue ? 600 : 400 }}>
                                {isOverdue ? '⚠ ' : ''}{new Date(task.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </span>
                            : <span style={{ color: 'var(--text-hint)', fontSize: 11 }}>N/A</span>
                          }
                        </td>
                        <td style={{ padding: '11px 14px' }}>
                          {done
                            ? <span style={{ color: 'var(--text-hint)', fontSize: 11 }}>—</span>
                            : running[task.id]
                              ? <button onClick={async () => { const m = await stopTimer(task.id, task.title); if (m > 0) showToast(`⏱ ${m} min logged`) }}
                                  style={{ padding: '3px 9px', borderRadius: 6, border: 'none', background: 'var(--yellow-bg)', color: 'var(--yellow)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: F }}
                                >■ {formatElapsed(task.id)}</button>
                              : <button onClick={() => { startTimer(task.id); if (task.status === 'todo') updateStatus(task.id, 'in_progress') }}
                                  style={{ padding: '3px 9px', borderRadius: 6, border: 'none', background: 'var(--green-bg)', color: 'var(--green)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: F }}
                                >▶ Start</button>
                          }
                        </td>
                        <td style={{ padding: '11px 14px' }}>
                          <div style={{ display: 'flex', gap: 5 }}>
                            <button onClick={() => { setEditTask(task); setShowModal(true) }}
                              style={{ padding: '4px 10px', borderRadius: 7, background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', color: 'var(--accent-text)', fontSize: 11, cursor: 'pointer', fontFamily: F, whiteSpace: 'nowrap' }}
                            >Edit</button>
                            <button onClick={() => handleDelete(task.id)}
                              style={{ padding: '4px 10px', borderRadius: 7, background: 'var(--red-bg)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--red)', fontSize: 11, cursor: 'pointer', fontFamily: F, whiteSpace: 'nowrap' }}
                            >Delete</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Pagination Bar ── */}
          {sortedFiltered.length > PAGE_SIZE && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, flexWrap: 'wrap', gap: 10 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Showing {Math.min((page - 1) * PAGE_SIZE + 1, sortedFiltered.length)}–{Math.min(page * PAGE_SIZE, sortedFiltered.length)} of {sortedFiltered.length}
              </span>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <PagBtn label="«" disabled={page === 1}        onClick={() => setPage(1)} />
                <PagBtn label="‹" disabled={page === 1}        onClick={() => setPage(p => p - 1)} />
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                  .reduce<(number | '...')[]>((acc, n, idx, arr) => {
                    if (idx > 0 && (n as number) - (arr[idx - 1] as number) > 1) acc.push('...')
                    acc.push(n); return acc
                  }, [])
                  .map((n, idx) => n === '...'
                    ? <span key={`e${idx}`} style={{ padding: '0 4px', color: 'var(--text-muted)', fontSize: 12 }}>…</span>
                    : <PagBtn key={n} label={String(n)} active={page === n} onClick={() => setPage(n as number)} />
                  )}
                <PagBtn label="›" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} />
                <PagBtn label="»" disabled={page === totalPages} onClick={() => setPage(totalPages)} />
              </div>
            </div>
          )}
        </>
      )}

      {/* ── CARD VIEW with Infinite Scroll ── */}
      {view === 'card' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 12 }}>
            {cardTasks.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px 0' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--border-hover)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 12 }}>
                  <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                  {search ? `No tasks found for "${search}"` : 'No tasks here. Add one!'}
                </p>
              </div>
            ) : cardTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                isRunning={!!running[task.id]}
                elapsed={formatElapsed(task.id)}
                onStatusChange={handleStatusChange}
                onEdit={() => { setEditTask(task); setShowModal(true) }}
                onDelete={() => handleDelete(task.id)}
                onStartTimer={() => { startTimer(task.id); if (task.status === 'todo') updateStatus(task.id, 'in_progress') }}
                onStopTimer={async () => { const m = await stopTimer(task.id, task.title); if (m > 0) showToast(`⏱ ${m} min logged`) }}
                onLogManual={async (mins: number) => { await logManual(task.id, task.title, mins); showToast(`📝 ${mins} min logged`) }}
              />
            ))}
          </div>

          {/* Infinite scroll sentinel — always mounted so the observer ref stays valid */}
          <div
            ref={loaderRef}
            style={{
              textAlign: 'center', padding: hasMoreCards ? '24px 0' : '0',
              color: 'var(--text-muted)', fontSize: 12,
              visibility: hasMoreCards ? 'visible' : 'hidden',
              height: hasMoreCards ? 'auto' : 0,
            }}
          >
            {cardLoading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 16, height: 16, border: '2px solid var(--accent-bg)', borderTopColor: 'var(--accent)', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />
                Loading more…
              </span>
            ) : (
              <span style={{ opacity: 0.4 }}>↓ Scroll for more</span>
            )}
          </div>

          {/* Footer count */}
          {sortedFiltered.length > 0 && (
            <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
              Showing {cardTasks.length} of {sortedFiltered.length} tasks
            </p>
          )}
        </>
      )}

      {showModal && (
        <TaskModal
          key={editTask ? editTask.id : 'new'}   // force remount so form resets properly
          task={editTask}
          categories={categories}
          userId={userId}
          onClose={() => { setShowModal(false); setEditTask(null) }}
          onSave={handleSave}
        />
      )}

      {Dialog}

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes slideIn { from { opacity:0; transform:translateX(20px) } to { opacity:1; transform:translateX(0) } }
        @keyframes pulse   { 0%,100% { opacity:1 } 50% { opacity:.5 } }
        input::placeholder { color: var(--text-muted) }
        @media(max-width:768px){ .page-wrap{ padding:14px!important } }
      `}</style>
    </div>
  )
}

// ── Pagination Button ────────────────────────────────────
function PagBtn({ label, onClick, disabled, active }: { label: string; onClick: () => void; disabled?: boolean; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        minWidth: 30, height: 30, padding: '0 8px', borderRadius: 7, border: 'none',
        background: active ? 'linear-gradient(135deg,var(--accent),var(--accent-2))' : 'var(--bg-card)',
        color: active ? '#fff' : disabled ? 'var(--text-hint)' : 'var(--text-secondary)',
        fontSize: 12, fontWeight: 500, cursor: disabled ? 'not-allowed' : 'pointer',
        outline: active ? 'none' : '1px solid var(--border)',
        fontFamily: F, transition: 'all .15s', opacity: disabled ? 0.4 : 1,
      }}
    >{label}</button>
  )
}

// ── TaskCard ──────────────────────────────────────────────
const TaskCard = memo(function TaskCard({ task, isRunning, elapsed, onStatusChange, onEdit, onDelete, onStartTimer, onStopTimer, onLogManual }: {
  task: Task; isRunning: boolean; elapsed: string
  onStatusChange: (id: string, s: TaskStatus) => void
  onEdit: () => void; onDelete: () => void
  onStartTimer: () => void; onStopTimer: () => void
  onLogManual: (mins: number) => void
}) {
  const [hovered,      setHovered]      = useState(false)
  const [showLogInput, setShowLogInput] = useState(false)
  const [manualMins,   setManualMins]   = useState('')

  const p    = priorityColor[task.priority]
  const s    = statusColor[task.status]
  const done = task.status === 'completed'

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: isRunning ? 'var(--yellow-bg)' : hovered ? 'var(--bg-card-hover)' : 'var(--bg-card)', border: `1px solid ${isRunning ? 'rgba(251,191,36,0.3)' : hovered ? 'var(--border-hover)' : 'var(--border)'}`, borderRadius: 14, padding: '14px 16px', transition: 'all .15s', fontFamily: F }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <button onClick={() => onStatusChange(task.id, done ? 'todo' : 'completed')}
          style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, marginTop: 1, border: `2px solid ${done ? 'var(--green)' : 'var(--border-hover)'}`, background: done ? 'var(--green)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}
        >
          {done && <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: done ? 'var(--text-hint)' : 'var(--text-primary)', textDecoration: done ? 'line-through' : 'none' }}>{task.title}</span>
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, fontWeight: 600, background: p.bg, color: p.color }}>{task.priority}</span>
            {task.categories && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'var(--border)', color: 'var(--text-secondary)' }}>{(task.categories as any).name}</span>}
            {isRunning && <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 6, background: 'rgba(251,191,36,0.15)', color: 'var(--yellow)', fontWeight: 700, fontFamily: 'monospace', animation: 'pulse 1s ease infinite' }}>⏱ {elapsed}</span>}
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, fontWeight: 600, background: s.bg, color: s.color, marginLeft: 'auto' }}>{s.label}</span>
          </div>
          {task.description && <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 6px', lineHeight: 1.5 }}>{task.description}</p>}
          {task.due_date && <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '4px 0 6px' }}>📅 Due: {new Date(task.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>}

          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {(['todo', 'in_progress', 'completed'] as TaskStatus[]).map(st => {
              const active = task.status === st
              const cfg    = statusColor[st]
              return (
                <button key={st} onClick={() => onStatusChange(task.id, st)}
                  style={{ padding: '4px 10px', borderRadius: 7, border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: F, background: active ? cfg.bg : 'var(--bg-page)', color: active ? cfg.color : 'var(--text-muted)', outline: active ? `1px solid ${cfg.color}40` : '1px solid var(--border)', transition: 'all .15s' }}
                >{cfg.label}</button>
              )
            })}
            {!done && (
              <>
                {!isRunning ? (
                  <button onClick={onStartTimer} style={{ padding: '4px 10px', borderRadius: 7, border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: F, background: 'var(--green-bg)', color: 'var(--green)', outline: '1px solid rgba(52,211,153,0.3)', marginLeft: 4 }}>▶ Start</button>
                ) : (
                  <button onClick={onStopTimer} style={{ padding: '4px 10px', borderRadius: 7, border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: F, background: 'var(--yellow-bg)', color: 'var(--yellow)', outline: '1px solid rgba(251,191,36,0.4)', animation: 'pulse 1.5s ease infinite' }}>■ Stop</button>
                )}
                <button onClick={() => setShowLogInput(v => !v)} style={{ padding: '4px 10px', borderRadius: 7, border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: F, background: 'var(--blue-bg)', color: 'var(--blue)', outline: '1px solid rgba(56,189,248,0.3)' }}>📝 Log</button>
              </>
            )}
          </div>

          {showLogInput && (
            <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' }}>
              <input type="number" min="1" max="480" placeholder="Minutes" value={manualMins} onChange={e => setManualMins(e.target.value)}
                style={{ width: 120, background: 'var(--bg-input)', border: '1px solid var(--border-input)', borderRadius: 8, padding: '6px 10px', color: 'var(--text-primary)', fontSize: 12, outline: 'none', fontFamily: F }}
              />
              <button onClick={() => { const m = parseInt(manualMins); if (m > 0) { onLogManual(m); setManualMins(''); setShowLogInput(false) } }}
                style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,var(--accent),var(--accent-2))', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: F }}
              >Save</button>
              <button onClick={() => setShowLogInput(false)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', fontFamily: F }}>Cancel</button>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 6, flexShrink: 0, opacity: hovered ? 1 : 0, transition: 'opacity .15s' }}>
          <button onClick={onEdit} style={{ padding: '5px 10px', borderRadius: 7, background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', color: 'var(--accent-text)', fontSize: 12, cursor: 'pointer', fontFamily: F }}>Edit</button>
          <button onClick={onDelete} style={{ padding: '5px 10px', borderRadius: 7, background: 'var(--red-bg)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--red)', fontSize: 12, cursor: 'pointer', fontFamily: F }}>Delete</button>
        </div>
      </div>
    </div>
  )
})

// ── Validation helpers ───────────────────────────────────
function validate(form: {
  title: string; description: string; priority: string
  category_id: string; due_date: string; status: string
}): Record<string, string> {
  const errs: Record<string, string> = {}
  if (!form.title.trim())
    errs.title = 'Task title is required'
  else if (form.title.trim().length < 3)
    errs.title = 'Title must be at least 3 characters'
  else if (form.title.trim().length > 120)
    errs.title = 'Title must be under 120 characters'

  if (form.description && form.description.length > 500)
    errs.description = 'Description must be under 500 characters'

  if (!['low', 'medium', 'high'].includes(form.priority))
    errs.priority = 'Select a valid priority'

  if (!['todo', 'in_progress', 'completed'].includes(form.status))
    errs.status = 'Select a valid status'

  if (form.due_date) {
    const today = new Date().toISOString().split('T')[0]
    if (form.due_date < today)
      errs.due_date = 'Due date cannot be in the past'
  }

  return errs
}

// ── TaskModal ──────────────────────────────────────────────
function TaskModal({ task, categories, userId, onClose, onSave }: {
  task: Task | null; categories: Category[]; userId: string
  onClose: () => void; onSave: (p: Partial<Task>, id?: string) => void
}) {
  const [form, setForm] = useState({
    title:       task?.title       ?? '',
    description: task?.description ?? '',
    priority:    (task?.priority   ?? 'medium') as Priority,
    category_id: task?.category_id ?? '',
    due_date:    task?.due_date    ?? '',
    status:      (task?.status     ?? 'todo') as TaskStatus,
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const set = (k: string, v: string) => {
    setForm(p => ({ ...p, [k]: v }))
    // Clear error on change
    if (errors[k]) setErrors(p => { const n = { ...p }; delete n[k]; return n })
  }

  const touch = (k: string) => setTouched(p => ({ ...p, [k]: true }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      // Mark all fields touched to show all errors
      const allTouched = Object.keys(form).reduce((a, k) => ({ ...a, [k]: true }), {})
      setTouched(allTouched)
      return
    }
    setSaving(true)
    await onSave(
      {
        title:       form.title.trim(),
        description: form.description.trim() || null,
        priority:    form.priority,
        category_id: form.category_id || null,
        due_date:    form.due_date    || null,
        status:      form.status,
        user_id:     userId,
      },
      task?.id
    )
    setSaving(false)
  }

  const fieldErr = (k: string) =>
    touched[k] && errors[k]
      ? <div style={{ color: 'var(--red)', fontSize: 11, marginTop: 4, marginBottom: 2 }}>⚠ {errors[k]}</div>
      : <div style={{ marginBottom: 2 }} />

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}
      onClick={onClose}
    >
      <div
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '24px', width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.3)', fontFamily: F }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ color: 'var(--text-primary)', fontSize: 16, fontWeight: 700, margin: 0 }}>{task ? 'Edit Task' : 'Add New Task'}</h2>
          <button onClick={onClose} style={{ background: 'var(--bg-page)', border: '1px solid var(--border)', borderRadius: 8, width: 30, height: 30, color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        <form onSubmit={handleSubmit} noValidate>

          {/* Title */}
          <Lbl text="Title *" />
          <input
            style={{ ...inp, borderColor: touched.title && errors.title ? 'var(--red)' : 'var(--border-input)', marginBottom: 2 }}
            placeholder="e.g. Learn Closures"
            value={form.title}
            onChange={e => set('title', e.target.value)}
            onBlur={() => touch('title')}
            maxLength={120}
          />
          {fieldErr('title')}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
            <span style={{ fontSize: 10, color: 'var(--text-hint)' }}>{form.title.length}/120</span>
          </div>

          {/* Description */}
          <Lbl text="Description" />
          <textarea
            style={{ ...inp, resize: 'vertical', marginBottom: 2, borderColor: touched.description && errors.description ? 'var(--red)' : 'var(--border-input)' }}
            rows={2}
            placeholder="Details (optional)"
            value={form.description}
            onChange={e => set('description', e.target.value)}
            onBlur={() => touch('description')}
            maxLength={500}
          />
          {fieldErr('description')}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
            <span style={{ fontSize: 10, color: 'var(--text-hint)' }}>{form.description.length}/500</span>
          </div>

          {/* Priority + Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 4 }}>
            <div>
              <Lbl text="Priority *" />
              <select
                style={{ ...inp, borderColor: touched.priority && errors.priority ? 'var(--red)' : 'var(--border-input)' }}
                value={form.priority}
                onChange={e => set('priority', e.target.value)}
                onBlur={() => touch('priority')}
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
              {fieldErr('priority')}
            </div>
            <div>
              <Lbl text="Category" />
              <select
                style={inp}
                value={form.category_id}
                onChange={e => set('category_id', e.target.value)}
              >
                <option value="">None</option>
                {categories.filter((c: any) => c.is_active !== false).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date + Status */}
          <div style={{ display: 'grid', gridTemplateColumns: task ? '1fr 1fr' : '1fr', gap: 10, marginBottom: 4 }}>
            <div>
              <Lbl text="Due Date" />
              <input
                type="date"
                style={{ ...inp, borderColor: touched.due_date && errors.due_date ? 'var(--red)' : 'var(--border-input)' }}
                value={form.due_date}
                onChange={e => set('due_date', e.target.value)}
                onBlur={() => touch('due_date')}
              />
              {fieldErr('due_date')}
            </div>
            {task && (
              <div>
                <Lbl text="Status *" />
                <select
                  style={{ ...inp, borderColor: touched.status && errors.status ? 'var(--red)' : 'var(--border-input)' }}
                  value={form.status}
                  onChange={e => set('status', e.target.value)}
                  onBlur={() => touch('status')}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                {fieldErr('status')}
              </div>
            )}
          </div>
          <div style={{ marginBottom: 16 }} />

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-page)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: F }}
            >Cancel</button>
            <button
              type="submit"
              disabled={saving}
              style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', background: saving ? 'var(--accent-bg)' : 'linear-gradient(135deg,var(--accent),var(--accent-2))', color: saving ? 'var(--accent-text)' : '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: F }}
            >{saving ? 'Saving...' : task ? 'Update Task' : 'Add Task'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Lbl({ text }: { text: string }) {
  return <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{text}</label>
}

function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100%', background: 'var(--bg-page)', fontFamily: F }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 34, height: 34, border: '3px solid var(--accent-bg)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 10px' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading tasks...</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
