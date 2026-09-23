import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { effectiveCandidatePlan } from '@/lib/adminAccess'

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, is_premium, candidate_plan')
    .eq('user_id', user.id)
    .single()

  const plan = effectiveCandidatePlan(profile ?? {})
  const allowed = profile?.is_admin || profile?.is_premium || ['pro', 'elite'].includes(plan)
  if (!allowed) return NextResponse.json({ error: 'Pro plan required' }, { status: 403 })

  const { log_id } = await req.json()
  if (!log_id) return NextResponse.json({ error: 'Missing log_id' }, { status: 400 })

  // Verify ownership
  const { data: log } = await supabase
    .from('auto_apply_log')
    .select('id, user_id, job_id, cover_letter, status')
    .eq('id', log_id)
    .eq('user_id', user.id)
    .single()

  if (!log) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (log.status === 'sent') return NextResponse.json({ ok: true, already: true })

  // Mark as sent in log
  await supabase
    .from('auto_apply_log')
    .update({ status: 'sent' })
    .eq('id', log_id)
    .eq('user_id', user.id)

  // Create application record if job_id exists
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

  return NextResponse.json({ ok: true })
}
