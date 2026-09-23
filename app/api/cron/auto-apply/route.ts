export const maxDuration = 10

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import OpenAI from 'openai'
import { submitGreenhouseApplication } from '@/lib/ats/greenhouse'
import { detectLeverUrl, submitLeverApplication } from '@/lib/ats/lever'
import {
  checkCrossBorder,
  checkDailyLimit,
  DAILY_LIMIT,
} from '@/lib/autoApplyGuardrails'

// Direct OpenAI call — bypasses the loopback HTTP approach which requires a
// cookie session that doesn't exist in a cron/server-to-server context.
// The /api/ai/cover-letter route's resolveProvider() falls to Mistral free
// tier when unauthenticated, and fails entirely if MISTRAL_API_KEY isn't set.
async function generateCoverLetterDirect({
  targetRole,
  company,
  jobDescription,
  skills,
  experience,
  bio,
}: {
  targetRole: string
  company: string
  jobDescription: string
  skills: string
  experience: string
  bio: string
}): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    console.error('[auto-apply] OPENAI_API_KEY not set — cannot generate cover letter')
    return null
  }

  const strengths = [
    skills && `Skills: ${skills}`,
    experience && `Experience: ${experience}`,
    bio && `About: ${bio}`,
  ].filter(Boolean).join('\n\n') || 'Not provided'

  const openai = new OpenAI({ apiKey })
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)
  try {
    const res = await openai.chat.completions.create(
      {
        model: 'gpt-4o',
        messages: [{
          role: 'user',
          content: `You are an expert career coach. Write a professional cover letter for this candidate.

Target role: ${targetRole}
Company: ${company}
Job description: ${jobDescription ? jobDescription.slice(0, 2000) : 'Not provided'}
Candidate profile:
${strengths}

Return a JSON object with this exact structure:
{
  "letter": {
    "greeting": "Dear Hiring Manager,",
    "opening": "<2-3 sentence opening that states the role and hooks the reader>",
    "body": "<2 paragraphs: first highlights candidate fit from their real profile above; second connects to the job description>",
    "closing": "<strong closing paragraph with a clear call to action>"
  }
}

Use ONLY facts present in the candidate profile above. Do not invent metrics, employers, or achievements.`,
        }],
        max_tokens: 1200,
        response_format: { type: 'json_object' },
      },
      { signal: controller.signal }
    )
    clearTimeout(timeout)
    const data = JSON.parse(res.choices?.[0]?.message?.content ?? '{}')
    const letter = data.letter ?? {}
    const text = [letter.greeting, letter.opening, letter.body, letter.closing]
      .filter(Boolean).join('\n\n')
    return text || null
  } catch (err) {
    clearTimeout(timeout)
    const isTimeout = err instanceof Error && err.name === 'AbortError'
    if (isTimeout) {
      console.error('[auto-apply] OpenAI cover letter timed out after 8s')
      return 'TIMEOUT'
    }
    console.error('[auto-apply] OpenAI cover letter generation failed:', err instanceof Error ? err.message : String(err))
    return null
  }
}

