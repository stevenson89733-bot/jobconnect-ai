import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { hashIp, isShareChannel, toClientEvent } from '@/lib/referral/core'
import { recordReferralEvent } from '@/lib/referral/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * Client-side referral interactions. Only the whitelisted events in
 * CLIENT_EVENTS are accepted — signup/activation/return/abuse are emitted
 * server-side only and can't be forged from the browser. Dismissal itself
 * (the snooze) is /api/referral/dismiss; this route only records events.
 */
export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!rateLimit(`referral-event:${user.id}`, 20, 60_000).ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  let name: NonNullable<ReturnType<typeof toClientEvent>>
  let channel: string | null = null
  try {
    const body = await req.json()
    const mapped = toClientEvent(body?.event)
    if (!mapped) throw new Error('bad event')
    name = mapped
    if (body.channel != null) {
      if (!isShareChannel(body.channel)) throw new Error('bad channel')
      channel = body.channel
    }
  } catch {
    return NextResponse.json({ error: 'Invalid event' }, { status: 400 })
  }

  try {
    const admin = createAdminClient()

    // Only users who actually own a referral code (candidates) can emit.
    const { data: codeRow } = await admin.from('referral_codes').select('user_id').eq('user_id', user.id).maybeSingle()
    if (!codeRow) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const today = new Date().toISOString().slice(0, 10)
    await recordReferralEvent(admin, {
      name,
      userId: user.id,
      // ip_hash lets the abuse check spot a referrer signing up their own
      // second account from the same network. Hashed, never raw.
      metadata: { ...(channel ? { channel } : {}), ip_hash: hashIp(getClientIp()) },
      // One "viewed" per user per day keeps the funnel denominator honest.
      dedupeKey: name === 'referral_prompt_viewed' ? `viewed:${user.id}:${today}` : undefined,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[referral] event failed:', err instanceof Error ? err.message : err)
    return NextResponse.json({ ok: false }, { status: 503 })
  }
}
