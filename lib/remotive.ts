const REMOTIVE_API_URL = 'https://remotive.com/api/remote-jobs'
const FETCH_TIMEOUT_MS = 8000

export interface RemotiveJob {
  id: number
  title: string
  company_name: string
  category: string
  tags: string[]
  job_type: string
  publication_date: string
  candidate_required_location: string
  salary: string
  description: string  // HTML stripped server-side
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

export async function fetchRemotiveJobs({
  category,
  search,
  limit = 50,
}: {
  category?: string
  search?: string
  limit?: number
} = {}): Promise<RemotiveJob[]> {
  const url = new URL(REMOTIVE_API_URL)
  if (category) url.searchParams.set('category', category)
  if (search) url.searchParams.set('search', search)
  url.searchParams.set('limit', String(limit))

  const res = await fetch(url.toString(), {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; JobConnectBot/1.0)',
      Accept: 'application/json',
    },
  })

  if (!res.ok) {
    throw new Error(`Remotive API returned ${res.status}`)
  }

  const data = await res.json()
  return (data.jobs ?? []).map((j: Record<string, unknown>) => ({
    id: j.id,
    title: String(j.title ?? ''),
    company_name: String(j.company_name ?? ''),
    category: String(j.category ?? ''),
    tags: Array.isArray(j.tags) ? (j.tags as string[]) : [],
    job_type: String(j.job_type ?? 'full_time'),
    publication_date: String(j.publication_date ?? ''),
    candidate_required_location: String(j.candidate_required_location ?? 'Worldwide'),
    salary: String(j.salary ?? ''),
    description: stripHtml(String(j.description ?? '')),
    url: String(j.url ?? ''),
  }))
}

export function mapRemotiveCategory(cat: string): string {
  const lc = cat.toLowerCase()
  if (lc.includes('software') || lc.includes('devops') || lc.includes('sysadmin') || lc.includes('qa')) return 'Engineering'
  if (lc.includes('design')) return 'Design'
  if (lc.includes('data') || lc.includes('analytics')) return 'Data'
  if (lc.includes('research')) return 'Research'
  if (lc.includes('developer relation')) return 'Developer Relations'
  if (lc.includes('writing') || lc.includes('content')) return 'Content'
  return 'Engineering'
}

export function mapRemotiveJobType(jt: string): string {
  if (jt === 'part_time') return 'Part-time'
  if (jt === 'contract' || jt === 'freelance') return 'Contract'
  return 'Full-time'
}

export function parseRemotiveSalary(salaryStr: string): { min: string; max: string } {
  if (!salaryStr) return { min: '', max: '' }
  const cleaned = salaryStr.replace(/,/g, '').replace(/k/gi, '000')
  const numbers = cleaned.match(/\d+/g)
  if (numbers && numbers.length >= 2) {
    return { min: numbers[0], max: numbers[1] }
  }
  return { min: '', max: '' }
}
