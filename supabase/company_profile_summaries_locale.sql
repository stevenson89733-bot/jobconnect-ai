-- ============================================================
-- Company Profile Summaries — add locale dimension to the cache.
-- Run this in: https://app.supabase.com → SQL Editor → New query
--
-- The cache (company_profile_summaries) is currently keyed by
-- company_name alone, so every site locale served whatever was generated
-- first — in practice always English, since the AI prompt had no
-- language instruction until now (same bug already fixed for
-- Resume/Cover Letter/Career Coach/Resume Analysis, applied here too).
--
-- The 6 real rows currently in production (Notion, Stripe, Linear,
-- Figma, Vercel, Anthropic — checked directly before writing this
-- migration) are all genuinely English content. This migration backfills
-- them to locale='en' rather than discarding or regenerating them — they
-- become the real English cache entries. Every other locale gets its own
-- row generated lazily on next real page view (same on-demand caching
-- behavior the table already has for a brand-new company today), not a
-- bulk regeneration of anything.
-- ============================================================

alter table public.company_profile_summaries
  add column if not exists locale text not null default 'en';

-- Replace the old company_name-only uniqueness with a composite
-- (company_name, locale) one — same case-sensitive-plus-case-insensitive-
-- guard pattern the table already used (a real unique constraint as the
-- upsert conflict target, plus a case-insensitive expression index to
-- catch name-casing variants).
alter table public.company_profile_summaries
  drop constraint if exists company_profile_summaries_pkey;

alter table public.company_profile_summaries
  add constraint company_profile_summaries_name_locale_key unique (company_name, locale);

drop index if exists company_profile_summaries_lower_name_idx;

create unique index if not exists company_profile_summaries_lower_name_locale_idx
  on public.company_profile_summaries (lower(company_name), locale);
