import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit } from '@/lib/rateLimit'
import { buildReferralUrl, isReferralRewardsEnabled } from '@/lib/referral/core'
import { getOrCreateReferralCode, getReferralStats } from '@/lib/referral/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * The caller's own referral link + verified counts. Candidates only.
 * Scoped strictly to auth.uid() — there is no way to request another user's data.
 */
export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!rateLimit(`referral-me:${user.id}`, 30, 60_000).ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single()
  if (profile?.role !== 'candidate') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const admin = createAdminClient()
    const codeRow = await getOrCreateReferralCode(admin, user.id)
    if (!codeRow || codeRow.disabled_at) {
      return NextResponse.json({ error: 'Referral unavailable' }, { status: 503 })
    }
    const stats = await getReferralStats(admin, user.id)
    return NextResponse.json({
      url: buildReferralUrl(codeRow.code),
      stats, // null → tracking unavailable; UI shows an empty state, never a fake 0
      rewardsEnabled: isReferralRewardsEnabled(),
    })
  } catch (err) {
    console.error('[referral] me failed:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Referral unavailable' }, { status: 503 })
  }
}
