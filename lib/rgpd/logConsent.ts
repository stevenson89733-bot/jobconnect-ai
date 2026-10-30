import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest } from 'next/server'

/**
 * Immutable audit log for all RGPD consent events.
 * consent_log has RLS enabled with deny-all — must use the admin client.
 * Authorization is enforced upstream (auth.getUser() in the calling route).
 */
export async function logConsent(
  userId: string,
  eventType: string,
  req: NextRequest,
  metadata: Record<string, unknown> = {}
) {
  const admin = createAdminClient()
  await admin.from('consent_log').insert({
    user_id:    userId,
    event_type: eventType,
    ip_address: req.headers.get('x-forwarded-for') ?? null,
    user_agent: req.headers.get('user-agent') ?? null,
    metadata,
  })
}
