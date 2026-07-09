-- ============================================================
-- URGENT FIX — run this immediately.
--
-- The previously-applied "Employers can view candidate profiles" policy
-- causes infinite recursion (Postgres error 42P17), confirmed live:
--   "infinite recursion detected in policy for relation \"profiles\""
--
-- Cause: its `exists (select 1 from public.profiles as viewer ...)` subquery
-- reads from the SAME table the policy protects. Postgres must re-apply
-- profiles' RLS policies to resolve that inner subquery — which includes
-- this same policy — looping forever. Since Postgres evaluates all matching
-- policies together for any query on the table, this currently breaks EVERY
-- authenticated read of profiles, not just the employer path: login
-- redirects, /candidate, /profile, dashboards — all of it.
--
-- Fix: drop the broken policy, then recreate it using a SECURITY DEFINER
-- function. A security-definer function runs with the privileges of its
-- owner and bypasses RLS for its own internal query, so checking "is
-- auth.uid() an employer" no longer re-triggers profiles' policies. This is
-- the same pattern already used by handle_new_user() in schema.sql.
-- ============================================================

drop policy if exists "Employers can view candidate profiles" on public.profiles;

create or replace function public.is_employer(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where user_id = uid and role = 'employer'
  );
$$;

create policy "Employers can view candidate profiles"
  on public.profiles for select
  using (
    role = 'candidate'
    and public.is_employer(auth.uid())
  );
