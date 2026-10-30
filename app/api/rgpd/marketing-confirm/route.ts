import { createAdminClient } from '@/lib/supabase/admin'
import { logConsent } from '@/lib/rgpd/logConsent'
import { NextRequest, NextResponse } from 'next/server'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://jobconnect-ai.com'

// GET /api/rgpd/marketing-confirm?token=xxx&uid=yyy
// Step 2 of double opt-in — e-mail link click. No session required.
// Security model: the UUID token is unguessable; matching it against uid in
// profiles is the authorization check (same pattern as cancel-deletion).
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')
  const uid   = searchParams.get('uid')

  if (!token || !uid) {
    return NextResponse.redirect(`${APP_URL}/error?msg=lien-invalide`)
  }

  // Admin client: profiles rows are accessible via the session client for the
  // owner, but this route has no session — use admin and validate via token.
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('profiles')
    .update({
      marketing_consent_at:    new Date().toISOString(),
      marketing_consent_token: null,
    })
    .eq('user_id', uid)
    .eq('marketing_consent_token', token)
    .select('user_id')
    .single()

  if (error || !data) {
    return NextResponse.redirect(`${APP_URL}/error?msg=lien-invalide`)
  }

  await logConsent(uid, 'marketing_optin', req)

  return NextResponse.redirect(`${APP_URL}/settings?msg=marketing-confirme`)
}
