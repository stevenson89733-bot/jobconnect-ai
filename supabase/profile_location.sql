-- ============================================================
-- JobConnect AI — Add "location" to candidate profile
-- Run this in: https://app.supabase.com → SQL Editor → New query
-- Reuses the existing public.profiles table (no new table, no RLS change).
-- ============================================================

alter table public.profiles add column if not exists location text;
