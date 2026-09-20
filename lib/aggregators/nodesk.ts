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

// NoDesk — remote job board with a public RSS/JSON feed.
// https://nodesk.co/remote-jobs/
export async function fetchJobs(): Promise<AggregatorJob[]> {
  const res = await fetch('https://nodesk.co/remote-jobs/json/', {
    headers: { 'Accept': 'application/json', 'User-Agent': 'JobConnectAI/1.0' },
    signal: AbortSignal.timeout(8000),
  })

  if (!res.ok) throw new Error(`NoDesk responded ${res.status}`)

  const payload = await res.json() as {
    items?: Array<{
      title?: string
      content_text?: string
      url?: string
      tags?: string[]
      _nodesk?: { company?: string; location?: string }
    }>
  }

  return (payload.items ?? []).map((j) => {
    const description = j.content_text ?? ''
    const { isCrossBorder } = detectCrossBorder(description, j.title ?? '')
    return {
      title:        j.title ?? '',
      company:      j._nodesk?.company ?? '',
      location:     j._nodesk?.location ?? 'Remote',
      description,
      url:          j.url ?? '',
      source:       'nodesk',
      salary_min:   null,
      salary_max:   null,
      is_cross_border: isCrossBorder,
    }
  }).filter((j) => j.title && j.url)
}
