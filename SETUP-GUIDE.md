# LearnTrack — Notification System Setup Guide

## Architecture
- Supabase Edge Functions (serverless)
- Twilio WhatsApp API (free sandbox)
- Resend Email API (free tier: 3000/month)
- Supabase pg_cron (scheduled jobs)

---

## Step 1: Get API Keys

### Twilio WhatsApp (Free)
1. signup at twilio.com
2. Go to Console → Messaging → Try it Out → Send a WhatsApp message
3. Copy: Account SID, Auth Token, WhatsApp sandbox number
4. Users must send "join <code>" to +1 415 523 8886 on WhatsApp first

### Resend Email (Free)
1. signup at resend.com
2. Add your domain OR use resend's test domain
3. Copy: API Key
4. Update "from" email in Edge Functions

---

## Step 2: Deploy Edge Functions

Install Supabase CLI:
```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

Deploy functions:
```bash
supabase functions deploy send-reminders
supabase functions deploy daily-summary
```

Set secrets:
```bash
supabase secrets set TWILIO_ACCOUNT_SID=ACxxxxxxxxxx
supabase secrets set TWILIO_AUTH_TOKEN=your_token
supabase secrets set TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
supabase secrets set RESEND_API_KEY=re_xxxxxxxxx
supabase secrets set APP_URL=https://yourapp.vercel.app
```

---

## Step 3: Run SQL Schema

Run notifications-schema.sql in Supabase SQL Editor.

---

## Step 4: Setup Cron Jobs

Run this in Supabase SQL Editor:

```sql
-- Enable pg_cron extension
create extension if not exists pg_cron;

-- Due date reminder — runs daily at 9:00 AM IST (3:30 AM UTC)
select cron.schedule(
  'due-reminders',
  '30 3 * * *',
  $$
  select net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-reminders',
    headers := '{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  );
  $$
);

-- Daily summary — runs daily at 7:00 PM IST (1:30 PM UTC)
select cron.schedule(
  'daily-summary',
  '30 13 * * *',
  $$
  select net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/daily-summary',
    headers := '{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  );
  $$
);
```

Replace:
- YOUR_PROJECT_REF → Supabase project reference
- YOUR_ANON_KEY → Supabase anon key (from Settings → API)

---

## Step 5: Add Settings to Sidebar

In Sidebar.tsx, add settings nav item:

```tsx
{ href: '/settings', label: 'Settings', icon: <svg...gear icon.../> }
```

Add settings layout:

```tsx
// src/app/settings/layout.tsx
import Sidebar from '@/components/Sidebar'
import Header  from '@/components/Header'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>
      <Sidebar />
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <Header />
        <main style={{ flex:1, overflowY:'auto' }}>{children}</main>
      </div>
    </div>
  )
}
```

---

## How it works

### Due Date Reminder
- Cron runs at 9 AM IST daily
- Finds all tasks where due_date = tomorrow
- Sends WhatsApp + Email to users with due_reminder = true
- Checks notification_log to prevent duplicates

### Daily Summary (7 PM IST)
- Cron runs at 7 PM IST daily
- For each user with daily_summary = true:
  - Counts tasks completed today
  - Sums time logged today
  - Lists top 3 pending tasks
- Sends WhatsApp message + beautiful HTML email

### WhatsApp Message Example:
```
LearnTrack — Daily Summary 📊
Saturday, 21 March

✅ Tasks completed today: 3
⏱ Time logged: 1h 45m

Pending tasks:
• Learn Closures
• Practice Array problems
• Mock interview prep

🔥 Amazing day! Keep the streak going!
```

---

## Testing

Test manually from Supabase Dashboard → Edge Functions → send-reminders → Test
Or use the "Send Test" buttons in Settings page.
