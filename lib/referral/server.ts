import type { SupabaseClient } from '@supabase/supabase-js'
import { track } from '@vercel/analytics/server'
import {
  generateReferralCode,
  isUuid,
  isWithinAttributionWindow,
  isInReturnWindow,
  ABUSE_SAME_IP_SIGNUPS_24H,
  ABUSE_REFERRER_SIGNUPS_24H,
} from './core'

// Server-only referral logic. Every function takes the service-role admin
// client explicitly (RLS denies these tables to browsers) and is written to
// be idempotent: DB constraints + "where … is null" updates + dedupe_key
// make retries and races harmless. None of these ever throw into the caller's
// critical path — signup and match-explanation must succeed regardless.

type Admin = SupabaseClient

export type ReferralEventName =
  | 'referral_prompt_viewed'
  | 'referral_prompt_dismissed'
  | 'referral_link_copied'
  | 'referral_share_initiated'
  | 'referral_link_visited'
  | 'referral_signup_completed'
  | 'referral_user_activated'
  | 'referral_user_returned_7d'
  | 'referral_abuse_flagged'

const UNIQUE_VIOLATION = '23505'
const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Persists a funnel event (source of truth) and mirrors it to Vercel
 * Analytics. metadata must only carry non-sensitive scalars (channel, reason)
 * — never CV text, emails, passwords or tokens. A duplicate dedupe_key is a
 * silent no-op, which is what makes server-side emission idempotent.
 */
export async function recordReferralEvent(
  admin: Admin,
  e: {
    name: ReferralEventName
    userId?: string | null
    attributionId?: string | null
    visitId?: string | null
    metadata?: Record<string, string | number | boolean | null>
    dedupeKey?: string
  }
): Promise<boolean> {
  const { error } = await admin.from('referral_events').insert({
    event_name: e.name,
    user_id: e.userId ?? null,
    attribution_id: e.attributionId ?? null,
    visit_id: e.visitId ?? null,
    metadata: e.metadata ?? {},
    dedupe_key: e.dedupeKey ?? null,
  })
  if (error) {
    if (error.code !== UNIQUE_VIOLATION) console.error('[referral] event insert failed:', e.name, error.message)
    return false
  }
  // Mirror only the event name + channel/reason — no identifiers.
  const props: Record<string, string> = {}
  for (const k of ['channel', 'reason'] as const) {
    const v = e.metadata?.[k]
    if (typeof v === 'string') props[k] = v
  }
  track(e.name, props).catch(() => {})
  return true
}

/** Returns the user's code row, creating it (with collision retry) on first call. */
export async function getOrCreateReferralCode(
  admin: Admin,
  userId: string
): Promise<{ code: string; first_job_match_at: string | null; prompt_dismissed_until: string | null; disabled_at: string | null } | null> {
  const select = () =>
    admin
      .from('referral_codes')
      .select('code, first_job_match_at, prompt_dismissed_until, disabled_at')
      .eq('user_id', userId)
      .maybeSingle()

  const { data: existing } = await select()
  if (existing) return existing

  for (let attempt = 0; attempt < 5; attempt++) {
    const { error } = await admin.from('referral_codes').insert({ user_id: userId, code: generateReferralCode() })
    if (!error) break
    if (error.code !== UNIQUE_VIOLATION) {
      console.error('[referral] code insert failed:', error.message)
      return null
    }
    // Either a concurrent request created this user's row (done) or the
    // random code collided (retry with a fresh one).
    const { data: raced } = await select()
    if (raced) return raced
  }
  const { data } = await select()
  return data ?? null
}

/**
 * Called from the signUp server action for candidate signups. Reads the visit
 * id from the httpOnly cookie, re-validates everything server-side, and
 * inserts at most one attribution per referred user. Invalid / expired /
 * disabled / self referrals are ignored silently (neutral UX).
 */
export async function attributeReferralAtSignup(
  admin: Admin,
  args: { newUserId: string; visitId: string | undefined; signupIpHash: string | null; now?: Date }
): Promise<{ attributed: boolean; reason?: string }> {
  const now = args.now ?? new Date()
  const referredUserId = args.newUserId
  if (!isUuid(args.visitId)) return { attributed: false, reason: 'no_visit' }

  const { data: visit } = await admin
    .from('referral_visits')
    .select('id, code, referrer_user_id, created_at')
    .eq('id', args.visitId)
    .maybeSingle()
  if (!visit) return { attributed: false, reason: 'unknown_visit' }
  if (!isWithinAttributionWindow(visit.created_at, now)) return { attributed: false, reason: 'expired' }
  if (visit.referrer_user_id === referredUserId) return { attributed: false, reason: 'self' }

  const { data: codeRow } = await admin
    .from('referral_codes')
    .select('user_id, disabled_at')
    .eq('code', visit.code)
    .maybeSingle()
  if (!codeRow || codeRow.disabled_at || codeRow.user_id !== visit.referrer_user_id) {
    return { attributed: false, reason: 'invalid_code' }
  }

  const { data: inserted, error } = await admin
    .from('referral_attributions')
    .insert({
      referrer_user_id: visit.referrer_user_id,
      referred_user_id: referredUserId,
      code: visit.code,
      visit_id: visit.id,
      signup_ip_hash: args.signupIpHash,
    })
    .select('id')
    .single()

  if (error || !inserted) {
    // 23505 → already attributed: never overwrite. 23514 → CHECK (self).
    if (error && error.code !== UNIQUE_VIOLATION) console.error('[referral] attribution insert failed:', error.message)
    return { attributed: false, reason: error?.code === UNIQUE_VIOLATION ? 'duplicate' : 'error' }
  }

  await recordReferralEvent(admin, {
    name: 'referral_signup_completed',
    userId: referredUserId,
    attributionId: inserted.id,
    visitId: visit.id,
    dedupeKey: `signup:${referredUserId}`,
  })

  await flagIfSuspicious(admin, {
    attributionId: inserted.id,
    referrerUserId: visit.referrer_user_id,
    signupIpHash: args.signupIpHash,
    now,
  })

  return { attributed: true }
}

