-- ============================================================
-- JobConnect AI — Profile enrichment fields (avatar + structured fields)
-- Run this in: https://app.supabase.com → SQL Editor → New query
-- Reuses the existing public.profiles table (no new table, no RLS change —
-- existing own-row + employer-read policies already cover these columns).
--
-- Note: linkedin_url already exists (see profile_fields.sql) — not re-added.
-- ============================================================

alter table public.profiles add column if not exists avatar_url       text;
alter table public.profiles add column if not exists years_experience integer;
alter table public.profiles add column if not exists phone            text;
alter table public.profiles add column if not exists portfolio_url    text;
alter table public.profiles add column if not exists availability     text;
alter table public.profiles add column if not exists work_preference  text;
