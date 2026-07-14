-- ============================================================
-- Employee Reviews — lot 2: Interview Difficulty.
-- Run this in: https://app.supabase.com → SQL Editor → New query
--
-- Extends the existing company_reviews table/RLS/view from
-- supabase/reviews.sql — no new table, no RLS policy changes needed. The
-- existing insert/select/update policies are row-level, not column-level,
-- so they automatically cover this new column with no changes. The only
-- thing that needs updating is company_reviews_public, since it explicitly
-- lists which columns are exposed (that's also how it keeps candidate_id
-- out — an explicit column list, not `select *`).
-- ============================================================

-- Optional 1-5 rating — nullable because a candidate may not have gone
-- through an interview, or may simply choose not to rate it. Same
-- 1-5 bounds as `rating`.
alter table public.company_reviews
  add column if not exists interview_difficulty smallint
    check (interview_difficulty is null or interview_difficulty between 1 and 5);

-- Recreate the public view to also expose interview_difficulty — same
-- anonymity guarantees as before: still no candidate_id, still filtered to
-- status = 'approved' only. Postgres requires dropping first since we're
-- changing the view's column list (create or replace can't do that).
drop view if exists public.company_reviews_public;

create view public.company_reviews_public
  with (security_invoker = false)
as
  select id, company_name, rating, review_text, interview_difficulty, created_at
  from public.company_reviews
  where status = 'approved';

grant select on public.company_reviews_public to anon, authenticated;
