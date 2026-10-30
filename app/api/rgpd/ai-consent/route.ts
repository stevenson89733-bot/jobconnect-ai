import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logConsent } from '@/lib/rgpd/logConsent'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/rgpd/ai-consent
// Body: { consent: boolean }
// Toggles AI processing consent (Art. 7 RGPD).
export async function POST(req: NextRequest) {
  // ── 1. Auth gate ──────────────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  // ── 2. Validate body ──────────────────────────────────────────────────────
  const body = await req.json().catch(() => null)
  if (!body || typeof body.consent !== 'boolean') {
    return NextResponse.json({ error: 'consent (boolean) requis' }, { status: 400 })
  }
  const { consent } = body

  // ── 3. Update profile ─────────────────────────────────────────────────────
  const admin = createAdminClient()
  await admin
    .from('profiles')
    .update({
      ai_processing_consent:    consent,
      ai_processing_consent_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)

  // ── 4. Audit log ─────────────────────────────────────────────────────────
  await logConsent(user.id, consent ? 'ai_consent_grant' : 'ai_consent_revoke', req)

  return NextResponse.json({ success: true, ai_processing_consent: consent })
}
