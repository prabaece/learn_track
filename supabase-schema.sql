-- ============================================
-- LearnTrack — Supabase SQL Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================

-- 1. Profiles (auto-created on signup)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default now()
);

-- 2. Categories
create table if not exists categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  color text default '#7F77DD',
  created_at timestamp with time zone default now()
);

-- 3. Tasks
create table if not exists tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  category_id uuid references categories(id) on delete set null,
  title text not null,
  description text,
  status text check (status in ('todo','in_progress','completed')) default 'todo',
  priority text check (priority in ('low','medium','high')) default 'medium',
  due_date date,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- 4. Learning logs
create table if not exists learning_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  task_id uuid references tasks(id) on delete cascade not null,
  note text,
  time_spent_mins integer default 0,
  logged_date date default current_date,
  created_at timestamp with time zone default now()
);

-- ============================================
-- Row Level Security
-- ============================================
alter table profiles enable row level security;
alter table categories enable row level security;
alter table tasks enable row level security;
alter table learning_logs enable row level security;

create policy "Users see own profile"    on profiles    for all using (auth.uid() = id);
create policy "Users see own categories" on categories  for all using (auth.uid() = user_id);
create policy "Users see own tasks"      on tasks       for all using (auth.uid() = user_id);
create policy "Users see own logs"       on learning_logs for all using (auth.uid() = user_id);

-- ============================================
-- Auto-create profile trigger on signup
-- ============================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================
-- Auto-seed default categories on first task
-- (Optional: run manually after signup)
-- Replace YOUR_USER_ID with your actual UUID
-- ============================================
-- insert into categories (user_id, name, color) values
--   ('YOUR_USER_ID', 'JavaScript', '#F7C948'),
--   ('YOUR_USER_ID', 'React',      '#61DAFB'),
--   ('YOUR_USER_ID', 'DSA',        '#FF6B6B'),
--   ('YOUR_USER_ID', 'Aptitude',   '#6BCB77'),
--   ('YOUR_USER_ID', 'System Design', '#C084FC');
