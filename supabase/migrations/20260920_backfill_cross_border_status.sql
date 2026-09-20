-- One-time backfill: mark obvious remote/worldwide jobs as cross-border friendly
-- when the AI classifier has not yet run on them (cross_border_status IS NULL).
-- This ensures the international filter shows results immediately,
-- before the nightly GPT-4o-mini classifier processes existing listings.
UPDATE public.jobs
SET cross_border_status = 'yes'
WHERE cross_border_status IS NULL
  AND (
    description ILIKE '%remote%'
    OR description ILIKE '%worldwide%'
    OR description ILIKE '%visa sponsor%'
    OR description ILIKE '%work from anywhere%'
    OR location    ILIKE '%remote%'
    OR location    ILIKE '%worldwide%'
    OR location    ILIKE '%anywhere%'
  );
