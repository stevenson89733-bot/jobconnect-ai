export const maxDuration = 60

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendInterviewScheduleReminder1h } from '@/lib/email/resend'

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const now = new Date()

  // 1h window: scheduled_at between now+50min and now+70min
  const windowFrom = new Date(now.getTime() + 50 * 60 * 1000).toISOString()
  const windowTo = new Date(now.getTime() + 70 * 60 * 1000).toISOString()

  const { data: rows, error } = await supabase
    .from('interview_schedules')
    .select('id, candidate_id, job_id, scheduled_at')
    .eq('status', 'scheduled')
    .eq('reminder_1h_sent', false)
    .gte('scheduled_at', windowFrom)
    .lte('scheduled_at', windowTo)

  if (error) console.error('[interview-reminder-1h]', error.message)

  let sent = 0

  for (const row of rows ?? []) {
    const { profile, job } = await fetchRelated(supabase, row.candidate_id, row.job_id)
    if (!profile?.email || !job?.title) continue

    const interviewDateTime = formatDateTime(row.scheduled_at)

    const result = await sendInterviewScheduleReminder1h({
      to: profile.email,
      candidateName: profile.full_name?.split(' ')[0] ?? profile.full_name ?? 'there',
      jobTitle: job.title,
      interviewDateTime,
    })

    if (result.success) {
      await supabase.from('interview_schedules').update({ reminder_1h_sent: true }).eq('id', row.id)
      await supabase.from('notifications').insert({
        user_id: row.candidate_id,
        type: 'interview_reminder',
        message: `Reminder: your interview for "${job.title}" starts in 1 hour (${interviewDateTime}).`,
        read: false,
      })
      sent++
    } else {
      console.error('[interview-reminder-1h] send failed:', result.error)
    }
  }

  return NextResponse.json({ success: true, sent })
}

async function fetchRelated(
  supabase: ReturnType<typeof createAdminClient>,
  candidateId: string,
  jobId: string,
) {
  const [{ data: profile }, { data: job }] = await Promise.all([
    supabase.from('profiles').select('full_name, email').eq('user_id', candidateId).single(),
    supabase.from('jobs').select('title').eq('id', jobId).single(),
  ])
  return { profile, job }
}

function formatDateTime(scheduledAt: string): string {
  try {
    const date = new Date(scheduledAt)
    const opts: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    }
    return new Intl.DateTimeFormat('en-US', opts).format(date)
  } catch {
    return scheduledAt
  }
}
