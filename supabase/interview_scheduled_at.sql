-- Interview date/time slot — extends the EXISTING interview-invitation row
-- on public.applications (the same row that carries status='interview' and
-- initiated_by_employer, see supabase/employer_interview_invite.sql). No
-- parallel table: the slot belongs to a specific (job, candidate)
-- application, which is exactly what this row already is.
--
-- Two columns, both nullable (the slot is optional — an employer can invite
-- to interview now and set the time later; every existing row therefore
-- stays valid with NULL, rendered as an explicit "date to be confirmed"
-- state client-side, never a blank or an Invalid Date):
--
--   scheduled_at        — the instant itself, stored in UTC (timestamptz),
--                         same convention as created_at/status_updated_at.
--   scheduled_timezone  — the IANA zone the employer actually chose when
--                         scheduling (e.g. 'Asia/Ho_Chi_Minh'). Needed
--                         because no per-user timezone exists anywhere in
--                         this project: profiles.location is free text, the
--                         country cookie drives currency display only, and
--                         there is no timezone column on profiles. Without
--                         this, the slot could still be converted to each
--                         viewer's local zone, but we could never honestly
--                         label which zone it was originally set in.
--
-- No new RLS policy needed: the existing employer_update_status (UPDATE) and
-- employer_insert_interview_invite (INSERT) policies already scope writes to
-- the employer who owns the job, and candidates_select_own /
-- employer_view already cover reads of these columns.

alter table public.applications
  add column if not exists scheduled_at timestamptz,
  add column if not exists scheduled_timezone text;
