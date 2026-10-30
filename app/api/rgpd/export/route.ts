import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logConsent } from '@/lib/rgpd/logConsent'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/rgpd/export
// Data portability (Art. 20 RGPD) — returns all personal data as a JSON file.
export async function GET(req: NextRequest) {
  // ── 1. Auth gate ──────────────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  // ── 2. Fetch all user data ────────────────────────────────────────────────
  // consent_log is deny-all → admin client required.
  const admin = createAdminClient()

  const [profile, applications, consents] = await Promise.all([
    admin.from('profiles').select('*').eq('user_id', user.id).single(),
    admin.from('applications').select('*').eq('candidate_id', user.id),
    admin.from('consent_log')
         .select('event_type, occurred_at, metadata')
         .eq('user_id', user.id)
         .order('occurred_at', { ascending: false }),
  ])

  // ── 3. Audit log ─────────────────────────────────────────────────────────
  await logConsent(user.id, 'data_export_requested', req)

  // ── 4. Return JSON attachment ──────────────────────────────────────────────
  const exportData = {
    export_generated_at: new Date().toISOString(),
    format_version:      '1.0',
    responsable:         'SJL Technologies LLC — contact@sjltechnologies.com',
    rgpd_reference:      'Art. 20 RGPD — Droit à la portabilité',
    profile:             profile.data,
    applications:        applications.data ?? [],
    consent_history:     consents.data ?? [],
  }

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type':        'application/json',
      'Content-Disposition': `attachment; filename="jobconnect-data-export-${user.id}-${Date.now()}.json"`,
    },
  })
}
