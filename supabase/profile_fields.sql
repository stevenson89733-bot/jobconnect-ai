-- ============================================================
-- JobConnect AI — Candidate profile editing fields + RLS
-- Run this in: https://app.supabase.com → SQL Editor → New query
-- Reuses the existing public.profiles table (no new table).
-- ============================================================

-- 1) Columns (idempotent — full_name already exists, so that line is a no-op)
alter table public.profiles add column if not exists full_name    text;
alter table public.profiles add column if not exists title        text;
alter table public.profiles add column if not exists bio          text;
alter table public.profiles add column if not exists experience   text;
alter table public.profiles add column if not exists skills       text;
alter table public.profiles add column if not exists education    text;
alter table public.profiles add column if not exists linkedin_url text;
alter table public.profiles add column if not exists github_url   text;

-- 2) Row Level Security — a user may SELECT and UPDATE ONLY their own row.
-- These policies already exist (from schema.sql); recreated idempotently to verify.
alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
