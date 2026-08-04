-- Employer profile editing — company_name already exists on profiles but is
-- only ever written once, at signup (app/actions/auth.ts), with no edit
-- path anywhere. These two are net-new, additive columns; no RLS change
-- needed (the existing "Users can update own profile" / auth.uid() =
-- user_id policy already covers them, and the protect_premium_fields
-- trigger only guards is_premium/stripe_customer_id, untouched here).
--
-- Deliberately NOT resurrecting the separate `companies` table (jobs.sql):
-- it has no INSERT/UPDATE RLS policy, no writer anywhere in the codebase,
-- and no link column back to profiles.user_id — company_name as free text
-- on profiles/jobs is already the real source of truth everywhere else
-- (see app/companies/[name]/page.tsx, which matches by company_name text,
-- not company_id).
alter table public.profiles
  add column if not exists company_website text,
  add column if not exists company_description text;
