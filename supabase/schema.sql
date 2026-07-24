-- Task Manager: core schema
-- Run this once (or re-run any time — every statement here is safe to repeat)
-- in the Supabase project's SQL Editor (Dashboard -> SQL Editor -> New query).

create extension if not exists "pgcrypto";

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- `create table if not exists` skips entirely when the table already exists,
-- so constraints added after the table's first creation must be retrofitted
-- explicitly rather than declared inline on the column.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'tasks_title_not_empty'
  ) then
    alter table public.tasks
      add constraint tasks_title_not_empty check (btrim(title) <> '');
  end if;
end $$;

-- Superseded by the composite index below; drop it if an earlier run of
-- this script created it.
drop index if exists public.tasks_user_id_idx;

-- Matches the app's actual query: tasks for one user, newest first.
create index if not exists tasks_user_id_created_at_idx
  on public.tasks (user_id, created_at desc);

-- Row Level Security: every policy scopes rows to the requesting user only.
alter table public.tasks enable row level security;

-- `create policy` has no `if not exists` clause in Postgres, so each policy
-- is dropped first to make this script safe to re-run.
drop policy if exists "Users can view their own tasks" on public.tasks;
create policy "Users can view their own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own tasks" on public.tasks;
create policy "Users can insert their own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own tasks" on public.tasks;
create policy "Users can update their own tasks"
  on public.tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own tasks" on public.tasks;
create policy "Users can delete their own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- Keep updated_at accurate on every row update without relying on app code.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql
set search_path = public;

drop trigger if exists tasks_set_updated_at on public.tasks;

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row
  execute function public.set_updated_at();
