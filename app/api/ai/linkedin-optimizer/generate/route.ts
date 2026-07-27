import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { generateLinkedInProfile, LinkedInOptimizerError } from '@/lib/ai/linkedinOptimizer'
import { hasEnoughExperience, sanitizeTargetRole } from '@/lib/ai/resumeGuard'

const GENERATION_LIMIT = 10
const GENERATION_WINDOW_MS = 60 * 60 * 1000
const MAX_FIELD_LENGTH = 4000

type Body = {
  targetRole?: string
  experience?: string
  skills?: string
  summary?: string
}

export async function POST(req: Request) {
  const t = await getTranslations('errors')
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: t('mustBeSignedIn') }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('is_premium').eq('user_id', user.id).single()
  if (!profile?.is_premium) {
    return NextResponse.json({ error: t('linkedinOptimizerPremiumOnly') }, { status: 403 })
  }

  const { ok } = rateLimit(`ai-generate:linkedin-optimizer-generate:${user.id ?? getClientIp()}`, GENERATION_LIMIT, GENERATION_WINDOW_MS)
  if (!ok) return NextResponse.json({ error: t('tooManyLinkedinOptimizerRequests') }, { status: 429 })

  const body = (await req.json().catch(() => ({}))) as Body
  const targetRole = sanitizeTargetRole(body.targetRole)
  const experience = (body.experience ?? '').trim().slice(0, MAX_FIELD_LENGTH)
  const skills = (body.skills ?? '').trim().slice(0, MAX_FIELD_LENGTH)
  const summary = (body.summary ?? '').trim().slice(0, MAX_FIELD_LENGTH)

  if (!hasEnoughExperience(experience)) {
    return NextResponse.json({ error: t('linkedinOptimizerNotEnoughExperience') }, { status: 400 })
  }

  try {
    const generation = await generateLinkedInProfile({ targetRole, experience, skills, summary })
    return NextResponse.json({ generation })
  } catch (err) {
    const status = err instanceof LinkedInOptimizerError ? err.status : 500
    const message = err instanceof LinkedInOptimizerError ? err.message : t('somethingWentWrong')
    console.error('[linkedin-optimizer/generate]', message)
    return NextResponse.json({ error: message }, { status })
  }
}
