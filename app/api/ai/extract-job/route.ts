import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { extractJobFromText, hasEnoughText, JobExtractError } from '@/lib/ai/jobExtract'
import { fetchJobUrl } from '@/lib/ai/fetchJobUrl'

const EXTRACTION_LIMIT = 10
const EXTRACTION_WINDOW_MS = 60 * 60 * 1000
const MAX_TEXT_LENGTH = 8000

type Body = { text?: string; url?: string }

export async function POST(req: Request) {
  const t = await getTranslations('errors')
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: t('mustBeSignedIn') }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single()
  if (profile?.role !== 'employer') {
    return NextResponse.json({ error: t('onlyEmployerAccountsCanPostJobs') }, { status: 403 })
  }

  const { ok } = rateLimit(`ai-generate:extract-job:${user.id ?? getClientIp()}`, EXTRACTION_LIMIT, EXTRACTION_WINDOW_MS)
  if (!ok) return NextResponse.json({ error: t('tooManyExtractJobRequests') }, { status: 429 })

  const body = (await req.json().catch(() => ({}))) as Body

  try {
    let text: string

    if (body.url) {
      // Validate URL structure before fetching.
      try { new URL(body.url) } catch {
        return NextResponse.json({ error: t('extractJobInvalidUrl') }, { status: 400 })
      }
      // fetchJobUrl throws JobExtractError (422) with a human-readable message on any fetch failure.
      text = await fetchJobUrl(body.url)
    } else {
      text = (body.text ?? '').trim().slice(0, MAX_TEXT_LENGTH)
      if (!hasEnoughText(text)) {
        return NextResponse.json({ error: t('extractJobTextTooShort') }, { status: 400 })
      }
    }

    const extracted = await extractJobFromText(text)
    return NextResponse.json({ extracted })
  } catch (err) {
    const status = err instanceof JobExtractError ? err.status : 500
    const message = err instanceof JobExtractError ? err.message : t('somethingWentWrong')
    console.error('[extract-job]', message)
    return NextResponse.json({ error: message }, { status })
  }
}
