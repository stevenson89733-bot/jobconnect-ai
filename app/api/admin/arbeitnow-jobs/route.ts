import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { fetchArbeitnowJobs } from '@/lib/arbeitnow'

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

  const { ok } = rateLimit(`admin:arbeitnow-jobs:${user.id ?? getClientIp()}`, 5, 60 * 60 * 1000)
  if (!ok) {
    return NextResponse.json({ error: t('tooManyRequests') }, { status: 429 })
  }

  try {
    const url = new URL(req.url)
    const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') ?? '50', 10)))

    const jobs = await fetchArbeitnowJobs({ page, limit })
    return NextResponse.json({ jobs })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
