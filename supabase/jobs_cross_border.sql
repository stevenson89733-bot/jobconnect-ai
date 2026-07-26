-- ============================================================
-- Jobs — Cross-Border Remote-Friendly Detector
-- Run this in: https://app.supabase.com → SQL Editor → New query
--
-- Adds a 3-value status rather than a boolean: forcing yes/no would mean
-- guessing whenever a description says nothing specific about geography
-- (the common case) — same anti-fabrication discipline as the rest of this
-- project (lib/ai/resumeGuard.ts, company_profile_summaries's found=false,
-- ConvertedSalary's USD-only fallback).
--
--   null    = not yet classified (only ever true for work_type='remote'
--             jobs created before this migration ran, until the batch
--             script or a future edit re-runs classification)
--   'yes'   = description explicitly signals open-to-anyone-worldwide
--   'no'    = description explicitly restricts by geography/visa/timezone
--   'unclear' = no clear signal either way — the honest default for most
--             listings, NOT a rare edge case
--
-- cross_border_reason is an internal-only field (never shown to
-- candidates in this V1) — the 1-sentence rationale the model gave, kept
-- for auditing classification quality, not for display.
-- ============================================================

alter table public.jobs
  add column if not exists cross_border_status text
    check (cross_border_status in ('yes', 'no', 'unclear')),
  add column if not exists cross_border_reason text;

create index if not exists jobs_cross_border_status_idx
  on public.jobs (cross_border_status);
