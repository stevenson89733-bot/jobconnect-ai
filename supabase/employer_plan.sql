-- ============================================================
-- Employer Plan — real, enforced free-tier job posting limit
-- Run this in: https://app.supabase.com → SQL Editor → New query
--
-- Real audit before writing this: 1 real employer account exists today
-- (role='employer'), is_premium=true on it already (from earlier premium
-- testing this session, unrelated to employer plans), 0 real jobs with a
-- real posted_by (the 12 seed jobs predate the employer-posting feature).
-- So every employer profile safely defaults to 'free' with zero risk of
-- retroactively breaking an existing paid employer — there isn't one yet.
-- ============================================================

alter table public.profiles
  add column if not exists employer_plan text not null default 'free'
    check (employer_plan in ('free', 'growth'));

-- Same protection as is_premium/stripe_customer_id (supabase/lock_premium_fields.sql)
-- — a client could otherwise self-upgrade via a direct
-- supabase.from('profiles').update({ employer_plan: 'growth' }) call. Extends
-- the existing trigger function rather than adding a second one, so there is
-- one place that lists every field a normal authenticated user can't self-grant.
create or replace function public.protect_premium_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() <> 'service_role' then
    new.is_premium := old.is_premium;
    new.stripe_customer_id := old.stripe_customer_id;
    new.employer_plan := old.employer_plan;
  end if;
  return new;
end;
$$;
-- Trigger itself (protect_premium_fields_trigger) already exists and calls
-- this function — re-running create or replace function is enough, no need
-- to recreate the trigger.
