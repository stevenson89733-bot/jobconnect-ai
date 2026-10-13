-- ============================================================
-- "Share with 5" referral system
-- Run manually in: Supabase → SQL Editor → New query
-- Idempotent: safe to re-run. Rollback: 20261013_referral_system_rollback.sql
--
-- Access model: every table has RLS enabled. Only referral_codes exposes
-- the owner's own row to the authenticated client; everything else is
-- deny-all for anon/authenticated and is read/written exclusively by
-- server routes via the service-role admin client, scoped to the caller.
-- ============================================================

begin;

-- ── 1. referral_codes — one row per candidate, created lazily ───────────────
-- code: 8 chars from an unambiguous base32 alphabet (no 0/O/1/I), random,
-- never derived from user_id. first_job_match_at doubles as the trigger
-- for showing the invite prompt (set on first successful match-explanation).
create table if not exists public.referral_codes (
  user_id                uuid primary key references auth.users (id) on delete cascade,
  code                   text not null unique
                           check (code ~ '^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{8}$'),
  first_job_match_at     timestamptz,
  prompt_dismissed_until timestamptz,
  disabled_at            timestamptz,
  created_at             timestamptz not null default now()
);

alter table public.referral_codes enable row level security;

drop policy if exists "Users can view own referral code" on public.referral_codes;
create policy "Users can view own referral code"
  on public.referral_codes for select
  using (auth.uid() = user_id);

-- ── 2. referral_visits — one row per validated ?ref= landing ────────────────
-- The httpOnly cookie stores only this row's id; the 30-day attribution
-- window is measured from created_at (server clock), never from the browser.
-- ip_hash is a salted SHA-256 — raw IPs are never stored.
create table if not exists public.referral_visits (
  id               uuid primary key default gen_random_uuid(),
  code             text not null references public.referral_codes (code) on delete cascade,
  referrer_user_id uuid not null references auth.users (id) on delete cascade,
  ip_hash          text,
  created_at       timestamptz not null default now()
);

create index if not exists referral_visits_code_created_idx
  on public.referral_visits (code, created_at desc);
create index if not exists referral_visits_ip_created_idx
  on public.referral_visits (ip_hash, created_at desc);

alter table public.referral_visits enable row level security;
-- No policies: deny-all to clients.

-- ── 3. referral_attributions — one row per referred signup ──────────────────
-- referred_user_id UNIQUE  → a user can be attributed at most once.
-- CHECK referrer <> referred → self-referral impossible at the DB level.
-- activated_at / returned_7d_at are only ever set "where … is null".
create table if not exists public.referral_attributions (
  id               uuid primary key default gen_random_uuid(),
  referrer_user_id uuid not null references auth.users (id) on delete cascade,
  referred_user_id uuid not null unique references auth.users (id) on delete cascade,
  code             text not null,
  visit_id         uuid references public.referral_visits (id) on delete set null,
  signup_ip_hash   text,
  registered_at    timestamptz not null default now(),
  activated_at     timestamptz,
  returned_7d_at   timestamptz,
  flagged_reason   text,
  flagged_at       timestamptz,
  constraint referral_no_self_referral check (referrer_user_id <> referred_user_id),
  constraint referral_activation_after_signup
    check (activated_at is null or activated_at >= registered_at),
  constraint referral_return_after_signup
    check (returned_7d_at is null or returned_7d_at >= registered_at)
  -- (the day-7..30 window itself is enforced in app code: timestamptz +
  -- interval is not IMMUTABLE, so it doesn't belong in a CHECK)
);

create index if not exists referral_attributions_referrer_idx
  on public.referral_attributions (referrer_user_id);
create index if not exists referral_attributions_signup_ip_idx
  on public.referral_attributions (signup_ip_hash, registered_at desc);

alter table public.referral_attributions enable row level security;
-- No policies: deny-all to clients. Dashboard counts are computed server-side.

-- Attribution is immutable once written: who referred whom, via which code,
-- and when cannot be changed — not even by a buggy server route.
create or replace function public.referral_attributions_immutable()
returns trigger language plpgsql as $$
begin
  if new.referrer_user_id is distinct from old.referrer_user_id
     or new.referred_user_id is distinct from old.referred_user_id
     or new.code is distinct from old.code
     or new.registered_at is distinct from old.registered_at then
    raise exception 'referral attribution core fields are immutable';
  end if;
  -- Milestones can be set once, never moved or cleared.
  if old.activated_at is not null and new.activated_at is distinct from old.activated_at then
    raise exception 'referral activated_at already set';
  end if;
  if old.returned_7d_at is not null and new.returned_7d_at is distinct from old.returned_7d_at then
    raise exception 'referral returned_7d_at already set';
  end if;
  return new;
end;
$$;

drop trigger if exists referral_attributions_immutable_trigger on public.referral_attributions;
create trigger referral_attributions_immutable_trigger
  before update on public.referral_attributions
  for each row execute procedure public.referral_attributions_immutable();

-- ── 4. referral_events — funnel source of truth (mirrored to Vercel Analytics)
-- dedupe_key UNIQUE makes server-side emission idempotent (e.g.
-- 'activated:<attribution_id>'); NULL for events that may repeat.
-- metadata is capped and must never contain CV text, passwords or tokens.
create table if not exists public.referral_events (
  id             uuid primary key default gen_random_uuid(),
  event_name     text not null check (event_name in (
                   'referral_prompt_viewed',
                   'referral_prompt_dismissed',
                   'referral_link_copied',
                   'referral_share_initiated',
                   'referral_link_visited',
                   'referral_signup_completed',
                   'referral_user_activated',
                   'referral_user_returned_7d',
                   'referral_abuse_flagged'
                 )),
  user_id        uuid references auth.users (id) on delete set null,
  attribution_id uuid references public.referral_attributions (id) on delete cascade,
  visit_id       uuid references public.referral_visits (id) on delete set null,
  metadata       jsonb not null default '{}'::jsonb
                   check (pg_column_size(metadata) <= 1024),
  dedupe_key     text unique,
  created_at     timestamptz not null default now()
);

create index if not exists referral_events_name_created_idx
  on public.referral_events (event_name, created_at desc);
create index if not exists referral_events_user_idx
  on public.referral_events (user_id);

alter table public.referral_events enable row level security;
-- No policies: deny-all to clients.

-- ── 5. referral_rewards — RESERVED, NOT USED IN THIS PHASE ──────────────────
-- Application code never writes here while REFERRAL_REWARDS_ENABLED=false.
-- attribution_id UNIQUE → at most one reward per referred user, ever.
create table if not exists public.referral_rewards (
  id               uuid primary key default gen_random_uuid(),
  attribution_id   uuid not null unique references public.referral_attributions (id) on delete cascade,
  referrer_user_id uuid not null references auth.users (id) on delete cascade,
  reward_type      text not null,
  status           text not null default 'pending'
                     check (status in ('pending', 'granted', 'revoked')),
  created_at       timestamptz not null default now(),
  granted_at       timestamptz
);

alter table public.referral_rewards enable row level security;
-- No policies: deny-all to clients.

commit;
