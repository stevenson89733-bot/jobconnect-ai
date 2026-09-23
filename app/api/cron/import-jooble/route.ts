import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const maxDuration = 10

const LIMIT = 20

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.JOOBLE_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'JOOBLE_API_KEY is not set' }, { status: 500 })
  }

  const supabase = createAdminClient()
  let imported = 0
  let deduplicated = 0

  try {
    const res = await fetch(`https://jooble.org/api/${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywords: 'remote', location: '', page: '1' }),
      signal: AbortSignal.timeout(6000),
    })

    if (!res.ok) {
      throw new Error(`Jooble responded ${res.status}`)
    }

    const payload = await res.json() as { totalCount?: number; jobs?: Record<string, unknown>[] }
    const jobs = (payload.jobs ?? []).slice(0, LIMIT)

    type JoobleJob = { title?: string; company?: string; location?: string; snippet?: string; link?: string; type?: string }
    const validJobs = (jobs as JoobleJob[]).filter((j) => j.link && j.title)

    // Batch dedup: one IN query instead of 2 per job.
    const urls = validJobs.map((j) => j.link as string)
    const { data: existing } = await supabase.from('jobs').select('apply_url').in('apply_url', urls)
    const existingUrls = new Set((existing ?? []).map((r: { apply_url: string }) => r.apply_url))

    for (const j of validJobs) {
      const applyUrl = j.link as string
      const title    = j.title as string
      const company  = j.company ?? ''

      if (existingUrls.has(applyUrl)) { deduplicated++; continue }

      const { error } = await supabase.from('jobs').insert({
        title,
        company_name: company,
        description: j.snippet ?? '',
        location: j.location || 'Remote',
        work_type: 'remote',
        job_type: j.type || 'Full-time',
        category: 'Engineering',
        tags: [],
        apply_url: applyUrl,
        source: 'jooble',
        salary_min: null,
        salary_max: null,
        salary_label: null,
        is_active: true,
        posted_by: null,
      })
      if (error) console.error('[import-jooble] insert:', error.message)
      else imported++
    }

    return NextResponse.json({ source: 'jooble', imported, deduplicated })
  } catch (err) {
    console.error('[import-jooble] error:', err instanceof Error ? err.message : err)
    return NextResponse.json({ source: 'jooble', imported: 0, deduplicated: 0, error: String(err) })
  }
}
