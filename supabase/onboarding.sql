-- Onboarding fields for candidates
-- Run this in the Supabase SQL editor or via migration tooling

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS target_countries     text[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS job_category         text;

-- Index for quickly finding users who haven't completed onboarding
CREATE INDEX IF NOT EXISTS profiles_onboarding_idx
  ON public.profiles (onboarding_completed)
  WHERE onboarding_completed = false;
