import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { generateQuestions, InterviewPrepError, type InterviewPrepContext } from '@/lib/ai/interviewPrep'
import { sanitizeTargetRole } from '@/lib/ai/resumeGuard'

const GENERATION_LIMIT = 10
const GENERATION_WINDOW_MS = 60 * 60 * 1000
const MAX_DESCRIPTION_LENGTH = 6000

type Body = {
  targetRole?: string
  company?: string
  jobDescription?: string
  experience?: string
  skills?: string
}

export async function POST(req: Request) {
  const t = await getTranslations('errors')
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: t('mustBeSignedIn') }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('is_premium, is_admin').eq('user_id', user.id).single()
  if (!profile?.is_premium && !profile?.is_admin) {
    return NextResponse.json({ error: t('interviewPrepPremiumOnly') }, { status: 403 })
  }

  if (!profile?.is_admin) {
    const { ok } = rateLimit(`ai-generate:interview-prep-questions:${user.id ?? getClientIp()}`, GENERATION_LIMIT, GENERATION_WINDOW_MS)
    if (!ok) return NextResponse.json({ error: t('tooManyInterviewPrepRequests') }, { status: 429 })
  }

  const body = (await req.json().catch(() => ({}))) as Body
  const targetRole = sanitizeTargetRole(body.targetRole)
  if (!targetRole) return NextResponse.json({ error: t('interviewPrepMissingTargetRole') }, { status: 400 })

  const jobDescription = body.jobDescription?.trim().slice(0, MAX_DESCRIPTION_LENGTH)
  const context: InterviewPrepContext = jobDescription
    ? { kind: 'job', targetRole, company: (body.company ?? '').trim(), description: jobDescription }
    : { kind: 'profile', targetRole, experience: (body.experience ?? '').trim(), skills: (body.skills ?? '').trim() }

  try {
    const questions = await generateQuestions(context)
    return NextResponse.json({ questions })
  } catch (err) {
    const status = err instanceof InterviewPrepError ? err.status : 500
    const message = err instanceof InterviewPrepError ? err.message : t('somethingWentWrong')
    console.error('[interview-prep/questions]', message)
    return NextResponse.json({ error: message }, { status })
  }
}
