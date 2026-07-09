-- ============================================================
-- PROPOSAL — NOT yet applied. Not strictly required for /candidates or
-- /candidate/[user_id] to work today, but recommended as a follow-up.
--
-- Current state (verified live): profiles has only an own-row SELECT policy
-- ("Users can view own profile", using auth.uid() = user_id). An anon or a
-- signed-in non-owner gets 0 rows. There is no policy letting an employer
-- read a candidate's profile.
--
-- The app works around this today via a service-role admin client
-- (lib/supabase/admin.ts), gated by an application-level check that the
-- viewer is a signed-in employer (lib/auth/requireEmployer.ts). That bypasses
-- RLS entirely — it's a temporary shortcut, not the intended end state: the
-- database currently enforces nothing here, only application code does. See
-- the TODOs at both createAdminClient() call sites
-- (app/candidates/page.tsx, app/candidate/[user_id]/page.tsx).
--
-- Applying this policy lets that read path move onto the normal
-- (cookie-based, non-admin) Supabase client, so the database itself enforces
-- the employer check as defense-in-depth — not just app code. It does not
-- replace or drop the existing own-row policy — Postgres OR's multiple
-- permissive policies for the same command, so this only ADDS an allowed case.
-- ============================================================

create policy "Employers can view candidate profiles"
  on public.profiles for select
  using (
    role = 'candidate'
    and exists (
      select 1 from public.profiles as viewer
      where viewer.user_id = auth.uid() and viewer.role = 'employer'
    )
  );
