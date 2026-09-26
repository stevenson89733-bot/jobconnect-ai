-- Track which interview reminder emails have been sent per application
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS reminder_24h_sent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS reminder_2h_sent  boolean NOT NULL DEFAULT false;
