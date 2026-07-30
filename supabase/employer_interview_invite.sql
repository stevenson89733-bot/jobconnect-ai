-- Lets an employer mark a candidate "in interview" directly from the
-- /candidates directory, for one of their own real, active job postings —
-- not a new "interview without a job" concept, since applications.job_id
-- is NOT NULL with a real FK (confirmed before writing this).
--
-- Two additions:
-- 1. initiated_by_employer: distinguishes a real candidate-submitted
--    application from one an employer created on the candidate's behalf via
--    this shortcut. Default false everywhere — never retroactively applied
--    to existing rows. The candidate's own Application Tracker / Recent
--    Applications widget use this to say "Invited by employer" instead of
--    implying the candidate applied when they didn't.
-- 2. employer_insert_interview_invite: employers have no INSERT policy on
--    applications today (only candidates_insert_own, auth.uid() =
--    candidate_id) — this adds one scoped to the employer's own job,
--    mirroring the existing employer_update_status ownership check exactly.

alter table public.applications
  add column if not exists initiated_by_employer boolean not null default false;

create policy "employer_insert_interview_invite" on public.applications
  for insert
  with check (
    exists (select 1 from jobs where jobs.id = applications.job_id and jobs.posted_by = auth.uid())
  );
