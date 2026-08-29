import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { analyzeLinkedInProfile, hasEnoughProfileText, LinkedInOptimizerError } from '@/lib/ai/linkedinOptimizer'

const ANALYSIS_LIMIT = 10
const ANALYSIS_WINDOW_MS = 60 * 60 * 1000
const MAX_FIELD_LENGTH = 4000

type Body = {
  headline?: string
  about?: string
  experience?: string
}

export async function POST(req: Request) {
  const t = await getTranslations('errors')
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: t('mustBeSignedIn') }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('is_premium, is_admin').eq('user_id', user.id).single()
  if (!profile?.is_premium && !profile?.is_admin) {
    return NextResponse.json({ error: t('linkedinOptimizerPremiumOnly') }, { status: 403 })
  }

  if (!profile?.is_admin) {
    const { ok } = rateLimit(`ai-generate:linkedin-optimizer-analyze:${user.id ?? getClientIp()}`, ANALYSIS_LIMIT, ANALYSIS_WINDOW_MS)
    if (!ok) return NextResponse.json({ error: t('tooManyLinkedinOptimizerRequests') }, { status: 429 })
  }

  const body = (await req.json().catch(() => ({}))) as Body
  const headline = (body.headline ?? '').trim().slice(0, MAX_FIELD_LENGTH)
  const about = (body.about ?? '').trim().slice(0, MAX_FIELD_LENGTH)
  const experience = (body.experience ?? '').trim().slice(0, MAX_FIELD_LENGTH)

  if (!hasEnoughProfileText(`${headline} ${about} ${experience}`)) {
    return NextResponse.json({ error: t('linkedinOptimizerTextTooShort') }, { status: 400 })
  }

  try {
    const analysis = await analyzeLinkedInProfile({ headline, about, experience })
    return NextResponse.json({ analysis })
  } catch (err) {
    const status = err instanceof LinkedInOptimizerError ? err.status : 500
    const message = err instanceof LinkedInOptimizerError ? err.message : t('somethingWentWrong')
    console.error('[linkedin-optimizer/analyze]', message)
    return NextResponse.json({ error: message }, { status })
  }
}
