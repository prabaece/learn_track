// supabase/functions/daily-summary/index.ts
// Runs daily at 13:30 UTC (7PM IST) — sends daily learning summary

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase     = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
const TWILIO_SID   = Deno.env.get('TWILIO_ACCOUNT_SID')!
const TWILIO_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')!
const TWILIO_FROM  = Deno.env.get('TWILIO_WHATSAPP_FROM')!
const RESEND_KEY   = Deno.env.get('RESEND_API_KEY')!

async function sendWhatsApp(to: string, message: string) {
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`, {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ From: TWILIO_FROM, To: `whatsapp:${to}`, Body: message }),
  })
  return res.ok
}

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'LearnTrack <notifications@yourdomain.com>', to: [to], subject, html }),
  })
  return res.ok
}

async function alreadySent(userId: string, refId: string, channel: string) {
  const today = new Date().toISOString().split('T')[0]
  const { data } = await supabase.from('notification_log').select('id')
    .eq('user_id', userId).eq('type', 'daily_summary').eq('ref_id', refId).eq('channel', channel)
    .gte('sent_at', today + 'T00:00:00').limit(1)
  return (data?.length ?? 0) > 0
}

Deno.serve(async () => {
  const today = new Date().toISOString().split('T')[0]

  // Get all users with daily_summary enabled
  const { data: settings } = await supabase
    .from('notification_settings')
    .select('user_id, whatsapp_number, email, daily_summary')
    .eq('daily_summary', true)

  if (!settings?.length) return new Response('No users', { status: 200 })

  let sent = 0

  for (const setting of settings) {
    const uid = setting.user_id

    // Get today's stats
    const [{ data: completed }, { data: logs }, { data: pending }] = await Promise.all([
      supabase.from('tasks').select('id,title,categories(name)').eq('user_id', uid).eq('status', 'completed').gte('completed_at', today + 'T00:00:00'),
      supabase.from('learning_logs').select('time_spent_mins').eq('user_id', uid).eq('logged_date', today),
      supabase.from('tasks').select('id,title,due_date,priority').eq('user_id', uid).neq('status', 'completed').order('due_date', { ascending: true }).limit(3),
    ])

    const doneCount  = completed?.length || 0
    const totalMins  = logs?.reduce((s, l) => s + l.time_spent_mins, 0) || 0
    const hrs        = Math.floor(totalMins / 60)
    const mins       = totalMins % 60
    const timeStr    = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`
    const pendingList = (pending || []).map(t => `• ${t.title}`).join('\n') || '• None 🎉'

    // WhatsApp message
    const waMsg = `
*LearnTrack — Daily Summary* 📊
${new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })}

${doneCount > 0 ? '🎉' : '📌'} *Tasks completed today:* ${doneCount}
⏱ *Time logged:* ${totalMins > 0 ? timeStr : 'Not started yet'}

*Pending tasks:*
${pendingList}

${doneCount === 0 ? "💪 Don't give up! Start with one small task." : doneCount >= 3 ? '🔥 Amazing day! Keep the streak going!' : '✅ Good progress! A little more effort!'}

_LearnTrack — Stay consistent, crack the interview!_
    `.trim()

    // Email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body{font-family:'Segoe UI',sans-serif;background:#f1f5f9;margin:0;padding:20px}
    .card{background:#fff;border-radius:16px;padding:32px;max-width:520px;margin:0 auto;box-shadow:0 4px 24px rgba(0,0,0,0.08)}
    .stat{background:#f8fafc;border-radius:12px;padding:14px 18px;border:1px solid #e2e8f0;display:inline-block;min-width:120px;text-align:center;margin:4px}
    .stat-val{font-size:28px;font-weight:700;color:#0f172a;display:block}
    .stat-lbl{font-size:12px;color:#64748b;display:block;margin-top:2px}
    .task-item{padding:10px 14px;background:#f8fafc;border-radius:8px;margin-bottom:6px;font-size:13px;color:#374151;border-left:3px solid #7c3aed}
    .btn{display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;border-radius:10px;text-decoration:none;font-weight:600;margin-top:20px}
    .msg{padding:14px 18px;border-radius:10px;font-size:13px;margin-top:16px}
    .good{background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0}
    .meh{background:#fffbeb;color:#d97706;border:1px solid #fde68a}
  </style>
</head>
<body>
  <div class="card">
    <h2 style="margin:0 0 4px;color:#0f172a">📊 Your Daily Summary</h2>
    <p style="color:#64748b;font-size:13px;margin:0 0 24px">${new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>

    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:24px">
      <div class="stat">
        <span class="stat-val" style="color:${doneCount>0?'#7c3aed':'#94a3b8'}">${doneCount}</span>
        <span class="stat-lbl">Tasks Done</span>
      </div>
      <div class="stat">
        <span class="stat-val" style="color:${totalMins>0?'#059669':'#94a3b8'}">${totalMins > 0 ? timeStr : '0m'}</span>
        <span class="stat-lbl">Time Logged</span>
      </div>
    </div>

    ${(pending?.length || 0) > 0 ? `
    <p style="font-weight:600;color:#0f172a;font-size:14px;margin:0 0 10px">📌 Pending Tasks</p>
    ${(pending || []).map(t => `<div class="task-item">${t.title}${t.due_date ? ` <span style="color:#ef4444;font-size:11px">Due: ${t.due_date}</span>` : ''}</div>`).join('')}
    ` : ''}

    <div class="msg ${doneCount >= 3 ? 'good' : 'meh'}">
      ${doneCount === 0 ? "💪 No tasks done today — tomorrow is a fresh start!" : doneCount >= 3 ? '🔥 Excellent day! You\'re crushing the interview prep!' : '✅ Good progress! Keep the momentum going!'}
    </div>

    <a href="${Deno.env.get('APP_URL') || 'http://localhost:3000'}/dashboard" class="btn">
      Open Dashboard →
    </a>
    <p style="color:#94a3b8;font-size:11px;margin-top:20px">LearnTrack — Stay consistent, crack the interview! 💪</p>
  </div>
</body>
</html>
    `.trim()

    // Send WhatsApp
    if (setting.whatsapp_number) {
      if (!(await alreadySent(uid, today, 'whatsapp'))) {
        const ok = await sendWhatsApp(setting.whatsapp_number, waMsg)
        if (ok) {
          await supabase.from('notification_log').insert({ user_id: uid, type: 'daily_summary', ref_id: today, channel: 'whatsapp' })
          sent++
        }
      }
    }

    // Send Email
    const emailTo = setting.email
    if (emailTo) {
      if (!(await alreadySent(uid, today, 'email'))) {
        const ok = await sendEmail(emailTo, `📊 LearnTrack Daily Summary — ${doneCount} tasks done today`, emailHtml)
        if (ok) {
          await supabase.from('notification_log').insert({ user_id: uid, type: 'daily_summary', ref_id: today, channel: 'email' })
          sent++
        }
      }
    }
  }

  return new Response(JSON.stringify({ sent, users: settings.length }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