// Returns true only for URLs that point to an actual uploaded file.
// Rejects placeholder/example domains and bare http://example.com paths.
function isRealCvUrl(url: string | null | undefined): boolean {
  if (!url) return false
  try {
    const { hostname } = new URL(url)
    const placeholders = ['example.com', 'example.org', 'example.net', 'test.com', 'localhost']
    return !placeholders.includes(hostname)
  } catch {
    return false
  }
}

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
      .select('user_id, max_applications_per_day, min_match_score, review_before_send, daily_apply_limit')
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
          .select('is_premium, candidate_plan, auto_apply_review_mode, email, full_name, skills, experience, bio, cv_url')
          .eq('user_id', setting.user_id)
          .single()

        console.log(`[auto-apply] Profile for ${setting.user_id}:`, JSON.stringify({
          found: !!profile,
          is_premium: profile?.is_premium,
          candidate_plan: profile?.candidate_plan,
          auto_apply_review_mode: profile?.auto_apply_review_mode,
          has_cv_url: !!profile?.cv_url,
          profileError: profileError?.message ?? null,
          profileErrorDetails: profileError?.details ?? null,
        }))

        const isPremium = profile?.is_premium === true || ['pro', 'elite'].includes(profile?.candidate_plan ?? '')
        if (!isPremium) {
          console.log(`[auto-apply] User ${setting.user_id} not premium (is_premium=${profile?.is_premium} plan=${profile?.candidate_plan}), skipping`)
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
        const planLimit = DAILY_LIMIT[candidatePlan] ?? 0

        // Per-user setting takes precedence over plan limit when set
        const userDailyLimit = setting.daily_apply_limit ?? planLimit
        const effectiveDailyLimit = Math.min(userDailyLimit, planLimit === 0 ? 0 : userDailyLimit)

        console.log(`[auto-apply] User ${setting.user_id} plan=${candidatePlan} planLimit=${planLimit} userLimit=${userDailyLimit} alreadySent=${alreadySent}`)

        if (planLimit === 0) {
          console.log(`[auto-apply] User ${setting.user_id} plan "${candidatePlan}" has auto-apply disabled`)
          continue
        }

        if (alreadySent >= effectiveDailyLimit) {
          console.log(`[auto-apply] User ${setting.user_id} reached daily limit (${alreadySent}/${effectiveDailyLimit})`)
          continue
        }

        // Window: 7 days (Greenhouse jobs are typically older than 24h)
        const windowStart = new Date()
        windowStart.setDate(windowStart.getDate() - 7)

        // Fetch the single most recent active job, then decide what to do with it.
        // Every outcome writes to auto_apply_log so the table is never empty after a run.
        const { data: jobs, error: jobsError } = await supabase
          .from('jobs')
          .select('id, title, company_name, description, location, apply_url, cross_border_status')
          .eq('is_active', true)
          .gte('created_at', windowStart.toISOString())
          .or('apply_url.ilike.%greenhouse%,apply_url.ilike.%lever%')
          .order('created_at', { ascending: false })
          .limit(1)

        console.log(`[auto-apply] Jobs query returned ${jobs?.length ?? 0} jobs, error: ${jobsError?.message ?? null}`)
        if (jobs?.[0]) console.log(`[auto-apply] Fetched job ${jobs[0].id} apply_url=${jobs[0].apply_url}`)

        if (jobsError) {
          console.error(`[auto-apply] User ${setting.user_id} jobs error:`, jobsError.message)
          continue
        }

        const job = jobs?.[0] ?? null
        const applicationsThisRound: NonNullable<typeof jobs> = []

        const logInsert = async (payload: Record<string, unknown>) => {
          const { error } = await supabase.from('auto_apply_log').insert(payload)
          if (error) console.error(`[auto-apply] auto_apply_log insert failed for user ${setting.user_id}:`, error.message, JSON.stringify(payload))
          else console.log(`[auto-apply] auto_apply_log written — user ${setting.user_id} job ${payload.job_id ?? 'none'} status=${payload.status}`)
        }

        if (!job) {
          await logInsert({ user_id: setting.user_id, job_id: null, status: 'no_jobs_available', cover_letter: null, adapted_cv_url: null })
          continue
        }

        console.log(`[auto-apply] User ${setting.user_id}: processing job ${job.id} "${job.title}"`)

        try {
          // Check if already applied
          const { data: existingApp } = await supabase
            .from('applications')
            .select('job_id')
            .eq('candidate_id', setting.user_id)
            .eq('job_id', job.id)
            .maybeSingle()

          if (existingApp) {
            await logInsert({ user_id: setting.user_id, job_id: job.id, status: 'already_applied', cover_letter: null, adapted_cv_url: null })
            continue
          }

          // Cross-border guardrail
          const jobAny = job as { cross_border_status?: string | null; apply_url?: string | null }
          const cbCheck = checkCrossBorder(jobAny.cross_border_status)
          if (!cbCheck.allowed) {
            await logInsert({ user_id: setting.user_id, job_id: job.id, status: 'blocked_cross_border', cover_letter: null, adapted_cv_url: null })
            continue
          }

          console.log(`[auto-apply] Job ${job.id} "${job.title}" passed guardrails — generating cover letter`)

          const cover_letter = await generateCoverLetterDirect({
            targetRole: job.title,
            company: job.company_name,
            jobDescription: job.description ?? '',
            skills: profile?.skills ?? '',
            experience: profile?.experience ?? '',
            bio: profile?.bio ?? '',
          })

          if (cover_letter === 'TIMEOUT') {
            await logInsert({ user_id: setting.user_id, job_id: job.id, status: 'skipped_timeout', cover_letter: null, adapted_cv_url: null })
            continue
          }

          if (!cover_letter) {
            await logInsert({ user_id: setting.user_id, job_id: job.id, status: 'failed', cover_letter: null, adapted_cv_url: null })
            continue
          }

          console.log(`[auto-apply] Cover letter generated for job ${job.id} (${cover_letter.length} chars)`)

          // Only use cv_url when it points to a real uploaded file
          const realCvUrl = isRealCvUrl(profile?.cv_url) ? profile!.cv_url : null
          if (profile?.cv_url && !realCvUrl) {
            console.log(`[auto-apply] Placeholder cv_url for user ${setting.user_id} — skipping CV attachment`)
          }

          // Review mode — queue for user approval instead of sending
          // setting.review_before_send defaults to true when not yet set (safe default)
          const reviewMode = setting.review_before_send !== false
          if (reviewMode) {
            await logInsert({ user_id: setting.user_id, job_id: job.id, status: 'pending_review', cover_letter, adapted_cv_url: realCvUrl })
            applicationsThisRound.push(job)
            totalApplications++
            console.log(`[auto-apply] Queued for review: user ${setting.user_id} job ${job.id} "${job.title}"`)
            continue
          }

          // ATS submission — Greenhouse → Lever → skipped
          let atsStatus: 'sent' | 'failed' | 'skipped_no_ats_match' = 'skipped_no_ats_match'
          const applyUrl: string | null = jobAny.apply_url ?? null
          const nameParts = (profile?.full_name ?? '').trim().split(/\s+/)
          const firstName = nameParts[0] ?? ''
          const lastName = nameParts.slice(1).join(' ') || firstName

          if (applyUrl?.includes('greenhouse.io')) {
            const ghResult = await submitGreenhouseApplication({
              apply_url: applyUrl,
              first_name: firstName,
              last_name: lastName,
              email: profile?.email ?? '',
              cv_url: realCvUrl,
              cover_letter,
            })
            atsStatus = ghResult.success ? 'sent' : 'failed'
            if (ghResult.success) console.log(`[auto-apply] Greenhouse OK — id ${ghResult.greenhouse_id} user ${setting.user_id} job ${job.id}`)
            else console.error(`[auto-apply] Greenhouse failed user ${setting.user_id} job ${job.id}: ${ghResult.error}`)
          } else if (applyUrl && detectLeverUrl(applyUrl)) {
            const leverResult = await submitLeverApplication(applyUrl, {
              name: profile?.full_name ?? `${firstName} ${lastName}`.trim(),
              email: profile?.email ?? '',
              phone: undefined,
              cvUrl: realCvUrl,
              coverLetter: cover_letter,
            })
            atsStatus = leverResult.success ? 'sent' : 'failed'
            if (leverResult.success) console.log(`[auto-apply] Lever OK — user ${setting.user_id} job ${job.id}`)
            else console.error(`[auto-apply] Lever failed user ${setting.user_id} job ${job.id}: ${leverResult.error}`)
          } else {
            console.log(`[auto-apply] No ATS match for job ${job.id} (url: ${applyUrl ?? 'none'})`)
          }

          await logInsert({ user_id: setting.user_id, job_id: job.id, status: atsStatus, cover_letter, adapted_cv_url: realCvUrl })

          if (atsStatus === 'sent') {
            const { error: appError } = await supabase.from('applications').insert({
              candidate_id: setting.user_id,
              job_id: job.id,
              cover_letter,
              applied_at: new Date().toISOString(),
            })
            if (appError) {
              console.error(`[auto-apply] applications insert failed for user ${setting.user_id} job ${job.id}:`, appError.message)
            } else {
              applicationsThisRound.push(job)
              totalApplications++
              console.log(`[auto-apply] Applied: user ${setting.user_id} → "${job.title}" at ${job.company_name}`)
            }
          }

        } catch (err) {
          const message = err instanceof Error ? err.message : String(err)
          console.error(`[auto-apply] Unexpected error for user ${setting.user_id} job ${job.id}:`, message)
          await logInsert({ user_id: setting.user_id, job_id: job.id, status: 'failed', cover_letter: null, adapted_cv_url: null })
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
