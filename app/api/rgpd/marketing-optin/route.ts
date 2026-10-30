import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logConsent } from '@/lib/rgpd/logConsent'
import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { Resend } from 'resend'

const resend  = new Resend(process.env.RESEND_API_KEY)
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://jobconnect-ai.com'

// POST /api/rgpd/marketing-optin
// Step 1 of double opt-in: generates a UUID token, stores it, and sends a
// confirmation e-mail. Does NOT set consent yet — that happens on the link click.
export async function POST(req: NextRequest) {
  // ── 1. Auth gate ──────────────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  // ── 2. Generate token and store it on the profile (admin client — see
  //       lib/rgpd/logConsent.ts for why consent_log/deletion_requests need
  //       it; here it's just used consistently for every write in this flow)
  const admin = createAdminClient()
  const token = randomUUID()

  const { data: profile, error: profileErr } = await admin
    .from('profiles')
    .update({ marketing_consent_token: token, marketing_consent_ip: req.headers.get('x-forwarded-for') })
    .eq('user_id', user.id)
    .select('email, full_name')
    .single()

  if (profileErr || !profile) {
    return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 })
  }

  // ── 3. Send confirmation e-mail ───────────────────────────────────────────
  const confirmUrl = `${APP_URL}/api/rgpd/marketing-confirm?token=${token}&uid=${user.id}`

  await resend.emails.send({
    from:    'JobConnect AI <noreply@jobconnect-ai.com>',
    to:      profile.email,
    subject: 'Confirmez votre inscription aux e-mails marketing',
    html: `
      <h2>Bonjour ${profile.full_name ?? ''},</h2>
      <p>Cliquez sur le bouton ci-dessous pour confirmer votre inscription aux e-mails marketing de JobConnect AI.</p>
      <a href="${confirmUrl}"
         style="background:#1a73e8;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin:16px 0">
        ✓ Confirmer mon inscription
      </a>
      <p style="color:#999;font-size:12px">
        Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.
        Conformément à l'Art. 7 du RGPD, votre consentement doit être libre, éclairé et explicite.
      </p>
    `,
  })

  // ── 4. Audit log ─────────────────────────────────────────────────────────
  await logConsent(user.id, 'marketing_optin_pending', req)

  return NextResponse.json({ success: true, message: 'E-mail de confirmation envoyé.' })
}
