-- Geo-compliance analysis stored as JSONB per job.
-- Populated at insert time by lib/ai/geoAnalysis.ts via GPT-4o-mini.
-- Shape: { classification, has_tax_restriction, eor_contractor_friendly, confidence_score, notes }
-- Run in: https://app.supabase.com → SQL Editor → New query

alter table public.jobs
  add column if not exists geo_analysis jsonb;

-- Index on classification for the "True Remote" filter
create index if not exists jobs_geo_classification_idx
  on public.jobs ((geo_analysis->>'classification'));
