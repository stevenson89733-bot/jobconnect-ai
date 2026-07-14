-- ============================================================
-- Employee Reviews — lot 1 (foundation).
-- Run this in: https://app.supabase.com → SQL Editor → New query
--
-- Adds:
--   1. profiles.is_admin — minimal admin flag (no admin role system exists
--      yet; this is the smallest viable addition, flagged and confirmed
--      with the user before writing this). Follow-up: after running, flip
--      it to true for your own account with a separate, explicit UPDATE —
--      not done automatically here.
--   2. public.is_admin(uid) — SECURITY DEFINER helper, same pattern as
--      public.is_employer() in fix_employer_read_recursion.sql. Required
--      because an admin-moderation RLS policy on company_reviews needs to
--      check profiles.is_admin, and any policy that reads a DIFFERENT
--      table than the one it protects is fine directly — but we still use
--      the definer-function pattern for consistency and because it's also
--      reused by the profiles-side admin checks a future lot may add.
--   3. public.company_reviews — the review rows themselves.
--   4. public.company_reviews_public — a SECURITY DEFINER view exposing
--      ONLY approved reviews, WITHOUT candidate_id. This is the actual
--      anonymity enforcement: the public/anon Supabase role has no RLS
--      policy granting it any access to the base table at all, so the
--      only way anon can read reviews is through this view — and the view
--      simply never selects candidate_id, so there is no code path,
--      client-side or server-side, through which a public query can ever
--      see who wrote a review. That's enforced by Postgres, not by
--      frontend convention.
-- ============================================================

-- 1. Admin flag
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- 2. Admin-check helper (SECURITY DEFINER — bypasses RLS for its own
-- internal lookup, same reasoning as public.is_employer()).
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select is_admin from public.profiles where user_id = uid),
    false
  );
$$;

-- 3. Reviews table
create table if not exists public.company_reviews (
  id            uuid primary key default gen_random_uuid(),
  candidate_id  uuid not null references auth.users(id) on delete cascade,
  company_name  text not null,
  rating        integer not null check (rating between 1 and 5),
  review_text   text not null check (char_length(trim(review_text)) > 0),
  status        text not null default 'pending'
                  check (status in ('pending', 'approved', 'rejected')),
  created_at    timestamptz not null default now(),
  moderated_at  timestamptz,
  moderated_by  uuid references auth.users(id),
  -- One review per candidate per company.
  unique (candidate_id, company_name)
);

create index if not exists company_reviews_company_name_idx
  on public.company_reviews (company_name);
create index if not exists company_reviews_status_idx
  on public.company_reviews (status);

alter table public.company_reviews enable row level security;

-- Candidates can submit their own review — but ONLY if they have a real
-- application on record for a job at that company. This is enforced here,
-- server-side at the database level, not just in the UI/API route: even a
-- direct API call bypassing the app's own eligibility check would still be
-- rejected by Postgres.
drop policy if exists "candidates can submit eligible reviews" on public.company_reviews;
create policy "candidates can submit eligible reviews"
  on public.company_reviews for insert
  to authenticated
  with check (
    candidate_id = auth.uid()
    and exists (
      select 1
      from public.applications a
      join public.jobs j on j.id = a.job_id
      where a.candidate_id = auth.uid()
        and j.company_name ilike company_reviews.company_name
    )
  );

-- Candidates can read their own review (any status) — so the UI can show
-- "your review is pending/approved/rejected" instead of the submit form.
drop policy if exists "candidates can read own reviews" on public.company_reviews;
create policy "candidates can read own reviews"
  on public.company_reviews for select
  to authenticated
  using (candidate_id = auth.uid());

-- Admins can read every review (any status) for the moderation queue.
drop policy if exists "admins can read all reviews" on public.company_reviews;
create policy "admins can read all reviews"
  on public.company_reviews for select
  to authenticated
  using (public.is_admin(auth.uid()));

-- Admins can approve/reject (update status + moderation metadata).
-- Deliberately no delete policy for anyone, including admins — rejected
-- reviews are kept for record, never deleted, per spec.
drop policy if exists "admins can moderate reviews" on public.company_reviews;
create policy "admins can moderate reviews"
  on public.company_reviews for update
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- No policy at all for the `anon` role on the base table — anonymous/public
-- reads are only possible through the view below. This means even a
-- misconfigured future policy change on this table can't accidentally leak
-- candidate_id to the public, since anon simply has zero grants on the base
-- table to begin with.

-- 4. Public read view — approved reviews only, no candidate_id.
create or replace view public.company_reviews_public
  with (security_invoker = false)
as
  select id, company_name, rating, review_text, created_at
  from public.company_reviews
  where status = 'approved';

grant select on public.company_reviews_public to anon, authenticated;
