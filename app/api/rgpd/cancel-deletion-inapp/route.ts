import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logConsent } from '@/lib/rgpd/logConsent'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/rgpd/cancel-deletion-inapp
// In-app cancellation (authenticated session) — complement to the email-link
// cancel route (/api/rgpd/cancel-deletion) which requires a token.
// Auth check replaces the token: if you're logged in as the user, you can cancel.
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const admin = createAdminClient()

  const { data, error } = await admin
    .from('deletion_requests')
    .update({ status: 'cancelled' })
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .select('id')

  if (error || !data?.length) {
    return NextResponse.json({ error: 'Aucune demande de suppression en cours' }, { status: 404 })
  }

  await logConsent(user.id, 'account_deletion_cancelled', req, { source: 'inapp' })

  return NextResponse.json({ success: true })
}
