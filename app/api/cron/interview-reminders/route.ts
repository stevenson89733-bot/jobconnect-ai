export const maxDuration = 60

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendInterviewReminder24h, sendInterviewReminder2h } from '@/lib/email/resend'

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const now = new Date()

  let sent24h = 0
  let sent2h = 0

  // 24h window: scheduled_at between now+23h and now+25h
  const window24hFrom = new Date(now.getTime() + 23 * 60 * 60 * 1000).toISOString()
  const window24hTo   = new Date(now.getTime() + 25 * 60 * 60 * 1000).toISOString()

  const { data: rows24h, error: err24h } = await supabase
    .from('applications')
    .select('id, candidate_id, job_id, scheduled_at, scheduled_timezone')
    .eq('reminder_24h_sent', false)
    .not('scheduled_at', 'is', null)
    .gte('scheduled_at', window24hFrom)
    .lte('scheduled_at', window24hTo)

  if (err24h) console.error('[interview-reminders/24h]', err24h.message)

  for (const row of rows24h ?? []) {
    const { profile, job, employerProfile } = await fetchRelated(supabase, row.candidate_id, row.job_id)
    if (!profile?.email || !job?.title) continue

    const interviewDate = formatDate(row.scheduled_at, row.scheduled_timezone)
    const meetingLink = employerProfile?.meeting_link ?? 'https://jobconnect-ai.com'

    const result = await sendInterviewReminder24h({
      to: profile.email,
      candidateName: profile.full_name?.split(' ')[0] ?? profile.full_name ?? 'Candidat',
      jobTitle: job.title,
      companyName: job.company_name ?? employerProfile?.company_name ?? '',
      interviewDate,
      meetingLink,
    })

    if (result.success) {
      await supabase.from('applications').update({ reminder_24h_sent: true }).eq('id', row.id)
      sent24h++
    } else {
      console.error('[interview-reminders/24h] send failed:', result.error)
    }
  }

  // 2h window: scheduled_at between now+1h and now+3h
  const window2hFrom = new Date(now.getTime() + 1 * 60 * 60 * 1000).toISOString()
  const window2hTo   = new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString()

  const { data: rows2h, error: err2h } = await supabase
    .from('applications')
    .select('id, candidate_id, job_id, scheduled_at, scheduled_timezone')
    .eq('reminder_2h_sent', false)
    .not('scheduled_at', 'is', null)
    .gte('scheduled_at', window2hFrom)
    .lte('scheduled_at', window2hTo)

  if (err2h) console.error('[interview-reminders/2h]', err2h.message)

  for (const row of rows2h ?? []) {
    const { profile, job, employerProfile } = await fetchRelated(supabase, row.candidate_id, row.job_id)
    if (!profile?.email || !job?.title) continue

    const interviewDate = formatDate(row.scheduled_at, row.scheduled_timezone)
    const meetingLink = employerProfile?.meeting_link ?? 'https://jobconnect-ai.com'

    const result = await sendInterviewReminder2h({
      to: profile.email,
      candidateName: profile.full_name?.split(' ')[0] ?? profile.full_name ?? 'Candidat',
      jobTitle: job.title,
      companyName: job.company_name ?? employerProfile?.company_name ?? '',
      interviewDate,
      meetingLink,
    })

    if (result.success) {
      await supabase.from('applications').update({ reminder_2h_sent: true }).eq('id', row.id)
      sent2h++
    } else {
      console.error('[interview-reminders/2h] send failed:', result.error)
    }
  }

  return NextResponse.json({ success: true, sent_24h: sent24h, sent_2h: sent2h })
}

async function fetchRelated(
  supabase: ReturnType<typeof createAdminClient>,
  candidateId: string,
  jobId: string,
) {
  const [{ data: profile }, { data: job }] = await Promise.all([
    supabase.from('profiles').select('full_name, email').eq('user_id', candidateId).single(),
    supabase.from('jobs').select('title, company_name, posted_by').eq('id', jobId).single(),
  ])

  let employerProfile: { meeting_link: string | null; company_name: string | null } | null = null
  if (job?.posted_by) {
    const { data } = await supabase
      .from('profiles')
      .select('meeting_link, company_name')
      .eq('user_id', job.posted_by)
      .single()
    employerProfile = data
  }

  return { profile, job, employerProfile }
}

function formatDate(scheduledAt: string, timezone: string | null): string {
  try {
    const date = new Date(scheduledAt)
    const tz = timezone ?? 'UTC'
    const opts: Intl.DateTimeFormatOptions = {
      timeZone: tz,
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
    return new Intl.DateTimeFormat('fr-FR', opts).format(date).replace(':', 'h')
  } catch {
    return scheduledAt
  }
}
