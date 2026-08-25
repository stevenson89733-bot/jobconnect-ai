import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { fetchRemotiveJobs } from '@/lib/remotive'

const REMOTIVE_LIMIT = 5
const REMOTIVE_WINDOW_MS = 60 * 60 * 1000 // 1 hour

export async function GET(req: Request) {
  const t = await getTranslations('errors')
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: t('mustBeSignedIn') }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('user_id', user.id).single()
  if (!profile?.is_admin) {
    return NextResponse.json({ error: t('adminsOnly') }, { status: 403 })
  }

  const { ok } = rateLimit(`admin:remotive-jobs:${user.id ?? getClientIp()}`, REMOTIVE_LIMIT, REMOTIVE_WINDOW_MS)
  if (!ok) return NextResponse.json({ error: t('tooManyRequests') }, { status: 429 })

  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category') ?? undefined
  const search = searchParams.get('search') ?? undefined

  try {
    const jobs = await fetchRemotiveJobs({ category, search, limit: 50 })
    return NextResponse.json({ jobs })
  } catch (err) {
    console.error('[remotive-jobs]', err)
    return NextResponse.json({ error: t('somethingWentWrong') }, { status: 500 })
  }
}
