-- Track where each job posting originated — direct employer post, WWR RSS, or Remotive API.
-- Run in: https://app.supabase.com → SQL Editor → New query

alter table public.jobs
  add column if not exists source text
  check (source in ('wwr', 'remotive', 'direct'));

create index if not exists jobs_source_idx on public.jobs (source);
