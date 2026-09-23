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

// Previously Wellfound — replaced with Remotive public JSON API which has no
// authentication requirement and returns real remote job listings.
// https://remotive.com/api/remote-jobs (public, no key required)
export async function fetchJobs(): Promise<AggregatorJob[]> {
  const res = await fetch(
    'https://remotive.com/api/remote-jobs?limit=20&category=software-dev',
    {
      headers: { 'Accept': 'application/json', 'User-Agent': 'JobConnectAI/1.0' },
      signal: AbortSignal.timeout(7000),
    }
  )

  if (!res.ok) throw new Error(`Remotive responded ${res.status}`)

  const payload = await res.json() as {
    jobs?: Array<{
      title?: string
      company_name?: string
      candidate_required_location?: string
      description?: string
      url?: string
      salary?: string
    }>
  }

  return (payload.jobs ?? []).map((j) => {
    const description = stripHtml(j.description ?? '')
    const { isCrossBorder } = detectCrossBorder(description, j.title ?? '')
    return {
      title:        j.title ?? '',
      company:      j.company_name ?? '',
      location:     j.candidate_required_location || 'Worldwide',
      description,
      url:          j.url ?? '',
      source:       'remotive2',
      salary_min:   null,
      salary_max:   null,
      is_cross_border: isCrossBorder,
    }
  }).filter((j) => j.title && j.url)
}

function stripHtml(html: string): string {
  return html
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ')
    .replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim()
}
