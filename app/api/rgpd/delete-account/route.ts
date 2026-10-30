import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logConsent } from '@/lib/rgpd/logConsent'
import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { Resend } from 'resend'

const resend  = new Resend(process.env.RESEND_API_KEY)
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://jobconnect-ai.com'

// POST /api/rgpd/delete-account
// Deferred deletion with 30-day cancellation window (Art. 17 RGPD).
export async function POST(req: NextRequest) {
  // ── 1. Auth gate ──────────────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const admin = createAdminClient()

  // ── 2. Check for existing pending request ─────────────────────────────────
  // deletion_requests is deny-all → admin client required.
  const { data: existing } = await admin
    .from('deletion_requests')
    .select('id, scheduled_for')
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .maybeSingle()

  if (existing) {
    return NextResponse.json({
      success:       false,
      message:       'Une demande de suppression est déjà en cours.',
      scheduled_for: existing.scheduled_for,
    })
  }

  // ── 3. Insert deletion request ────────────────────────────────────────────
  const cancellationToken = randomUUID()
  const scheduledFor      = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  const { data: deleteRequest } = await admin
    .from('deletion_requests')
    .insert({
      user_id:            user.id,
      scheduled_for:      scheduledFor.toISOString(),
      cancellation_token: cancellationToken,
    })
    .select('id')
    .single()

  // ── 4. Send cancellation e-mail ───────────────────────────────────────────
  const { data: profile } = await admin
    .from('profiles')
    .select('email, full_name')
    .eq('user_id', user.id)
    .single()

  if (profile?.email) {
    const cancelUrl = `${APP_URL}/api/rgpd/cancel-deletion?token=${cancellationToken}&uid=${user.id}`
    await resend.emails.send({
      from:    'JobConnect AI <noreply@jobconnect-ai.com>',
      to:      profile.email,
      subject: 'Votre demande de suppression de compte a été reçue',
      html: `
        <h2>Bonjour ${profile.full_name ?? ''},</h2>
        <p>Nous avons bien reçu votre demande de suppression de compte.</p>
        <p><strong>Votre compte et toutes vos données seront définitivement supprimés le ${scheduledFor.toLocaleDateString('fr-FR')}.</strong></p>
        <p>Si vous souhaitez annuler cette demande, cliquez sur le lien ci-dessous :</p>
        <a href="${cancelUrl}"
           style="background:#e53935;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin:16px 0">
          ✗ Annuler la suppression de mon compte
        </a>
        <p style="color:#999;font-size:12px">
          Ce lien est valable jusqu'au ${scheduledFor.toLocaleDateString('fr-FR')}.
          Conformément à l'Art. 17 du RGPD, les données anonymisées et les logs de consentement
          seront conservés pour obligation légale.
        </p>
      `,
    })
  }

  // ── 5. Audit log ─────────────────────────────────────────────────────────
  await logConsent(user.id, 'account_deletion_requested', req, {
    scheduled_for: scheduledFor.toISOString(),
    request_id:    deleteRequest?.id,
  })

  return NextResponse.json({
    success:       true,
    scheduled_for: scheduledFor,
    message:       'Un e-mail de confirmation vous a été envoyé. Vous avez 30 jours pour annuler.',
  })
}
