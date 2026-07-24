# Task-Manager

Cross-platform real-time Task Manager. This session (Session 2 – Task 2) builds the
production foundation: authentication, the `tasks` table, and CRUD.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS
- Supabase (Auth + Postgres)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a Supabase project, then in the SQL Editor run [`supabase/schema.sql`](supabase/schema.sql)
   to create the `tasks` table, its indexes, and Row Level Security policies.

3. Copy the env example and fill in your project's API URL/anon key
   (Project Settings -> API):

   ```bash
   cp .env.local.example .env.local
   ```

4. Run the dev server:

   ```bash
   npm run dev
   ```

## Project structure

```
src/
  app/                 routes (/, /login, /register, /dashboard)
  features/
    auth/               server actions + forms for register/login/logout
    tasks/              server actions + components for task CRUD
  components/           small shared UI pieces (e.g. SubmitButton)
  lib/supabase/          browser/server Supabase clients + session middleware
  types/                 Task and Database types
supabase/
  schema.sql             tasks table, RLS policies, updated_at trigger
docs/
  realtime-research.md   real-time architecture research (Session 2 – Task 1)
```

Future sessions will add real-time updates, Chrome extension, Expo, and Tauri clients
on top of this same Supabase backend and auth flow — no changes to this foundation
should be required to plug those in.
