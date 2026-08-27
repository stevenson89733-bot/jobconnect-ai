import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { fetchAdzunaJobs, ADZUNA_COUNTRIES, type AdzunaCountryCode } from '@/lib/adzuna'

const VALID_COUNTRIES = new Set<string>(ADZUNA_COUNTRIES.map((c) => c.code))

export async function GET(req: Request) {
  const t = await getTranslations('errors')
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: t('mustBeSignedIn') }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('user_id', user.id)
    .single()

  if (!profile?.is_admin) {
    return NextResponse.json({ error: t('adminsOnly') }, { status: 403 })
  }

  const { ok } = rateLimit(`admin:adzuna-jobs:${user.id ?? getClientIp()}`, 5, 60 * 60 * 1000)
  if (!ok) {
    return NextResponse.json({ error: t('tooManyRequests') }, { status: 429 })
  }

  const url = new URL(req.url)
  const country = url.searchParams.get('country') ?? 'gb'

  if (!VALID_COUNTRIES.has(country)) {
    return NextResponse.json(
      { error: `Invalid country. Must be one of: ${[...VALID_COUNTRIES].join(', ')}` },
      { status: 400 }
    )
  }

  try {
    const resultsPerPage = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') ?? '50', 10)))
    const jobs = await fetchAdzunaJobs({ country: country as AdzunaCountryCode, resultsPerPage })
    return NextResponse.json({ jobs })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
