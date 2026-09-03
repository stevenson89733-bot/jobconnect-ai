// WeWorkRemotely RSS fetcher — conçu pour le cron (timeout court, parsing léger).
// Pas de dépendance à lib/ai/parseRssFeed.ts qui hardcode un timeout de 8s.

const WWR_RSS_URL = 'https://weworkremotely.com/remote-jobs.rss'

export interface WwrJob {
  title: string
  company_name: string
  apply_url: string
  description: string | null
}

// WWR RSS title format: "[Category] Company Name: Job Title"
function parseWwrTitle(raw: string): { title: string; company: string } {
  const withoutCategory = raw.replace(/^\[.*?\]\s*/, '').trim()
  const colonIdx = withoutCategory.indexOf(':')
  if (colonIdx > 0) {
    return {
      company: withoutCategory.slice(0, colonIdx).trim(),
      title: withoutCategory.slice(colonIdx + 1).trim(),
    }
  }
  return { company: 'Unknown', title: withoutCategory }
}

function extractTag(xml: string, tag: string): string | null {
  const m = xml.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, 'i'))
  if (!m?.[1]) return null
  // Unwrap CDATA
  const inner = m[1].match(/<!\[CDATA\[([\s\S]*?)\]\]>/)
  const text = inner ? inner[1] : m[1]
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim() || null
}

function parseRssItems(xml: string, limit: number): WwrJob[] {
  const jobs: WwrJob[] = []
  for (const m of xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)) {
    if (jobs.length >= limit) break
    const item = m[1]
    const rawTitle = extractTag(item, 'title')
    // WWR items use <guid> as the canonical apply link (not <link>)
    const applyUrl = extractTag(item, 'guid') ?? extractTag(item, 'link')
    if (!rawTitle || !applyUrl) continue
    const { title, company } = parseWwrTitle(rawTitle)
    jobs.push({
      title,
      company_name: company,
      apply_url: applyUrl,
      description: extractTag(item, 'description'),
    })
  }
  return jobs
}

export async function fetchWwrJobs({
  limit = 15,
  timeoutMs = 5000,
}: {
  limit?: number
  timeoutMs?: number
} = {}): Promise<WwrJob[]> {
  const res = await fetch(WWR_RSS_URL, {
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; JobConnectBot/1.0)',
      Accept: 'application/rss+xml, application/xml, text/xml',
    },
  })
  if (!res.ok) throw new Error(`WWR RSS returned ${res.status}`)
  const xml = await res.text()
  return parseRssItems(xml, limit)
}
