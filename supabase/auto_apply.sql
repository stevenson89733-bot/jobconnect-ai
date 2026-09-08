-- Auto-Apply Feature Tables
-- Run in: https://app.supabase.com → SQL Editor → New query

-- Settings for candidates using Auto-Apply
create table if not exists public.auto_apply_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  is_active boolean not null default false,
  max_applications_per_day integer not null default 5,
  min_match_score integer not null default 60,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Log of all applications sent via Auto-Apply
create table if not exists public.auto_apply_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  status text not null default 'sent',
  cover_letter text,
  adapted_cv_url text,
  applied_at timestamptz not null default now(),
  constraint auto_apply_status_check check (status in ('sent', 'failed', 'skipped'))
);

-- Indexes for performance
create index if not exists auto_apply_settings_user_id_idx on public.auto_apply_settings(user_id);
create index if not exists auto_apply_settings_is_active_idx on public.auto_apply_settings(is_active);
create index if not exists auto_apply_log_user_id_idx on public.auto_apply_log(user_id);
create index if not exists auto_apply_log_job_id_idx on public.auto_apply_log(job_id);
create index if not exists auto_apply_log_applied_at_idx on public.auto_apply_log(applied_at desc);

-- Row Level Security
alter table public.auto_apply_settings enable row level security;
alter table public.auto_apply_log enable row level security;

-- Users can view their own settings
create policy "Users can view own auto_apply_settings"
  on public.auto_apply_settings for select
  using (auth.uid() = user_id);

-- Users can update their own settings
create policy "Users can update own auto_apply_settings"
  on public.auto_apply_settings for update
  using (auth.uid() = user_id);

-- Service role can read all (for cron)
create policy "Service role can read all settings"
  on public.auto_apply_settings for select
  using (auth.role() = 'service_role');

-- Users can view their own logs
create policy "Users can view own auto_apply_log"
  on public.auto_apply_log for select
  using (auth.uid() = user_id);

-- Service role can insert logs
create policy "Service role can insert auto_apply_log"
  on public.auto_apply_log for insert
  with check (auth.role() = 'service_role');
