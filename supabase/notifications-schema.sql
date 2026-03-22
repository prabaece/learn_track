-- ============================================================
-- Run this in Supabase SQL Editor
-- ============================================================

-- Notification preferences per user
create table if not exists notification_settings (
  id                  uuid default gen_random_uuid() primary key,
  user_id             uuid references profiles(id) on delete cascade unique,
  whatsapp_number     text,           -- e.g. +919876543210
  email               text,
  due_reminder        boolean default true,
  daily_summary       boolean default true,
  daily_summary_time  text default '19:00',  -- 24hr format IST
  created_at          timestamp with time zone default now(),
  updated_at          timestamp with time zone default now()
);

alter table notification_settings enable row level security;
create policy "own settings" on notification_settings
  for all using (auth.uid() = user_id);

-- Notification log (prevent duplicate sends)
create table if not exists notification_log (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references profiles(id) on delete cascade,
  type        text,   -- 'due_reminder' | 'daily_summary'
  ref_id      text,   -- task_id or date
  channel     text,   -- 'whatsapp' | 'email'
  sent_at     timestamp with time zone default now()
);

alter table notification_log enable row level security;
create policy "own logs" on notification_log
  for all using (auth.uid() = user_id);

-- Index for fast duplicate check
create index if not exists notif_log_idx
  on notification_log(user_id, type, ref_id, channel);
