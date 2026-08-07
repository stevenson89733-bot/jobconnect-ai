-- ============================================================
-- Jobs — Cross-Border Signals column
-- Run this in: https://app.supabase.com → SQL Editor → New query
--
-- Adds cross_border_signals (jsonb, array of 2-3 short strings) to the
-- jobs table. These are the candidate-facing detail bullets shown when
-- expanding the remote-friendly badge — e.g.:
--   ["States 'work from anywhere'", "No visa sponsorship mentioned"]
--   ["Requires US work authorization"]
--   ["No geographic restriction found", "No mention of sponsorship policy"]
--
-- cross_border_reason (already present) stays as the internal 1-sentence
-- audit field. cross_border_signals is what the UI exposes to candidates.
-- ============================================================

alter table public.jobs
  add column if not exists cross_border_signals jsonb;
