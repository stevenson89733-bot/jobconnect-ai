const ARBEITNOW_API_URL = 'https://www.arbeitnow.com/api/job-board-api'
const FETCH_TIMEOUT_MS = 8000

export interface ArbeitnowJob {
  slug: string
  company_name: string
  title: string
  description: string  // HTML stripped server-side
  remote: boolean
  tags: string[]
  job_types: string[]
  location: string
  created_at: number  // Unix timestamp
  url: string
}

function stripHtml(html: string): string {
  return html
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export async function fetchArbeitnowJobs({
  page = 1,
  limit = 50,
}: {
  page?: number
  limit?: number
} = {}): Promise<ArbeitnowJob[]> {
  const url = new URL(ARBEITNOW_API_URL)
  url.searchParams.set('page', String(page))

  const res = await fetch(url.toString(), {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; JobConnectBot/1.0)',
      Accept: 'application/json',
    },
  })

  if (!res.ok) {
    throw new Error(`Arbeitnow API returned ${res.status}`)
  }

  const data = await res.json()
  const jobs: ArbeitnowJob[] = (data.data ?? [])
    .filter((j: Record<string, unknown>) => j.remote === true)
    .slice(0, limit)
    .map((j: Record<string, unknown>) => ({
      slug: String(j.slug ?? ''),
      company_name: String(j.company_name ?? ''),
      title: String(j.title ?? ''),
      description: stripHtml(String(j.description ?? '')),
      remote: true,
      tags: Array.isArray(j.tags) ? (j.tags as string[]) : [],
      job_types: Array.isArray(j.job_types) ? (j.job_types as string[]) : [],
      location: String(j.location ?? 'Worldwide'),
      created_at: typeof j.created_at === 'number' ? j.created_at : 0,
      url: String(j.url ?? ''),
    }))

  return jobs
}

export function mapArbeitnowJobType(jobTypes: string[]): string {
  const jt = jobTypes[0] ?? ''
  if (jt === 'part_time') return 'Part-time'
  if (jt === 'contract' || jt === 'freelance') return 'Contract'
  return 'Full-time'
}
