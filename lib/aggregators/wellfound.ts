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

// Wellfound (formerly AngelList Talent) — scrapes the public JSON feed for
// remote startup roles. No API key required for the public listing endpoint.
export async function fetchJobs(): Promise<AggregatorJob[]> {
  const res = await fetch(
    'https://wellfound.com/jobs/search?remote=true&role=engineer&format=json',
    {
      headers: { 'Accept': 'application/json', 'User-Agent': 'JobConnectAI/1.0' },
      signal: AbortSignal.timeout(8000),
    }
  )

  if (!res.ok) throw new Error(`Wellfound responded ${res.status}`)

  const payload = await res.json() as {
    jobs?: Array<{
      title?: string
      company?: { name?: string }
      remote?: boolean
      location?: string
      description?: string
      apply_url?: string
      compensation?: { min?: number; max?: number }
    }>
  }

  return (payload.jobs ?? []).map((j) => {
    const description = j.description ?? ''
    const { isCrossBorder } = detectCrossBorder(description, j.title ?? '')
    const comp = j.compensation
    return {
      title:        j.title ?? '',
      company:      j.company?.name ?? '',
      location:     j.remote ? 'Remote' : (j.location ?? 'Remote'),
      description,
      url:          j.apply_url ?? '',
      source:       'wellfound',
      salary_min:   comp?.min ?? null,
      salary_max:   comp?.max ?? null,
      is_cross_border: isCrossBorder,
    }
  }).filter((j) => j.title && j.url)
}
