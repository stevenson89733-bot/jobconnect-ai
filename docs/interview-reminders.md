# Interview Reminders (interview_schedules)

Two new cron routes send English-language email reminders for the
`interview_schedules` table, separate from the pre-existing French
`applications`-based reminder system at `app/api/cron/interview-reminders/route.ts`.

- `app/api/cron/interview-reminder-24h/route.ts` — window: `interview_date` between now+23h and now+25h, dedup via `reminder_24h_sent`.
- `app/api/cron/interview-reminder-1h/route.ts` — window: `interview_date` between now+50min and now+70min, dedup via `reminder_2h_sent` (table has no separate `reminder_1h_sent` column).

Both require `Authorization: Bearer {CRON_SECRET}`, use `createAdminClient()`, and log each send to `notifications` (`type: 'interview_reminder'`).

## Schema notes (confirmed against the live DB, not assumed)

- `interview_schedules.candidate_id` and `.employer_id` are foreign keys to **`profiles.id`**, not `profiles.user_id`. The initial implementation queried `profiles` by `user_id` and would have silently matched nothing — fixed in `8a7348d`.
- `notifications.user_id` is keyed on the auth user id (`profiles.user_id`), so the fix resolves the candidate's profile row first, then uses `profile.user_id` for the notification insert.
- Table uses `interview_date` (not `scheduled_at`) and has no `status` column — confirmed live via `information_schema` probing, differing from the originally assumed schema.

## Live verification (2026-10-31)

Performed by hitting the real production endpoints with the real `CRON_SECRET`, not by reading code or running tests:

- **24h route**: confirmed real send twice — once against a disposable test row (admin's own profile, cleaned up after), once against a genuine production row (real candidate, real send, correctly deduped via `reminder_24h_sent`).
- **1h route**: confirmed real send three times — once disposable (cleaned up after), twice against genuine production rows for a real candidate, each correctly deduped via its own row's `reminder_2h_sent` flag.
- **Existing `interview-reminders` route** (applications-based): confirmed live, correctly auth-gated (401 without a valid bearer token), and returns the correct response shape. Not exercised with a real send — the only `applications.scheduled_at` row in the DB is several months stale, and inserting a disposable row using another real candidate profile was declined to avoid sending to an unverified account.

All disposable test rows were deleted after verification; genuine production sends were left as-is (real reminders to real candidates).
