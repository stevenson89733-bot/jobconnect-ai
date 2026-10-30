import { createAdminClient } from '@/lib/supabase/admin'
import { logConsent } from '@/lib/rgpd/logConsent'
import { NextRequest, NextResponse } from 'next/server'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://jobconnect-ai.com'

// GET /api/rgpd/cancel-deletion?token=xxx&uid=yyy
// E-mail link click — no session required.
// Security model: the UUID cancellation_token is unguessable; matching it
// against uid + status='pending' is the authorization check.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')
  const uid   = searchParams.get('uid')

  if (!token || !uid) {
    return NextResponse.redirect(`${APP_URL}/error?msg=lien-invalide`)
  }

  // deletion_requests is deny-all → admin client required.
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('deletion_requests')
    .update({ status: 'cancelled' })
    .eq('user_id', uid)
    .eq('cancellation_token', token)
    .eq('status', 'pending')
    .select('id')

  if (error || !data?.length) {
    return NextResponse.redirect(`${APP_URL}/error?msg=annulation-impossible`)
  }

  await logConsent(uid, 'account_deletion_cancelled', req)

  return NextResponse.redirect(`${APP_URL}/settings?msg=suppression-annulee`)
}
