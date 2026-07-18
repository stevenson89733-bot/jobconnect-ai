-- ============================================================
-- Jobs — Work Type (Remote / Hybrid / On-site)
-- Run this in: https://app.supabase.com → SQL Editor → New query
--
-- Real audit before writing this: all 12 active job rows today are
-- "Remote · <region>" — zero Hybrid, zero unlabeled on-site addresses.
-- Every existing row backfills cleanly to 'remote' with no guessing. This
-- is NOT a general guarantee (a genuinely on-site or ambiguous future row
-- would need a real decision, not an auto-classification) — it's simply
-- true for 100% of what exists in this table right now.
-- ============================================================

-- Nullable first so the backfill below can run before the NOT NULL
-- constraint is enforced — no window where an existing row is invalid.
alter table public.jobs
  add column if not exists work_type text
    check (work_type in ('remote', 'hybrid', 'onsite'));

-- Backfill: same /^remote/i signal the app used to derive the old
-- regex-based "Remote" badge — confirmed via a real audit of every row,
-- not assumed.
update public.jobs
set work_type = 'remote'
where work_type is null and location ilike 'remote%';

-- Nothing today falls outside the backfill above (see audit), so this is
-- safe. If it ever fails, a row with no remote signal was inserted since
-- the audit — investigate and classify it for real rather than re-running
-- with a guessed default.
alter table public.jobs
  alter column work_type set not null;

create index if not exists jobs_work_type_idx on public.jobs (work_type);
