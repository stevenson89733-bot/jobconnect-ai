-- auto_apply_waitlist: enable RLS
-- Policies already existed in Supabase (created outside migrations).
-- This migration only activates enforcement.
ALTER TABLE public.auto_apply_waitlist ENABLE ROW LEVEL SECURITY;
