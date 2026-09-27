import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { effectiveCandidatePlan } from '@/lib/adminAccess'

const PRO_GUIDES = new Set(['salary-negotiation', 'linkedin-expats', 'remote-interview'])
const ELITE_GUIDES = new Set(['international-contracts'])

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const guide = searchParams.get('guide')

  if (!guide || (!PRO_GUIDES.has(guide) && !ELITE_GUIDES.has(guide))) {
    return NextResponse.json({ error: 'Invalid guide' }, { status: 400 })
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminClient = createAdminClient()
  const { data: profile } = await adminClient
    .from('profiles')
    .select('candidate_plan, is_admin, is_premium')
    .eq('user_id', user.id)
    .single()

  const plan = effectiveCandidatePlan(profile ?? {})
  const isAdmin = !!profile?.is_admin
  const isPro = isAdmin || profile?.is_premium || ['pro', 'elite'].includes(plan)
  const isElite = isAdmin || plan === 'elite'

  const requiresElite = ELITE_GUIDES.has(guide)
  const allowed = requiresElite ? isElite : isPro
  if (!allowed) {
    return NextResponse.json({ error: 'upgrade_required' }, { status: 403 })
  }

  const { data, error } = await adminClient.storage
    .from('learn-guides')
    .createSignedUrl(`guides/${guide}.pdf`, 300)

  if (error || !data?.signedUrl) {
    console.error('[learn/download] storage error:', error?.message)
    return NextResponse.json({ error: 'File not available' }, { status: 404 })
  }

  return NextResponse.json({ url: data.signedUrl })
}
