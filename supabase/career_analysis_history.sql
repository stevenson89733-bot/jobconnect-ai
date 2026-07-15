-- ============================================================
-- Career Progress — allow career_analysis history.
-- Run this in: https://app.supabase.com → SQL Editor → New query
--
-- Removes the unique(candidate_id) constraint so a new row is inserted on
-- every "Refresh Analysis" click instead of overwriting the one existing
-- row. History starts accumulating from whenever this ships — nothing is
-- backfilled, and the one existing real row (per candidate who has run it
-- before) remains as the first real data point.
--
-- career_analysis_candidate_id_key is Postgres's default auto-generated
-- name for a single-column `unique` constraint declared inline
-- (`candidate_id uuid not null unique references ...` in schema.sql) —
-- `if exists` makes this safe to re-run.
-- ============================================================

alter table public.career_analysis
  drop constraint if exists career_analysis_candidate_id_key;

-- Reads now take "most recent row" instead of relying on there being
-- exactly one — an index on (candidate_id, generated_at desc) keeps that
-- lookup and the full-history query (Analytics Dashboard) both fast as
-- history accumulates.
create index if not exists career_analysis_candidate_id_generated_at_idx
  on public.career_analysis (candidate_id, generated_at desc);
