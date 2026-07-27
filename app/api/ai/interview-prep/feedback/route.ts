import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { generateFeedback, hasEnoughAnswer, InterviewPrepError } from '@/lib/ai/interviewPrep'

// More generous than questions generation — a real prep session calls this
// once per question (up to 5x), plus realistic retries after editing an
// answer, same "iterative use is expected" reasoning as the resume/cover
// letter generation limits.
const FEEDBACK_LIMIT = 30
const FEEDBACK_WINDOW_MS = 60 * 60 * 1000
const MAX_QUESTION_LENGTH = 500
const MAX_ANSWER_LENGTH = 4000

type Body = {
  question?: string
  answer?: string
}

export async function POST(req: Request) {
  const t = await getTranslations('errors')
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: t('mustBeSignedIn') }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('is_premium').eq('user_id', user.id).single()
  if (!profile?.is_premium) {
    return NextResponse.json({ error: t('interviewPrepPremiumOnly') }, { status: 403 })
  }

  const { ok } = rateLimit(`ai-generate:interview-prep-feedback:${user.id ?? getClientIp()}`, FEEDBACK_LIMIT, FEEDBACK_WINDOW_MS)
  if (!ok) return NextResponse.json({ error: t('tooManyInterviewPrepRequests') }, { status: 429 })

  const body = (await req.json().catch(() => ({}))) as Body
  const question = body.question?.trim().slice(0, MAX_QUESTION_LENGTH)
  const answer = body.answer?.trim().slice(0, MAX_ANSWER_LENGTH)
  if (!question) return NextResponse.json({ error: t('interviewPrepMissingQuestion') }, { status: 400 })

  // Same anti-fabrication guard as lib/ai/resumeGuard.ts's hasEnoughExperience
  // — never send too-thin input to the LLM to fill the gap with invented
  // praise or criticism. This is a normal, expected state (not a hard
  // error), so the client shows it inline rather than as an alarming failure.
  if (!hasEnoughAnswer(answer)) {
    return NextResponse.json({ error: t('interviewPrepAnswerTooShort') }, { status: 400 })
  }

  try {
    const feedback = await generateFeedback(question, answer!)
    return NextResponse.json({ feedback })
  } catch (err) {
    const status = err instanceof InterviewPrepError ? err.status : 500
    const message = err instanceof InterviewPrepError ? err.message : t('somethingWentWrong')
    console.error('[interview-prep/feedback]', message)
    return NextResponse.json({ error: message }, { status })
  }
}
