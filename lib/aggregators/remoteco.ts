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

// Remote.co — curated remote job board with a public JSON feed.
// https://remote.co/remote-jobs/
export async function fetchJobs(): Promise<AggregatorJob[]> {
  const res = await fetch('https://remote.co/remote-jobs/feed/json', {
    headers: { 'Accept': 'application/json', 'User-Agent': 'JobConnectAI/1.0' },
    signal: AbortSignal.timeout(8000),
  })

  if (!res.ok) throw new Error(`Remote.co responded ${res.status}`)

  const payload = await res.json() as {
    items?: Array<{
      title?: string
      content_html?: string
      content_text?: string
      url?: string
      author?: { name?: string }
      tags?: string[]
    }>
  }

  return (payload.items ?? []).map((j) => {
    const description = j.content_text ?? j.content_html ?? ''
    const { isCrossBorder } = detectCrossBorder(description, j.title ?? '')
    return {
      title:        j.title ?? '',
      company:      j.author?.name ?? '',
      location:     'Remote',
      description,
      url:          j.url ?? '',
      source:       'remoteco',
      salary_min:   null,
      salary_max:   null,
      is_cross_border: isCrossBorder,
    }
  }).filter((j) => j.title && j.url)
}
