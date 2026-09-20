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

// Careerjet affiliate API — requires CAREERJET_AFFILIATE_ID env var.
// Docs: https://www.careerjet.com/partners/api/
export async function fetchJobs(): Promise<AggregatorJob[]> {
  const affiliateId = process.env.CAREERJET_AFFILIATE_ID
  if (!affiliateId) {
    console.warn('[careerjet] CAREERJET_AFFILIATE_ID not set — skipping')
    return []
  }

  const params = new URLSearchParams({
    affid: affiliateId,
    keywords: 'remote',
    location: '',
    sort: 'date',
    pagesize: '20',
    page: '1',
    contracttype: 'p',
    user_ip: '1.2.3.4',
    user_agent: 'JobConnectAI/1.0',
    url: 'https://jobconnect-ai.com',
  })

  const res = await fetch(`http://public.api.careerjet.com/search?${params}`, {
    signal: AbortSignal.timeout(8000),
  })

  if (!res.ok) throw new Error(`Careerjet responded ${res.status}`)

  const payload = await res.json() as {
    jobs?: Array<{
      title?: string
      company?: string
      locations?: string
      description?: string
      url?: string
      salary_min?: number
      salary_max?: number
    }>
  }

  return (payload.jobs ?? []).map((j) => {
    const description = j.description ?? ''
    const { isCrossBorder } = detectCrossBorder(description, j.title ?? '')
    return {
      title:        j.title ?? '',
      company:      j.company ?? '',
      location:     j.locations ?? 'Remote',
      description,
      url:          j.url ?? '',
      source:       'careerjet',
      salary_min:   j.salary_min ?? null,
      salary_max:   j.salary_max ?? null,
      is_cross_border: isCrossBorder,
    }
  }).filter((j) => j.title && j.url)
}
