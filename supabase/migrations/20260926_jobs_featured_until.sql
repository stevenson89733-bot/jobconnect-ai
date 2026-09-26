-- Add featured_until to jobs for time-bounded featured listings
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS featured_until timestamptz;
