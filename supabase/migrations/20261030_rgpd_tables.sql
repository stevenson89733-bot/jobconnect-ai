-- RGPD tables: consent_log and deletion_requests
-- Access model (mirrors referral_system convention):
--   RLS enabled on both tables.
--   No policies → deny-all for anon and authenticated roles.
--   All reads/writes go through server routes via the service-role admin client,
--   scoped to the authenticated user (auth.getUser() in application code).
-- ============================================================

begin;

-- ── 1. consent_log — immutable audit trail for all RGPD events ──────────────
create table if not exists public.consent_log (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users (id) on delete cascade,
  event_type  text        not null,         -- e.g. 'marketing_optin', 'ai_consent_revoke'
  ip_address  text,
  user_agent  text,
  metadata    jsonb       not null default '{}',
  occurred_at timestamptz not null default now()
);

-- Index for efficient per-user audit queries (export route)
create index if not exists consent_log_user_occurred_idx
  on public.consent_log (user_id, occurred_at desc);

alter table public.consent_log enable row level security;
-- No policies: deny-all to anon/authenticated. Admin client only.

-- ── 2. deletion_requests — deferred deletion queue (Art. 17 RGPD) ───────────
create table if not exists public.deletion_requests (
  id                 uuid        primary key default gen_random_uuid(),
  user_id            uuid        not null references auth.users (id) on delete cascade,
  status             text        not null default 'pending'
                                   check (status in ('pending', 'cancelled', 'executed')),
  scheduled_for      timestamptz not null,
  cancellation_token uuid        not null default gen_random_uuid(),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- Only one active pending request per user
create unique index if not exists deletion_requests_user_pending_idx
  on public.deletion_requests (user_id)
  where status = 'pending';

-- Fast lookup by token (cancel-deletion route)
create index if not exists deletion_requests_token_idx
  on public.deletion_requests (cancellation_token)
  where status = 'pending';

alter table public.deletion_requests enable row level security;
-- No policies: deny-all to anon/authenticated. Admin client only.

-- ── 3. profiles columns (add if not already present) ────────────────────────
-- marketing consent
alter table public.profiles
  add column if not exists marketing_consent_at    timestamptz,
  add column if not exists marketing_consent_token uuid,
  add column if not exists marketing_consent_ip    text;

-- AI processing consent
alter table public.profiles
  add column if not exists ai_processing_consent    boolean     not null default false,
  add column if not exists ai_processing_consent_at timestamptz;

commit;
