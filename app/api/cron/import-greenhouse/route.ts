import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Vercel Hobby cron limit is 10s.
// Strategy: fetch all companies in parallel (Promise.allSettled), cap 5 jobs
// per company, then batch-dedup by URL before inserting.
export const maxDuration = 10

const GREENHOUSE_COMPANIES = [
  'gitlab', 'automattic', 'zapier', 'buffer', 'doist',
  'hotjar', 'toggl', 'remote', 'deel', 'loom',
  'notion', 'linear', 'vercel', 'supabase', 'figma',
  'postman', 'sentry', 'cockroachlabs', 'hashicorp', 'elastic',
]

const JOBS_PER_COMPANY = 5

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch all companies in parallel (each with a tight 5s timeout).
  const results = await Promise.allSettled(
    GREENHOUSE_COMPANIES.map(async (company) => {
      const res = await fetch(
        `https://boards-api.greenhouse.io/v1/boards/${company}/jobs?content=true`,
        { signal: AbortSignal.timeout(5000) }
      )
      if (!res.ok) return { company, jobs: [] as GhJob[] }
      const data = await res.json()
      const jobs: GhJob[] = (data.jobs ?? [])
        .filter((j: GhJob) => j.absolute_url && j.title)
        .slice(0, JOBS_PER_COMPANY)
      return { company, jobs }
    })
  )

  // Flatten all candidates.
  const candidates: Array<{ company: string; job: GhJob }> = []
  for (const r of results) {
    if (r.status === 'fulfilled') {
      for (const job of r.value.jobs) {
        candidates.push({ company: r.value.company, job })
      }
    }
  }

  if (candidates.length === 0) {
    return NextResponse.json({ source: 'greenhouse', imported: 0, deduplicated: 0 })
  }

  const supabase = createAdminClient()

  // Batch dedup: one IN query instead of 2 per job.
  const urls = candidates.map((c) => c.job.absolute_url)
  const { data: existing } = await supabase
    .from('jobs').select('apply_url').in('apply_url', urls)
  const existingUrls = new Set((existing ?? []).map((r) => r.apply_url as string))

  let imported = 0
  let deduplicated = 0

  for (const { company, job } of candidates) {
    if (existingUrls.has(job.absolute_url)) { deduplicated++; continue }

    const { error } = await supabase.from('jobs').insert({
      title:        job.title,
      company_name: company,
      description:  job.content || '',
      location:     job.location?.name || 'Remote',
      work_type:    'remote',
      job_type:     'Full-time',
      category:     'Other',
      tags:         [],
      apply_url:    job.absolute_url,
      source:       'greenhouse',
      salary_min:   null,
      salary_max:   null,
      salary_label: null,
      is_active:    true,
      posted_by:    null,
    })

    if (error) console.error(`[import-greenhouse] ${company}:`, error.message)
    else imported++
  }

  return NextResponse.json({ source: 'greenhouse', imported, deduplicated })
}

interface GhJob {
  title: string
  absolute_url: string
  content?: string
  location?: { name?: string }
}
