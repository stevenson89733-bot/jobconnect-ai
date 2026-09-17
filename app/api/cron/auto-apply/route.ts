import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { submitGreenhouseApplication } from '@/lib/ats/greenhouse'
import { detectLeverUrl, submitLeverApplication } from '@/lib/ats/lever'
import {
  checkCrossBorder,
  checkDailyLimit,
  DAILY_LIMIT,
} from '@/lib/autoApplyGuardrails'

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
  let totalApplications = 0

  try {
    // 1. Fetch all active users with auto-apply enabled
    console.log('[auto-apply] Querying auto_apply_settings WHERE is_active = true')
    const { data: settings, error: settingsError } = await supabase
      .from('auto_apply_settings')
      .select('user_id, max_applications_per_day, min_match_score')
      .eq('is_active', true)

    console.log('[auto-apply] Settings query result:', JSON.stringify({ count: settings?.length ?? 0, error: settingsError?.message ?? null }))

    if (settingsError) {
      console.error('[auto-apply] Settings fetch error:', settingsError.message)
      return NextResponse.json({ error: settingsError.message }, { status: 500 })
    }

    if (!settings || settings.length === 0) {
      console.log('[auto-apply] No active auto-apply users — auto_apply_settings table may be empty or no rows have is_active=true')
      return NextResponse.json({ processed_users: 0, total_applications: 0 })
    }

    console.log(`[auto-apply] Found ${settings.length} active user(s):`, settings.map(s => s.user_id))

    // 2. For each user with auto-apply enabled
    for (const setting of settings) {
      try {
        console.log(`[auto-apply] Processing user ${setting.user_id}`)

        // Fetch profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_premium, candidate_plan, auto_apply_review_mode, email, full_name, resume_text, skills, experience, headline, bio, cv_url')
          .eq('user_id', setting.user_id)
          .single()

        console.log(`[auto-apply] Profile for ${setting.user_id}:`, JSON.stringify({
          found: !!profile,
          is_premium: profile?.is_premium,
          candidate_plan: profile?.candidate_plan,
          auto_apply_review_mode: profile?.auto_apply_review_mode,
          has_cv_url: !!profile?.cv_url,
          profileError: profileError?.message ?? null,
        }))

        if (!profile?.is_premium) {
          console.log(`[auto-apply] User ${setting.user_id} not premium, skipping`)
          continue
        }

        processedUsers++

        // Count applications already sent today
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const { data: todayLogs, error: logsError } = await supabase
          .from('auto_apply_log')
          .select('id')
          .eq('user_id', setting.user_id)
          .gte('applied_at', today.toISOString())
          .lt('applied_at', tomorrow.toISOString())

        if (logsError) {
          console.error(`[auto-apply] User ${setting.user_id} logs error:`, logsError.message)
          continue
        }

        const alreadySent = todayLogs?.length || 0
        const candidatePlan = profile?.candidate_plan ?? 'free'
        const dailyLimit = DAILY_LIMIT[candidatePlan] ?? 0

        console.log(`[auto-apply] User ${setting.user_id} plan=${candidatePlan} dailyLimit=${dailyLimit} alreadySent=${alreadySent}`)

        if (dailyLimit === 0) {
          console.log(`[auto-apply] User ${setting.user_id} plan "${candidatePlan}" has auto-apply disabled`)
          continue
        }

        const dailyLimitCheck = checkDailyLimit(candidatePlan, alreadySent)
        if (!dailyLimitCheck.allowed) {
          console.log(`[auto-apply] User ${setting.user_id} reached daily limit (${alreadySent}/${dailyLimit})`)
          continue
        }

        const remaining = dailyLimit - alreadySent

        // Get recently posted jobs matching criteria
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)

        // TODO: match_score is not stored on the jobs table — it's computed
        // per-user dynamically. Re-add the gte filter once a user_job_matches
        // table (or equivalent) is available. For now we fetch recent active
        // cross-border jobs and apply the guardrails per-job below.
        const { data: jobs, error: jobsError } = await supabase
          .from('jobs')
          .select('id, title, company_name, description, location, apply_url, cross_border_status')
          .eq('is_active', true)
          .gte('created_at', yesterday.toISOString())
          .order('created_at', { ascending: false })
          .limit(remaining)

        console.log(`[auto-apply] Jobs query returned ${jobs?.length ?? 0} jobs, error: ${jobsError?.message ?? null}`)

        if (jobsError) {
          console.error(`[auto-apply] User ${setting.user_id} jobs error:`, jobsError.message)
          continue
        }

        if (!jobs || jobs.length === 0) {
          console.log(`[auto-apply] No matching jobs for user ${setting.user_id}`)
          continue
        }

        // Filter out jobs already applied to
        const { data: appliedJobs } = await supabase
          .from('applications')
          .select('job_id')
          .eq('user_id', setting.user_id)
          .in('job_id', jobs.map((j) => j.id))

        const appliedJobIds = new Set(appliedJobs?.map((a) => a.job_id))
        const unappliedJobs = jobs.filter((j) => !appliedJobIds.has(j.id))

        if (unappliedJobs.length === 0) {
          console.log(`[auto-apply] User ${setting.user_id} already applied to all matching jobs`)
          continue
        }

        const applicationsThisRound: typeof unappliedJobs = []

        // Apply to each job
        for (const job of unappliedJobs) {
          try {
            const jobAny = job as { cross_border_status?: string | null; apply_url?: string | null }

            // Guardrail: cross-border filter
            // TODO: re-add match_score guardrail once user_job_matches table exists
            const cbCheck = checkCrossBorder(jobAny.cross_border_status)
            if (!cbCheck.allowed) {
              await supabase.from('auto_apply_log').insert({
                user_id: setting.user_id,
                job_id: job.id,
                status: cbCheck.reason,
                cover_letter: null,
                adapted_cv_url: null,
              })
              console.log(`[auto-apply] Blocked job ${job.id} for user ${setting.user_id}: ${cbCheck.reason}`)
              continue
            }

            // Guardrail 3: re-check daily limit (may have consumed slots in this loop)
            const loopLimitCheck = checkDailyLimit(candidatePlan, alreadySent + applicationsThisRound.length)
            if (!loopLimitCheck.allowed) {
              console.log(`[auto-apply] User ${setting.user_id} hit daily limit mid-loop, stopping`)
              break
            }

            // Generate cover letter
            const coverLetterRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ai/cover-letter`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${cronSecret}`,
              },
              body: JSON.stringify({
                candidateProfile: {
                  resume_text: profile?.resume_text,
                  skills: profile?.skills,
                  experience: profile?.experience,
                  headline: profile?.headline,
                  bio: profile?.bio,
                },
                job: {
                  title: job.title,
                  company_name: job.company_name,
                  description: job.description,
                  location: job.location,
                },
              }),
            })

            if (!coverLetterRes.ok) {
              console.error(
                `[auto-apply] User ${setting.user_id} cover letter generation failed for job ${job.id}`
              )
              continue
            }

            const { cover_letter } = await coverLetterRes.json()

            // Guardrail 4: review mode — queue for user approval instead of sending
            const reviewMode = profile?.auto_apply_review_mode !== false // default true
            if (reviewMode) {
              await supabase.from('auto_apply_log').insert({
                user_id: setting.user_id,
                job_id: job.id,
                status: 'pending_review',
                cover_letter,
                adapted_cv_url: profile?.cv_url ?? null,
              })
              applicationsThisRound.push(job)
              totalApplications++
              console.log(`[auto-apply] Queued for review: user ${setting.user_id} job ${job.id} "${job.title}"`)
              continue
            }

            // Attempt real ATS submission — Greenhouse → Lever → skipped
            let atsStatus: 'sent' | 'pending' | 'failed' | 'skipped_no_ats_match' = 'skipped_no_ats_match'
            const applyUrl: string | null = (job as { apply_url?: string | null }).apply_url ?? null

            const nameParts = (profile?.full_name ?? '').trim().split(/\s+/)
            const firstName = nameParts[0] ?? ''
            const lastName = nameParts.slice(1).join(' ') || firstName

            if (applyUrl?.includes('greenhouse.io')) {
              const ghResult = await submitGreenhouseApplication({
                apply_url: applyUrl,
                first_name: firstName,
                last_name: lastName,
                email: profile?.email ?? '',
                cv_url: profile?.cv_url ?? null,
                cover_letter,
              })

              if (ghResult.success) {
                atsStatus = 'sent'
                console.log(`[auto-apply] Greenhouse OK — id ${ghResult.greenhouse_id} user ${setting.user_id} job ${job.id}`)
              } else {
                atsStatus = 'failed'
                console.error(`[auto-apply] Greenhouse failed user ${setting.user_id} job ${job.id}: ${ghResult.error}`)
              }
            } else if (applyUrl && detectLeverUrl(applyUrl)) {
              const leverResult = await submitLeverApplication(applyUrl, {
                name: profile?.full_name ?? `${firstName} ${lastName}`.trim(),
                email: profile?.email ?? '',
                phone: undefined,
                cvUrl: profile?.cv_url ?? null,
                coverLetter: cover_letter,
              })

              if (leverResult.success) {
                atsStatus = 'sent'
                console.log(`[auto-apply] Lever OK — user ${setting.user_id} job ${job.id}`)
              } else {
                atsStatus = 'failed'
                console.error(`[auto-apply] Lever failed user ${setting.user_id} job ${job.id}: ${leverResult.error}`)
              }
            } else {
              console.log(`[auto-apply] No ATS match for job ${job.id} (url: ${applyUrl ?? 'none'}) — skipped`)
            }

            // Record in auto_apply_log
            const { error: logError } = await supabase
              .from('auto_apply_log')
              .insert({
                user_id: setting.user_id,
                job_id: job.id,
                status: atsStatus,
                cover_letter,
                adapted_cv_url: profile?.cv_url ?? null,
              })

            if (logError) {
              console.error(
                `[auto-apply] User ${setting.user_id} log insert failed for job ${job.id}:`,
                logError.message
              )
              continue
            }

            // Record in applications table
            const { error: appError } = await supabase
              .from('applications')
              .insert({
                user_id: setting.user_id,
                job_id: job.id,
                cover_letter,
                applied_at: new Date().toISOString(),
              })

            if (appError) {
              console.error(
                `[auto-apply] User ${setting.user_id} application insert failed for job ${job.id}:`,
                appError.message
              )
              continue
            }

            applicationsThisRound.push(job)
            totalApplications++
            console.log(
              `[auto-apply] User ${setting.user_id} applied to "${job.title}" at ${job.company_name}`
            )

            // Wait 2 seconds between applications to avoid rate limiting
            await new Promise((resolve) => setTimeout(resolve, 2000))
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err)
            console.error(`[auto-apply] User ${setting.user_id} error processing job ${job.id}:`, message)
            continue
          }
        }

        // Send email report
        if (applicationsThisRound.length > 0 && profile?.email && resend) {
          try {
            const jobsHtml = applicationsThisRound
              .map(
                (j) => `
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px; color: #374151;">${j.title}</td>
                <td style="padding: 12px; color: #374151;">${j.company_name}</td>
                <td style="padding: 12px; color: #10b981;">✓ Sent</td>
              </tr>
            `
              )
              .join('')

            await resend!.emails.send({
              from: 'noreply@jobconnect-ai.com',
              to: profile.email,
              subject: `✦ JobConnect AI — ${applicationsThisRound.length} application${applicationsThisRound.length === 1 ? '' : 's'} sent today`,
              html: `
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f3f4f6; }
                    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
                    .header { background: linear-gradient(135deg, #10152A 0%, #1e293b 100%); padding: 24px; color: white; }
                    .header h1 { margin: 0; font-size: 20px; font-weight: 600; }
                    .header p { margin: 8px 0 0 0; color: #cbd5e1; font-size: 14px; }
                    .content { padding: 24px; }
                    .date { color: #6b7280; font-size: 14px; margin-bottom: 16px; }
                    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
                    th { background: #f9fafb; padding: 12px; text-align: left; font-weight: 600; color: #374151; font-size: 14px; border-bottom: 2px solid #e5e7eb; }
                    .cta { display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 16px 0; }
                    .cta:hover { opacity: 0.9; }
                    .footer { background: #f9fafb; padding: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center; }
                    .footer a { color: #0ea5e9; text-decoration: none; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>✦ Your Daily Auto-Apply Report</h1>
                      <p>${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div class="content">
                      <p>Hi ${profile.full_name || 'there'},</p>
                      <p>Great news! JobConnect AI Auto-Apply sent <strong>${applicationsThisRound.length}</strong> application${applicationsThisRound.length === 1 ? '' : 's'} for you today.</p>
                      <table>
                        <thead>
                          <tr>
                            <th>Job Title</th>
                            <th>Company</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${jobsHtml}
                        </tbody>
                      </table>
                      <a href="${process.env.NEXT_PUBLIC_APP_URL}/candidate/applications" class="cta">View All Applications</a>
                      <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/auto-apply" style="color: #0ea5e9; text-decoration: none;">Manage your Auto-Apply settings</a>
                      </p>
                    </div>
                    <div class="footer">
                      <p>Powered by <strong>JobConnect AI</strong> • <a href="${process.env.NEXT_PUBLIC_APP_URL}">jobconnect.ai</a></p>
                    </div>
                  </div>
                </body>
                </html>
              `,
            })

            console.log(`[auto-apply] Email sent to ${profile.email}`)
          } catch (emailErr) {
            const message = emailErr instanceof Error ? emailErr.message : String(emailErr)
            console.error(`[auto-apply] Email error for user ${setting.user_id}:`, message)
          }
        } else if (applicationsThisRound.length > 0 && !resend) {
          console.log(`[auto-apply] Resend not configured, skipping email for user ${setting.user_id}`)
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        console.error(`[auto-apply] Error processing user ${setting.user_id}:`, message)
        continue
      }
    }

    console.log(`[auto-apply] Completed: ${processedUsers} users, ${totalApplications} applications`)
    return NextResponse.json({ processed_users: processedUsers, total_applications: totalApplications })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[auto-apply] Fatal error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
