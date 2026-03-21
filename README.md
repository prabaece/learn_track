# LearnTrack — Daily Learning Task Manager

Next.js 14 + Supabase + Tailwind CSS + Recharts

## Features
- Email / Google OAuth login
- Add, edit, delete tasks with priority + category + due date
- Status tracking: To Do → In Progress → Completed
- Analytics dashboard: Bar, Line, Pie charts
- Learning time logs per day
- Streak tracker
- Row-level security (each user sees only their own data)

## Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Styling**: Tailwind CSS
- **Charts**: Recharts

---

## Setup (5 steps)

### 1. Clone & install
```bash
npx create-next-app@latest learntrack --typescript --tailwind --app
cd learntrack
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs recharts lucide-react
```

### 2. Copy all project files into the created folder

### 3. Create Supabase project
- Go to https://supabase.com → New project
- Settings → API → copy Project URL + anon key

### 4. Create .env.local
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Run SQL schema
- Supabase Dashboard → SQL Editor → New query
- Paste contents of `supabase-schema.sql` → Run

### 6. Start
```bash
npm run dev
# Open http://localhost:3000
```

---

## Project structure
```
learntrack/
├── app/
│   ├── login/page.tsx          ← Auth (email + Google)
│   ├── dashboard/
│   │   ├── layout.tsx          ← Sidebar wrapper
│   │   └── page.tsx            ← Stats + recent tasks
│   ├── tasks/
│   │   ├── layout.tsx
│   │   └── page.tsx            ← Full CRUD task manager
│   ├── analytics/
│   │   ├── layout.tsx
│   │   └── page.tsx            ← Charts & progress
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                ← Redirects to /login
├── components/
│   └── Sidebar.tsx             ← Navigation sidebar
├── lib/
│   ├── supabase.ts             ← Supabase client
│   └── types.ts                ← TypeScript types
├── supabase-schema.sql         ← DB schema (run once)
├── .env.example                ← Copy to .env.local
└── package.json
```

---

## Add default categories (after signup)
Go to Supabase → SQL Editor, replace YOUR_USER_ID with your actual UUID:
```sql
insert into categories (user_id, name, color) values
  ('YOUR_USER_ID', 'JavaScript',    '#F7C948'),
  ('YOUR_USER_ID', 'React',         '#61DAFB'),
  ('YOUR_USER_ID', 'DSA',           '#FF6B6B'),
  ('YOUR_USER_ID', 'Aptitude',      '#6BCB77'),
  ('YOUR_USER_ID', 'System Design', '#C084FC');
```

---

## Interview talking points
- "Built with Next.js 14 App Router — server and client components"
- "Supabase PostgreSQL with Row Level Security — each user sees only their data"
- "Recharts for analytics — Bar, Line, Pie charts"
- "Google OAuth + email auth via Supabase"
- "TypeScript throughout for type safety"
- "Closures used in React hooks — useState, useCallback, useEffect all rely on closure"
