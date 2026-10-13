import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit } from '@/lib/rateLimit'
import { recordReturnVisit } from '@/lib/referral/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * Fired by <ReturnTracker /> on /candidate. The day-7..30 window and the
 * "only once" rule are both enforced server-side in recordReturnVisit —
 * the client's own day count is only a hint for whether to call at all.
 */
export async function POST() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!rateLimit(`referral-return:${user.id}`, 5, 60_000).ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    const recorded = await recordReturnVisit(createAdminClient(), user.id)
    return NextResponse.json({ ok: true, recorded })
  } catch (err) {
    console.error('[referral] return failed:', err instanceof Error ? err.message : err)
    return NextResponse.json({ ok: false }, { status: 503 })
  }
}
