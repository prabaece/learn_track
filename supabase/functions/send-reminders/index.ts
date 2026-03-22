// supabase/functions/send-reminders/index.ts
// Runs daily via Supabase Cron — sends WhatsApp + Email for tasks due tomorrow

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const TWILIO_SID   = Deno.env.get('TWILIO_ACCOUNT_SID')!
const TWILIO_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')!
const TWILIO_FROM  = Deno.env.get('TWILIO_WHATSAPP_FROM')!  // whatsapp:+14155238886
const RESEND_KEY   = Deno.env.get('RESEND_API_KEY')!

// ── Send WhatsApp via Twilio ──────────────────────────────
async function sendWhatsApp(to: string, message: string) {
  const url  = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`
  const body = new URLSearchParams({
    From: TWILIO_FROM,
    To:   `whatsapp:${to}`,
    Body: message,
  })
  const res = await fetch(url, {
    method:  'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`),
      'Content-Type':  'application/x-www-form-urlencoded',
    },
    body,
  })
  return res.ok
}

// ── Send Email via Resend ─────────────────────────────────
async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_KEY}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      from:    'LearnTrack <notifications@yourdomain.com>',
      to:      [to],
      subject,
      html,
    }),
  })
  return res.ok
}

// ── Already sent check ────────────────────────────────────
async function alreadySent(userId: string, type: string, refId: string, channel: string) {
  const today = new Date().toISOString().split('T')[0]
  const { data } = await supabase
    .from('notification_log')
    .select('id')
    .eq('user_id', userId)
    .eq('type', type)
    .eq('ref_id', refId)
    .eq('channel', channel)
    .gte('sent_at', today + 'T00:00:00')
    .limit(1)
  return (data?.length ?? 0) > 0
}

async function logSent(userId: string, type: string, refId: string, channel: string) {
  await supabase.from('notification_log').insert({ user_id: userId, type, ref_id: refId, channel })
}

// ── Main handler ──────────────────────────────────────────
Deno.serve(async () => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  // Get all tasks due tomorrow with user notification settings
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select(`
      id, title, priority, user_id,
      categories(name),
      profiles!inner(email),
      notification_settings!inner(
        whatsapp_number, email,
        due_reminder
      )
    `)
    .eq('due_date', tomorrowStr)
    .eq('status', 'todo')
    .eq('notification_settings.due_reminder', true)

  if (error) {
    console.error('DB error:', error)
    return new Response('Error', { status: 500 })
  }

  let sent = 0

  for (const task of (tasks || [])) {
    const settings = (task as any).notification_settings
    const profile  = (task as any).profiles
    const catName  = (task as any).categories?.name || 'General'
    const userId   = task.user_id

    const waMsg = `
*LearnTrack Reminder* 📚

Hey! You have a task due *tomorrow*:

📌 *${task.title}*
📂 Category: ${catName}
🔴 Priority: ${task.priority}

Don't forget to complete it!

_LearnTrack — Your Interview Prep Tracker_
    `.trim()

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 20px; }
    .card { background: #fff; border-radius: 16px; padding: 32px; max-width: 480px; margin: 0 auto; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .high   { background: #fef2f2; color: #dc2626; }
    .medium { background: #fffbeb; color: #d97706; }
    .low    { background: #f0fdf4; color: #16a34a; }
    .btn { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg,#7c3aed,#4f46e5); color: #fff; border-radius: 10px; text-decoration: none; font-weight: 600; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <h2 style="margin:0 0 4px;color:#0f172a">⏰ Task Due Tomorrow!</h2>
    <p style="color:#64748b;margin:0 0 24px;font-size:14px">Don't forget — your task is due tomorrow</p>
    <div style="background:#f8fafc;border-radius:12px;padding:16px;border:1px solid #e2e8f0">
      <p style="font-weight:700;color:#0f172a;font-size:16px;margin:0 0 8px">📌 ${task.title}</p>
      <p style="color:#64748b;font-size:13px;margin:0 0 10px">📂 ${catName}</p>
      <span class="badge ${task.priority}">${task.priority} priority</span>
    </div>
    <a href="${Deno.env.get('APP_URL') || 'http://localhost:3000'}/tasks" class="btn">
      Open LearnTrack →
    </a>
    <p style="color:#94a3b8;font-size:11px;margin-top:20px">LearnTrack — Interview Prep Tracker</p>
  </div>
</body>
</html>
    `.trim()

    // WhatsApp
    if (settings?.whatsapp_number) {
      const key = `${task.id}-${tomorrowStr}`
      if (!(await alreadySent(userId, 'due_reminder', key, 'whatsapp'))) {
        const ok = await sendWhatsApp(settings.whatsapp_number, waMsg)
        if (ok) { await logSent(userId, 'due_reminder', key, 'whatsapp'); sent++ }
      }
    }

    // Email
    const emailTo = settings?.email || profile?.email
    if (emailTo) {
      const key = `${task.id}-${tomorrowStr}`
      if (!(await alreadySent(userId, 'due_reminder', key, 'email'))) {
        const ok = await sendEmail(emailTo, `⏰ Task Due Tomorrow: ${task.title}`, emailHtml)
        if (ok) { await logSent(userId, 'due_reminder', key, 'email'); sent++ }
      }
    }
  }

  return new Response(JSON.stringify({ sent, tasks: tasks?.length }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
