import { detectCrossBorder } from '@/lib/crossBorderDetector'

export type AggregatorJob = {
  title: string
  company: string
  location: string
  description: string
  url: string
  source: string
  salary_min?: number | null
  salary_max?: number | null
  is_cross_border?: boolean
}

// Remote.co — curated remote job board. Uses the RSS feed (JSON Feed v1 at
// /remote-jobs/feed/ does not exist publicly; the RSS is the stable endpoint).
export async function fetchJobs(): Promise<AggregatorJob[]> {
  const res = await fetch('https://remote.co/remote-jobs/feed/', {
    headers: { 'User-Agent': 'JobConnectAI/1.0', Accept: 'application/rss+xml, text/xml' },
    signal: AbortSignal.timeout(6000),
  })

  if (!res.ok) throw new Error(`Remote.co responded ${res.status}`)

  const xml = await res.text()
  const jobs: AggregatorJob[] = []

  for (const m of xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)) {
    const item = m[1]
    const title   = extractTag(item, 'title')
    const link    = extractTag(item, 'link') ?? extractTag(item, 'guid')
    const desc    = extractTag(item, 'description') ?? ''
    const creator = extractTag(item, 'dc:creator') ?? ''
    if (!title || !link) continue
    const { isCrossBorder } = detectCrossBorder(desc, title)
    jobs.push({
      title,
      company:  creator,
      location: 'Remote',
      description: desc,
      url:      link,
      source:   'remoteco',
      salary_min: null,
      salary_max: null,
      is_cross_border: isCrossBorder,
    })
  }
  return jobs
}

function extractTag(xml: string, tag: string): string | null {
  const m = xml.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, 'i'))
  if (!m?.[1]) return null
  const inner = m[1].match(/<!\[CDATA\[([\s\S]*?)\]\]>/)
  const text = inner ? inner[1] : m[1]
  return text.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ')
    .replace(/[ \t]+/g, ' ').trim() || null
}
