# Task-Manager

Cross-platform real-time Task Manager. Authentication, the `tasks` table with RLS,
full CRUD, and live cross-tab/cross-device/cross-user sync via Supabase Realtime.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS
- Supabase (Auth + Postgres + Realtime)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a Supabase project, then in the SQL Editor run [`supabase/schema.sql`](supabase/schema.sql)
   to create the `tasks` table, its indexes, Row Level Security policies, and the
   Realtime publication membership + replica identity Postgres Changes needs (see
   "Realtime" below). Safe to re-run any time — every statement is idempotent.

3. Copy the env example and fill in your project's API URL/anon key, both found at
   **Project Settings -> API**:
   - `NEXT_PUBLIC_SUPABASE_URL` = "Project URL"
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = "anon public" key under Project API keys

   ```bash
   cp .env.local.example .env.local
   ```

4. In **Authentication -> URL Configuration**, set:
   - **Site URL**: `http://localhost:3000` (your deployed URL in production)
   - **Redirect URLs**: add `http://localhost:3000/**`

   The Email provider is enabled by default and needs no extra setup. If
   **Authentication -> Providers -> Email -> Confirm email** is ON, new users must click
   the confirmation link before they get a session — the register form already shows a
   "check your email" message for this case. Turn it off if you want instant sign-in
   during local development.

5. Run the dev server:

   ```bash
   npm run dev
   ```

## Project structure

```
src/
  app/                 routes (/, /login, /register, /dashboard)
  features/
    auth/               server actions + forms for register/login/logout
    tasks/
      actions.ts          server actions for task CRUD (mutate the DB only —
                           see "Realtime" below for why they don't revalidate)
      components/         TaskBoard, TaskInput, TaskList, TaskItem, etc.
      hooks/
        useRealtimeTasks.ts  subscribes to Postgres Changes for the signed-in
                             user's tasks and merges INSERT/UPDATE/DELETE
                             events into local state
  components/           small shared UI pieces (e.g. SubmitButton)
  lib/supabase/          browser/server Supabase clients + session middleware
  types/                 Task and Database types
supabase/
  schema.sql             tasks table, RLS policies, updated_at trigger, Realtime setup
docs/
  realtime-research.md   real-time architecture research (Session 2 – Task 1)
```

Future sessions will add a Chrome extension, Expo, and Tauri clients on top of this
same Supabase backend, auth flow, and Realtime channel — no changes to this
foundation should be required to plug those in.

## Realtime

Every task change (create, update, complete/uncomplete, delete) is pushed to all of
that user's active sessions — other tabs, other windows, other devices — through
Supabase Realtime's Postgres Changes, filtered server-side to `user_id = <the
signed-in user>` and further constrained by the same RLS policies as everything
else. `useRealtimeTasks` owns the one subscription per mounted dashboard and merges
events into local state; the CRUD Server Actions in `actions.ts` intentionally do
**not** call `revalidatePath` — since Realtime already reflects a mutation back to
the acting tab through its own subscription (RLS allows a user to "receive" their
own writes), adding a full-page revalidation on top would only make every button
stay disabled needlessly longer while duplicating work Realtime already does.

Two one-time SQL requirements (both handled by `schema.sql`, neither optional):
- The table must be added to the `supabase_realtime` publication, or no
  Postgres Changes ever fire for it.
- `REPLICA IDENTITY FULL` is required for DELETE events specifically — Postgres's
  default replica identity only includes primary-key columns in a deleted row's
  payload, so a subscription filtered on `user_id` can never match a DELETE
  without it.
