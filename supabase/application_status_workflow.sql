-- ============================================================
-- Employer Application Status Workflow.
-- Run this in: https://app.supabase.com → SQL Editor → New query
--
-- Real, constrained status lifecycle:
--   submitted → viewed → interview → offer
--                      ↘ interview ↘
--                        rejected (reachable from submitted/viewed/interview)
--
-- Before this, applications.status was unconstrained plain text with no
-- write path at all — every row sat at 'submitted' forever (confirmed by
-- audit). This also closes a real RLS gap found while building this: the
-- old "candidates_own" policy used `for all`, which let a candidate UPDATE
-- their own application row — including status — with nothing stopping
-- them from setting it to 'offer' themselves via a direct API call.
-- ============================================================

-- 1. Real, constrained status values.
alter table public.applications
  add constraint applications_status_check
  check (status in ('submitted', 'viewed', 'interview', 'offer', 'rejected'));

-- 2. When the status last changed — enough for "Viewed 3 days ago" without
-- a full history table.
alter table public.applications
  add column if not exists status_updated_at timestamptz;

-- Set automatically by a trigger (not app code) so it's always correct
-- regardless of which code path updates status.
create or replace function public.set_application_status_updated_at()
returns trigger
language plpgsql
as $$
begin
  if new.status is distinct from old.status then
    new.status_updated_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists applications_status_updated_at_trigger on public.applications;
create trigger applications_status_updated_at_trigger
  before update on public.applications
  for each row
  execute function public.set_application_status_updated_at();

-- 3. RLS — replace the old "for all" candidate policy (which allowed a
-- candidate to update their OWN status) with narrower select/insert/
-- delete-only policies, then add a genuinely new employer update policy
-- scoped to jobs they actually posted.
drop policy if exists "candidates_own" on public.applications;

create policy "candidates_select_own" on public.applications
  for select using (auth.uid() = candidate_id);

create policy "candidates_insert_own" on public.applications
  for insert with check (auth.uid() = candidate_id);

create policy "candidates_delete_own" on public.applications
  for delete using (auth.uid() = candidate_id);

create policy "employer_update_status" on public.applications
  for update
  using (
    exists (select 1 from jobs where jobs.id = applications.job_id and jobs.posted_by = auth.uid())
  )
  with check (
    exists (select 1 from jobs where jobs.id = applications.job_id and jobs.posted_by = auth.uid())
  );
