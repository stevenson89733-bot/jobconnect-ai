-- ============================================================
-- Candidate Profile redesign — Projects / Certificates / Languages
-- Run this in: https://app.supabase.com → SQL Editor → New query
--
-- Added as jsonb columns on the existing profiles row rather than new
-- tables: Experience/Education/Bio are already unstructured single-column
-- text on this same row, so these are a structured upgrade of that same
-- pattern (list of records instead of free text), not a new access-control
-- surface — the existing profiles RLS (auth.uid() = user_id) already
-- covers reading/writing them with no new policies needed. A separate
-- table per list would only be worth the extra RLS/joins if these needed
-- independent querying (e.g. "find all candidates with X certificate"),
-- which isn't a requirement here.
-- ============================================================

alter table public.profiles
  add column if not exists projects jsonb not null default '[]'::jsonb,
  add column if not exists certificates jsonb not null default '[]'::jsonb,
  add column if not exists languages jsonb not null default '[]'::jsonb;
