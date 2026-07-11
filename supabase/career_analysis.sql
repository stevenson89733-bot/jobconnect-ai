-- ============================================================
-- AI Career Coach — cached analysis table
-- Run this in: https://app.supabase.com → SQL Editor → New query
--
-- One cached row per candidate (unique on candidate_id), overwritten on each
-- "Refresh Analysis" click rather than accumulating a history. RLS is scoped
-- to a plain `auth.uid() = candidate_id` comparison only — no subquery into
-- this or any other RLS-protected table, so this cannot hit the infinite-
-- recursion bug from earlier in this project (see
-- supabase/fix_employer_read_recursion.sql for that incident).
-- ============================================================

create table if not exists public.career_analysis (
  id            uuid primary key default gen_random_uuid(),
  candidate_id  uuid not null unique references auth.users (id) on delete cascade,
  generated_at  timestamptz not null default now(),
  analysis_json jsonb not null
);

alter table public.career_analysis enable row level security;

create policy "Candidates can view own career analysis"
  on public.career_analysis for select
  using (auth.uid() = candidate_id);

create policy "Candidates can insert own career analysis"
  on public.career_analysis for insert
  with check (auth.uid() = candidate_id);

create policy "Candidates can update own career analysis"
  on public.career_analysis for update
  using (auth.uid() = candidate_id)
  with check (auth.uid() = candidate_id);
