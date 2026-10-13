import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import {
  REFERRAL_COOKIE,
  REFERRAL_COOKIE_MAX_AGE,
  ABUSE_VISITS_SAME_IP_CODE_24H,
  normalizeReferralCode,
  isUuid,
  isWithinAttributionWindow,
  hashIp,
} from '@/lib/referral/core'
import { recordReferralEvent } from '@/lib/referral/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const DAY_MS = 24 * 60 * 60 * 1000

// Always answers { ok: true } — whether the code was valid, expired, unknown
// or malformed — so the endpoint can't be used to enumerate codes and the
// visitor never sees an error (neutral UX).
const neutral = () => NextResponse.json({ ok: true })

export async function POST(req: Request) {
  const ip = getClientIp()
  if (!rateLimit(`referral-visit-ip:${ip}`, 30, 60 * 60 * 1000).ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  let code: string | null = null
  try {
    code = normalizeReferralCode((await req.json())?.code)
  } catch {
    // malformed body → treated like a malformed code
  }
  if (!code) return neutral()

  // Already-registered users can't be referred; skip all work for them.
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) return neutral()

  try {
    const admin = createAdminClient()

    const { data: codeRow } = await admin
      .from('referral_codes')
      .select('user_id, disabled_at')
      .eq('code', code)
      .maybeSingle()
    if (!codeRow || codeRow.disabled_at) return neutral()

    // First-touch: a still-valid existing attribution cookie is never overwritten.
    const existingId = cookies().get(REFERRAL_COOKIE)?.value
    if (isUuid(existingId)) {
      const { data: existing } = await admin
        .from('referral_visits')
        .select('created_at')
        .eq('id', existingId)
        .maybeSingle()
      if (existing && isWithinAttributionWindow(existing.created_at)) return neutral()
    }

    const ipHash = hashIp(ip)
    const { data: inserted, error } = await admin
      .from('referral_visits')
      .insert({ code, referrer_user_id: codeRow.user_id, ip_hash: ipHash })
      .select('id')
      .single()
    if (error || !inserted) return neutral()
    const visitId = inserted.id as string

    // Every visit is stored raw (for abuse review), but the funnel counts one
    // visit per network+code per day so refresh loops don't inflate it.
    const day = new Date().toISOString().slice(0, 10)
    await recordReferralEvent(admin, {
      name: 'referral_link_visited',
      visitId,
      dedupeKey: ipHash ? `visit:${code}:${ipHash}:${day}` : `visit:${visitId}`,
    })

    if (ipHash) {
      const { count } = await admin
        .from('referral_visits')
        .select('id', { count: 'exact', head: true })
        .eq('code', code)
        .eq('ip_hash', ipHash)
        .gte('created_at', new Date(Date.now() - DAY_MS).toISOString())
      if ((count ?? 0) > ABUSE_VISITS_SAME_IP_CODE_24H) {
        await recordReferralEvent(admin, {
          name: 'referral_abuse_flagged',
          userId: codeRow.user_id,
          visitId,
          metadata: { reason: 'visit_flood' },
          dedupeKey: `abuse-visit:${code}:${ipHash}:${day}`,
        })
      }
    }

    const res = neutral()
    res.cookies.set(REFERRAL_COOKIE, visitId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: REFERRAL_COOKIE_MAX_AGE,
    })
    return res
  } catch (err) {
    console.error('[referral] visit failed:', err instanceof Error ? err.message : err)
    return neutral()
  }
}
