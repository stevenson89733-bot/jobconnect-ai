-- ============================================================
-- Company Profile — lot 3: Culture / AI Summary cache.
-- Run this in: https://app.supabase.com → SQL Editor → New query
--
-- A dedicated cache table, not an extension of `companies` — most
-- companies shown on Company Profile pages have no row in `companies`
-- today (it's mostly empty; company_name is denormalized onto `jobs`
-- instead), so caching here avoids needing to upsert a companies row
-- just to hold AI-summary metadata for a name that may not be a "real"
-- company entity in that table's sense.
--
-- found=false rows are cached too (with summary/sources left null) so an
-- obscure/misspelled company doesn't re-hit Tavily on every page view
-- either — same "no fabrication" discipline: a cached miss still shows
-- the honest empty state, never synthesized filler.
-- ============================================================

create table if not exists public.company_profile_summaries (
  company_name  text primary key,
  found         boolean not null,
  summary       text,
  sources       jsonb not null default '[]',
  generated_at  timestamptz not null default now()
);

create unique index if not exists company_profile_summaries_lower_name_idx
  on public.company_profile_summaries (lower(company_name));

alter table public.company_profile_summaries enable row level security;

-- Public read — this is synthesized-from-public-web-search content, not
-- user data, so anyone can read a cached entry.
drop policy if exists "anyone can read cached summaries" on public.company_profile_summaries;
create policy "anyone can read cached summaries"
  on public.company_profile_summaries for select
  using (true);

-- No insert/update policy for anon/authenticated — cache writes only
-- happen server-side via the service-role client (lib/supabase/admin.ts),
-- same "last resort, documented" pattern already used elsewhere in this
-- app for system-level writes that aren't really "a user's own row".
