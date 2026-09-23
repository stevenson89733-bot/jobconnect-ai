export const maxDuration = 10

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { DAILY_LIMIT } from '@/lib/autoApplyGuardrails'
import { effectiveCandidatePlan } from '@/lib/adminAccess'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  let processedUsers = 0
  let totalQueued = 0

  try {
    // 1. Active auto-apply users
    const { data: settings, error: settingsError } = await supabase
      .from('auto_apply_settings')
      .select('user_id, review_before_send, daily_apply_limit')
      .eq('is_active', true)

    if (settingsError) {
      console.error('[auto-apply] settings error:', settingsError.message)
      return NextResponse.json({ error: settingsError.message }, { status: 500 })
    }

    if (!settings?.length) {
      console.log('[auto-apply] no active users')
      return NextResponse.json({ processed_users: 0, total_queued: 0 })
    }

    console.log(`[auto-apply] ${settings.length} active user(s)`)

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const windowStart = new Date()
    windowStart.setDate(windowStart.getDate() - 7)

    // 2. Fetch a pool of recent active jobs once — shared across all users
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('id, title, company_name, location, apply_url, cross_border_status')
      .eq('is_active', true)
      .gte('created_at', windowStart.toISOString())
      .order('created_at', { ascending: false })
      .limit(15)

    if (jobsError) {
      console.error('[auto-apply] jobs error:', jobsError.message)
      return NextResponse.json({ error: jobsError.message }, { status: 500 })
    }

    console.log(`[auto-apply] job pool: ${jobs?.length ?? 0} jobs`)

    if (!jobs?.length) {
      return NextResponse.json({ processed_users: 0, total_queued: 0, reason: 'no_jobs_in_pool' })
    }

    // 3. Per-user processing
    for (const setting of settings) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_premium, is_admin, candidate_plan, email, full_name')
          .eq('user_id', setting.user_id)
          .single()

        const candidatePlan = effectiveCandidatePlan(profile ?? {})
        const planLimit = DAILY_LIMIT[candidatePlan] ?? 0

        if (planLimit === 0) {
          console.log(`[auto-apply] user ${setting.user_id} plan=${candidatePlan} has no auto-apply`)
          continue
        }

        processedUsers++

        const effectiveDailyLimit = Math.min(setting.daily_apply_limit ?? planLimit, planLimit)

        // Count today's queue entries (pending_review + sent)
        const { count: alreadyCount } = await supabase
          .from('auto_apply_log')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', setting.user_id)
          .in('status', ['pending_review', 'sent'])
          .gte('applied_at', today.toISOString())
          .lt('applied_at', tomorrow.toISOString())

        const alreadySent = alreadyCount ?? 0
        if (alreadySent >= effectiveDailyLimit) {
          console.log(`[auto-apply] user ${setting.user_id} daily limit reached (${alreadySent}/${effectiveDailyLimit})`)
          continue
        }

        // Jobs already queued or applied — fetch both in parallel to save time
        const [{ data: doneJobIds }, { data: appliedJobIds }] = await Promise.all([
          supabase.from('auto_apply_log').select('job_id').eq('user_id', setting.user_id).not('job_id', 'is', null),
          supabase.from('applications').select('job_id').eq('candidate_id', setting.user_id),
        ])

        const doneSet = new Set([
          ...(doneJobIds ?? []).map(r => r.job_id),
          ...(appliedJobIds ?? []).map(r => r.job_id),
        ])

        let queued = 0
        const queuedJobs: typeof jobs = []

        for (const job of jobs) {
          if (alreadySent + queued >= effectiveDailyLimit) break
          if (doneSet.has(job.id)) continue
          // Skip explicitly non-international jobs
          if ((job as { cross_border_status?: string | null }).cross_border_status === 'no') continue

          const { error: logError } = await supabase.from('auto_apply_log').insert({
            user_id: setting.user_id,
            job_id: job.id,
            status: 'pending_review',
            cover_letter: null,
            adapted_cv_url: null,
          })

          if (logError) {
            console.error(`[auto-apply] log insert failed user=${setting.user_id} job=${job.id}:`, logError.message)
            continue
          }

          queuedJobs.push(job)
          queued++
          totalQueued++
          console.log(`[auto-apply] queued user=${setting.user_id} job=${job.id} "${job.title}"`)
        }

        // Email notification
        if (queuedJobs.length > 0 && profile?.email && resend) {
          const rows = queuedJobs.map(j =>
            `<tr><td style="padding:10px;border-bottom:1px solid #e5e7eb">${j.title}</td><td style="padding:10px;border-bottom:1px solid #e5e7eb;color:#6b7280">${j.company_name}</td></tr>`
          ).join('')
          const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://jobconnect-ai.com'
          await resend.emails.send({
            from: 'JobConnect AI <noreply@jobconnect-ai.com>',
            to: profile.email,
            subject: `✦ ${queuedJobs.length} new job${queuedJobs.length > 1 ? 's' : ''} ready for your review — JobConnect AI`,
            html: `
              <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
                <div style="background:#10152A;padding:24px;border-radius:8px 8px 0 0">
                  <h1 style="color:#fff;margin:0;font-size:20px">✦ Jobs ready for review</h1>
                  <p style="color:#94a3b8;margin:8px 0 0">${new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
                </div>
                <div style="padding:24px;background:#fff;border-radius:0 0 8px 8px">
                  <p style="color:#374151">Hi ${profile.full_name || 'there'},</p>
                  <p style="color:#374151">JobConnect AI found <strong>${queuedJobs.length}</strong> matching job${queuedJobs.length > 1 ? 's' : ''} for you. Review and approve each application before it's sent.</p>
                  <table style="width:100%;border-collapse:collapse;margin:16px 0">
                    <thead><tr style="background:#f9fafb"><th style="padding:10px;text-align:left;font-size:13px;color:#374151">Job</th><th style="padding:10px;text-align:left;font-size:13px;color:#374151">Company</th></tr></thead>
                    <tbody>${rows}</tbody>
                  </table>
                  <a href="${appUrl}/auto-apply/settings" style="display:inline-block;background:#0ea5e9;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;margin-top:8px">Review Applications →</a>
                </div>
              </div>`,
          }).catch(e => console.error('[auto-apply] email error:', e))
          console.log(`[auto-apply] email sent to ${profile.email}`)
        }
      } catch (err) {
        console.error(`[auto-apply] error for user ${setting.user_id}:`, err instanceof Error ? err.message : String(err))
      }
    }

    console.log(`[auto-apply] done: ${processedUsers} users, ${totalQueued} queued`)
    return NextResponse.json({ processed_users: processedUsers, total_queued: totalQueued })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[auto-apply] fatal:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