/** Flags (never blocks) patterns that suggest fake or farmed referrals. */
async function flagIfSuspicious(
  admin: Admin,
  a: { attributionId: string; referrerUserId: string; signupIpHash: string | null; now: Date }
) {
  try {
    const since = new Date(a.now.getTime() - DAY_MS).toISOString()
    let reason: string | null = null

    if (a.signupIpHash) {
      // Referrer acting from the same network as the "new" user.
      const { count: referrerSameIp } = await admin
        .from('referral_events')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', a.referrerUserId)
        .eq('metadata->>ip_hash', a.signupIpHash)
      if ((referrerSameIp ?? 0) > 0) reason = 'same_ip_as_referrer'

      if (!reason) {
        const { count: sameIp } = await admin
          .from('referral_attributions')
          .select('id', { count: 'exact', head: true })
          .eq('referrer_user_id', a.referrerUserId)
          .eq('signup_ip_hash', a.signupIpHash)
          .gte('registered_at', since)
        if ((sameIp ?? 0) >= ABUSE_SAME_IP_SIGNUPS_24H) reason = 'repeated_signup_ip'
      }
    }

    if (!reason) {
      const { count: velocity } = await admin
        .from('referral_attributions')
        .select('id', { count: 'exact', head: true })
        .eq('referrer_user_id', a.referrerUserId)
        .gte('registered_at', since)
      if ((velocity ?? 0) > ABUSE_REFERRER_SIGNUPS_24H) reason = 'high_velocity'
    }

    if (!reason) return

    await admin
      .from('referral_attributions')
      .update({ flagged_reason: reason, flagged_at: a.now.toISOString() })
      .eq('id', a.attributionId)
      .is('flagged_reason', null)

    await recordReferralEvent(admin, {
      name: 'referral_abuse_flagged',
      userId: a.referrerUserId,
      attributionId: a.attributionId,
      metadata: { reason },
      dedupeKey: `abuse:${a.attributionId}`,
    })
  } catch (err) {
    console.error('[referral] abuse check failed:', err instanceof Error ? err.message : err)
  }
}

/**
 * Qualifying action hook — call after a SUCCESSFUL match-explanation for a
 * candidate. Marks the user's first job match (unlocks their own invite
 * prompt) and, if they were referred, activates the attribution exactly once.
 * Returns isFirstMatch so the UI can show a one-time nudge.
 */
export async function recordFirstJobMatch(admin: Admin, userId: string): Promise<{ isFirstMatch: boolean }> {
  const nowIso = new Date().toISOString()
  let isFirstMatch = false

  const codeRow = await getOrCreateReferralCode(admin, userId)
  if (codeRow && !codeRow.first_job_match_at) {
    const { data } = await admin
      .from('referral_codes')
      .update({ first_job_match_at: nowIso })
      .eq('user_id', userId)
      .is('first_job_match_at', null)
      .select('user_id')
    isFirstMatch = (data?.length ?? 0) > 0
  }

  const { data: activated } = await admin
    .from('referral_attributions')
    .update({ activated_at: nowIso })
    .eq('referred_user_id', userId)
    .is('activated_at', null)
    .select('id')

  const attributionId = activated?.[0]?.id as string | undefined
  if (attributionId) {
    await recordReferralEvent(admin, {
      name: 'referral_user_activated',
      userId,
      attributionId,
      dedupeKey: `activated:${attributionId}`,
    })
    // Reward hook: intentionally nothing here while REFERRAL_REWARDS_ENABLED
    // is false. A future phase inserts into referral_rewards (attribution_id
    // UNIQUE guarantees at most one) only after owner approval.
  }

  return { isFirstMatch }
}

/** Records the day-7..30 return once (via /api/referral/return). Returns true if recorded now. */
export async function recordReturnVisit(admin: Admin, userId: string, now: Date = new Date()): Promise<boolean> {
  const { data: attr } = await admin
    .from('referral_attributions')
    .select('id, registered_at, returned_7d_at')
    .eq('referred_user_id', userId)
    .maybeSingle()
  if (!attr || attr.returned_7d_at || !isInReturnWindow(attr.registered_at, now)) return false

  const { data: updated } = await admin
    .from('referral_attributions')
    .update({ returned_7d_at: now.toISOString() })
    .eq('id', attr.id)
    .is('returned_7d_at', null)
    .select('id')
  if (!updated?.length) return false

  await recordReferralEvent(admin, {
    name: 'referral_user_returned_7d',
    userId,
    attributionId: attr.id,
    dedupeKey: `returned7d:${attr.id}`,
  })
  return true
}

/** Verified counts for the referrer's own dashboard — straight from the DB. */
export async function getReferralStats(admin: Admin, referrerUserId: string): Promise<{ registered: number; activated: number } | null> {
  const [reg, act] = await Promise.all([
    admin.from('referral_attributions').select('id', { count: 'exact', head: true }).eq('referrer_user_id', referrerUserId),
    admin
      .from('referral_attributions')
      .select('id', { count: 'exact', head: true })
      .eq('referrer_user_id', referrerUserId)
      .not('activated_at', 'is', null),
  ])
  if (reg.error || act.error) return null
  return { registered: reg.count ?? 0, activated: act.count ?? 0 }
}
