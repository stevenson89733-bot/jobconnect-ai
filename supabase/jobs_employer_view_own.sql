-- ============================================================
-- Employers can view their OWN jobs regardless of is_active.
-- Run this in: https://app.supabase.com → SQL Editor → New query
--
-- Found while fixing the fabricated /recruiter dashboard data: the only
-- existing SELECT policy on public.jobs is "Public can view active jobs"
-- (is_active = true). That's correct for public/candidate-facing browsing,
-- but it also means an employer's OWN inactive/paused job postings are
-- invisible to them via RLS — a real gap, not just a UI oversight. This
-- adds a second, additive SELECT policy (Postgres OR-combines multiple
-- permissive policies for the same command) scoped to the employer's own
-- rows, same pattern as the existing update/delete policies on this table.
-- ============================================================

create policy "Employers can view own jobs"
  on public.jobs for select
  using (auth.uid() = posted_by);
