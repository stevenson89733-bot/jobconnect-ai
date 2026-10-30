import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logConsent } from '@/lib/rgpd/logConsent'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/rgpd/marketing-optout
export async function POST(req: NextRequest) {
  // ── 1. Auth gate ──────────────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  // ── 2. Clear consent fields ───────────────────────────────────────────────
  // Admin client used here to avoid any RLS ambiguity on nullable columns.
  const admin = createAdminClient()
  await admin
    .from('profiles')
    .update({
      marketing_consent_at:    null,
      marketing_consent_token: null,
      marketing_consent_ip:    null,
    })
    .eq('user_id', user.id)

  // ── 3. Audit log ─────────────────────────────────────────────────────────
  await logConsent(user.id, 'marketing_optout', req)

  return NextResponse.json({ success: true })
}
