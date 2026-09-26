import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { effectiveCandidatePlan } from '@/lib/adminAccess'
import { detectLeverUrl, submitLeverApplication } from '@/lib/ats/lever'
import { detectAshbyUrl, submitAshbyApplication } from '@/lib/ats/ashby'

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, is_premium, candidate_plan, email, full_name, cv_url, adapted_cv_url')
    .eq('user_id', user.id)
    .single()

  const plan = effectiveCandidatePlan(profile ?? {})
  const allowed = profile?.is_admin || profile?.is_premium || ['pro', 'elite'].includes(plan)
  if (!allowed) return NextResponse.json({ error: 'Pro plan required' }, { status: 403 })

  const { log_id } = await req.json()
  if (!log_id) return NextResponse.json({ error: 'Missing log_id' }, { status: 400 })

  // Verify ownership and fetch log + job apply_url
  const { data: log } = await supabase
    .from('auto_apply_log')
    .select('id, user_id, job_id, cover_letter, status, jobs(apply_url)')
    .eq('id', log_id)
    .eq('user_id', user.id)
    .single()

  if (!log) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (log.status === 'sent') return NextResponse.json({ ok: true, already: true })

  // ATS submission
  const jobRow = Array.isArray(log.jobs) ? log.jobs[0] : log.jobs
  const applyUrl: string = (jobRow as { apply_url?: string } | null)?.apply_url ?? ''
  const candidateName = profile?.full_name ?? ''
  const candidateEmail = profile?.email ?? ''
  const cvUrl = profile?.cv_url ?? profile?.adapted_cv_url ?? ''
  const coverLetter = log.cover_letter ?? undefined

  let atsResult: { success: boolean; applicationId?: string; error?: string } | null = null
  let atsProvider: string | null = null

  if (applyUrl && detectLeverUrl(applyUrl)) {
    atsProvider = 'lever'
    const result = await submitLeverApplication(applyUrl, {
      name: candidateName,
      email: candidateEmail,
      cvUrl: cvUrl || null,
      coverLetter,
    })
    atsResult = result
  } else if (applyUrl && detectAshbyUrl(applyUrl)) {
    if (!process.env.ASHBY_API_KEY) {
      await supabase
        .from('auto_apply_log')
        .update({ status: 'skipped', ats_provider: 'ashby' })
        .eq('id', log_id)
        .eq('user_id', user.id)
      return NextResponse.json({ ok: false, reason: 'ashby_key_not_configured' })
    }
    atsProvider = 'ashby'
    atsResult = await submitAshbyApplication({
      applyUrl,
      candidateName,
      candidateEmail,
      cvUrl,
      coverLetter,
    })
  }

  if (atsResult && !atsResult.success) {
    console.error(`[auto-apply/approve] ATS submission failed provider=${atsProvider} log=${log_id}:`, atsResult.error)
    // Don't block approval — mark as sent anyway, log the ATS error
  }

  // Mark as sent
  await supabase
    .from('auto_apply_log')
    .update({
      status: 'sent',
      ats_provider: atsProvider,
      ats_application_id: atsResult?.applicationId ?? null,
    })
    .eq('id', log_id)
    .eq('user_id', user.id)

  // Create application record
  if (log.job_id) {
    await supabase
      .from('applications')
      .upsert({
        candidate_id: user.id,
        job_id: log.job_id,
        cover_letter: log.cover_letter,
        status: 'submitted',
      }, { onConflict: 'candidate_id,job_id' })
  }

  return NextResponse.json({
    ok: true,
    ats: atsProvider ? { provider: atsProvider, submitted: atsResult?.success ?? false } : null,
  })
}
