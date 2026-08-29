import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { generateSkillGapAnalysis, SkillGapError, type GapContext } from '@/lib/ai/skillGap'
import { hasEnoughExperience, sanitizeTargetRole } from '@/lib/ai/resumeGuard'

const GENERATION_LIMIT = 10
const GENERATION_WINDOW_MS = 60 * 60 * 1000
const MAX_FIELD_LENGTH = 4000

const VALID_COUNTRIES = ['US', 'UK', 'CA', 'DE', 'FR']

type Body = {
  jobId?: string
  targetRole?: string
  skills?: string
  experience?: string
  targetCountry?: string
}

export async function POST(req: Request) {
  const t = await getTranslations('errors')
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: t('mustBeSignedIn') }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('is_premium, is_admin').eq('user_id', user.id).single()
  if (!profile?.is_premium && !profile?.is_admin) {
    return NextResponse.json({ error: t('skillGapPremiumOnly') }, { status: 403 })
  }

  if (!profile?.is_admin) {
    const { ok } = rateLimit(`ai-generate:skill-gap:${user.id ?? getClientIp()}`, GENERATION_LIMIT, GENERATION_WINDOW_MS)
    if (!ok) return NextResponse.json({ error: t('tooManySkillGapRequests') }, { status: 429 })
  }

  const body = (await req.json().catch(() => ({}))) as Body
  const skills = (body.skills ?? '').trim().slice(0, MAX_FIELD_LENGTH)
  const experience = (body.experience ?? '').trim().slice(0, MAX_FIELD_LENGTH)
  const targetCountry = typeof body.targetCountry === 'string' && VALID_COUNTRIES.includes(body.targetCountry)
    ? body.targetCountry
    : undefined

  if (!hasEnoughExperience(experience)) {
    return NextResponse.json({ error: t('skillGapNotEnoughExperience') }, { status: 400 })
  }

  let context: GapContext
  if (body.jobId) {
    // Re-fetched server-side, never trusting a client-supplied description —
    // the "real_job" basis this feature's honesty guarantee rests on must
    // reflect an actual, currently-active listing, not whatever the client sent.
    const { data: job } = await supabase
      .from('jobs')
      .select('title, tags, description')
      .eq('id', body.jobId)
      .eq('is_active', true)
      .single()

    if (!job) {
      return NextResponse.json({ error: t('skillGapJobNotFound') }, { status: 404 })
    }

    context = { kind: 'job', title: job.title ?? '', tags: (job.tags as string[] | null) ?? [], description: job.description ?? '' }
  } else {
    const targetRole = sanitizeTargetRole(body.targetRole)
    if (!targetRole) return NextResponse.json({ error: t('skillGapMissingTargetRole') }, { status: 400 })
    context = { kind: 'role', targetRole }
  }

  try {
    const analysis = await generateSkillGapAnalysis({ candidateSkills: skills, candidateExperience: experience, context, targetCountry })
    return NextResponse.json({ analysis })
  } catch (err) {
    const status = err instanceof SkillGapError ? err.status : 500
    const message = err instanceof SkillGapError ? err.message : t('somethingWentWrong')
    console.error('[skill-gap]', message)
    return NextResponse.json({ error: message }, { status })
  }
}
