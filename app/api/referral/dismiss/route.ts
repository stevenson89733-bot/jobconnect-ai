import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit } from '@/lib/rateLimit'
import { PROMPT_SNOOZE_DAYS } from '@/lib/referral/core'
import { recordReferralEvent } from '@/lib/referral/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/** "Maybe later" / X on the invite card: snoozes it for PROMPT_SNOOZE_DAYS. */
export async function POST() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!rateLimit(`referral-dismiss:${user.id}`, 10, 60_000).ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    const admin = createAdminClient()
    const until = new Date(Date.now() + PROMPT_SNOOZE_DAYS * 24 * 60 * 60 * 1000).toISOString()
    const { data } = await admin
      .from('referral_codes')
      .update({ prompt_dismissed_until: until })
      .eq('user_id', user.id)
      .select('user_id')
    if (!data?.length) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await recordReferralEvent(admin, { name: 'referral_prompt_dismissed', userId: user.id })
    return NextResponse.json({ ok: true, until })
  } catch (err) {
    console.error('[referral] dismiss failed:', err instanceof Error ? err.message : err)
    return NextResponse.json({ ok: false }, { status: 503 })
  }
}
