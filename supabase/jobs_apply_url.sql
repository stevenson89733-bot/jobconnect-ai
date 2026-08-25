-- External apply URL for jobs imported from RSS feeds (e.g. WeWorkRemotely)
-- Run in: https://app.supabase.com → SQL Editor → New query

alter table public.jobs
  add column if not exists apply_url text;

-- Click tracking — logs when a candidate follows an external apply link
create table if not exists public.job_clicks (
  id         uuid primary key default gen_random_uuid(),
  job_id     uuid not null references public.jobs (id) on delete cascade,
  source     text,           -- 'wwr', 'direct', etc.
  user_id    uuid references auth.users (id) on delete set null,
  clicked_at timestamptz not null default now()
);

create index if not exists job_clicks_job_id_idx    on public.job_clicks (job_id);
create index if not exists job_clicks_clicked_at_idx on public.job_clicks (clicked_at desc);

alter table public.job_clicks enable row level security;

-- Anyone (including anon) can log a click
create policy "Anyone can log job clicks"
  on public.job_clicks for insert
  with check (true);

-- Admins can read all clicks for analytics
create policy "Admins can view job clicks"
  on public.job_clicks for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.user_id = auth.uid()
        and profiles.is_admin = true
    )
  );
