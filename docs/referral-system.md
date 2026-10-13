# "Share with 5" referral system

Optional referral loop: candidates share a personal link; we measure
visit → signup → first AI Job Match → 7-day return. **Rewards are off.**

## Flow

1. `?ref=CODE` on any page → `ReferralCapture` POSTs to `/api/referral/visit`.
   Rate limit 30/hour per IP. The server validates the code, stores a
   `referral_visits` row (hashed IP) — the funnel event counts one visit per
   network+code per day; >5 visits from one network+code in 24h emits
   `referral_abuse_flagged` (`visit_flood`) — and sets an
   httpOnly `jcai_ref_visit` cookie holding **only the visit id** (30 days). An
   existing valid cookie is never overwritten (first-touch). Unknown /
   disabled / malformed codes get the same neutral `{ ok: true }`.
2. Candidate signup (`app/actions/auth.ts → signUp`) reads the cookie and calls
   `attributeReferralAtSignup`: re-checks the visit is ≤ 30 days old (server clock), the
   code is active, and referrer ≠ referred, then inserts one
   `referral_attributions` row (`referred_user_id` UNIQUE). Failures are
   logged and never block signup.
3. Qualifying action = first **successful** `POST /api/ai/match-explanation`
   by a candidate → `recordFirstJobMatch`: sets `first_job_match_at`
   (unlocks the user's own invite) and sets `activated_at` once if they were
   referred.
   It is awaited, not fire-and-forget, so Vercel can't freeze the function
   before the write lands.
4. 7-day return = authenticated `/candidate` visit on day 7–30 after signup:
   the page renders `<ReturnTracker>` for referred users not yet counted, which
   POSTs `/api/referral/return`; the server re-checks the window and sets
   `returned_7d_at` once. Server renders never write referral state.

Abuse checks run at attribution time and only **flag** (`flagged_reason`):
`same_ip_as_referrer`, `repeated_signup_ip` (≥3 same-IP signups / 24h),
`high_velocity` (>10 signups / referrer / 24h).

## UI

- `ReferralCard` on `/candidate` — candidates only, after first AI Job Match.
  "Share with 5" eyebrow, link, Copy, Share (native share → WhatsApp
  fallback), "View details", X dismiss → `/api/referral/dismiss` snoozes it
  14 days. Inline, never a modal.
- One-time nudge inside the JobCard match explanation on the first match.
- `/candidate/referrals` (sidebar 🎁 "Referrals") — link, copy/native share/
  WhatsApp/LinkedIn/email, verified counts from the DB, rules. Shows an
  "unavailable" state instead of numbers when stats can't be loaded.

## Events (`referral_events` = source of truth, mirrored to Vercel Analytics)

| Event | Emitted by |
|---|---|
| `referral_prompt_viewed` (max 1/user/day) | client → `/api/referral/event` |
| `referral_prompt_dismissed` | server (`/api/referral/dismiss`) |
| `referral_link_copied` | client |
| `referral_share_initiated` (`channel`; client may send alias `referral_share_started`) | client |
| `referral_link_visited` | server (visit route) |
| `referral_signup_completed` | server (signUp) |
| `referral_user_activated` | server (match-explanation) |
| `referral_user_returned_7d` | server (`/api/referral/return`) |
| `referral_abuse_flagged` (`reason`) | server (visit + signup) |

`/api/referral/event` (20/min per user) accepts only the client events above; server events can't be
forged from the browser. Only `channel`/`reason` are sent to Vercel
Analytics — no ids, emails, hashes or CV content.

## Configuration

| Env var | Required | Default |
|---|---|---|
| `REFERRAL_REWARDS_ENABLED` | no | off (anything but `true`) — leave unset |
| `REFERRAL_IP_SALT` | recommended | falls back to the service-role key |
| `NEXT_PUBLIC_APP_URL` | existing | `https://jobconnect-ai.com` |

## Deploy / rollback

1. Migration `supabase/migrations/20261013_referral_system.sql` (already run).
2. Optionally set `REFERRAL_IP_SALT` (random 32+ chars) in Vercel → redeploy.
3. Rollback app: revert the commit — the tables are inert without the code.
   Rollback DB (deletes referral data): `20261013_referral_system_rollback.sql`.

## Verifying the funnel after deploy (Supabase SQL editor)

```sql
-- Funnel, last 30 days
select event_name, count(*) from referral_events
where created_at > now() - interval '30 days'
group by 1 order by 1;

-- Pilot quality: registrations, activation rate, 7-day return, flags
select count(*)                                   as registered,
       count(activated_at)                        as activated,
       round(100.0 * count(activated_at) / nullif(count(*), 0), 1) as activation_pct,
       count(returned_7d_at)                      as returned_7d,
       count(flagged_reason)                      as flagged
from referral_attributions;

-- Suspicious referrals to review
select referrer_user_id, flagged_reason, registered_at
from referral_attributions where flagged_reason is not null
order by registered_at desc;
```

Manual smoke test: as candidate A, generate a match explanation on `/jobs`
→ nudge appears → open `/candidate/referrals`, copy link. In a private
window open the link, sign up as candidate B → one `referral_attributions`
row. As B generate a match explanation → `activated_at` set; A's
"generated their first AI Job Match" count becomes 1.
