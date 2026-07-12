-- ============================================================
-- Jobs Page Redesign (lot 1) — saved jobs
-- Run this in: https://app.supabase.com → SQL Editor → New query
--
-- Visa Sponsorship is intentionally NOT included here — no real data
-- source exists for it yet, so it's omitted from the jobs page entirely
-- this lot rather than adding a column with no real data to populate it.
-- ============================================================

-- Saved Jobs — same RLS pattern as career_analysis/cover_letters: a plain
-- `auth.uid() = candidate_id` comparison only, no subqueries, to avoid the
-- infinite-recursion bug from earlier in this project (see
-- supabase/fix_employer_read_recursion.sql for that incident).
create table if not exists public.saved_jobs (
  id            uuid primary key default gen_random_uuid(),
  candidate_id  uuid not null references auth.users (id) on delete cascade,
  job_id        uuid not null references public.jobs (id) on delete cascade,
  created_at    timestamptz not null default now(),
  unique (candidate_id, job_id)
);

create index if not exists saved_jobs_candidate_id_idx on public.saved_jobs (candidate_id);

alter table public.saved_jobs enable row level security;

create policy "Candidates can view own saved jobs"
  on public.saved_jobs for select
  using (auth.uid() = candidate_id);

create policy "Candidates can save jobs"
  on public.saved_jobs for insert
  with check (auth.uid() = candidate_id);

create policy "Candidates can unsave own saved jobs"
  on public.saved_jobs for delete
  using (auth.uid() = candidate_id);
