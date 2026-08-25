import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { fetchAndParseRssFeed, WE_WORK_REMOTELY_RSS_URL } from '@/lib/ai/parseRssFeed'
import { JobExtractError } from '@/lib/ai/jobExtract'

const RSS_LIMIT = 5
const RSS_WINDOW_MS = 60 * 60 * 1000 // 1 hour

export async function GET(req: Request) {
  const t = await getTranslations('errors')
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: t('mustBeSignedIn') }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('user_id', user.id).single()
  if (!profile?.is_admin) {
    return NextResponse.json({ error: t('adminsOnly') }, { status: 403 })
  }

  const { ok } = rateLimit(`ai-generate:rss-jobs:${user.id ?? getClientIp()}`, RSS_LIMIT, RSS_WINDOW_MS)
  if (!ok) return NextResponse.json({ error: t('tooManyRequests') }, { status: 429 })

  try {
    const items = await fetchAndParseRssFeed(WE_WORK_REMOTELY_RSS_URL)

    // Return the first 20 items with minimal data
    const jobs = items
      .slice(0, 20)
      .filter(item => item.title && item.link && item.description)
      .map(item => ({
        title: item.title,
        link: item.link,
        description: item.description?.substring(0, 3000),
        pubDate: item.pubDate,
        guid: item.guid,
      }))

    return NextResponse.json({ jobs })
  } catch (err) {
    const status = err instanceof JobExtractError ? err.status : 500
    const message = err instanceof JobExtractError ? err.message : t('somethingWentWrong')
    console.error('[rss-jobs]', message)
    return NextResponse.json({ error: message }, { status })
  }
}
