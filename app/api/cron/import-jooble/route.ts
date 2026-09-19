import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const maxDuration = 10

const LIMIT = 10

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

    for (const j of jobs as Array<{
      title?: string; company?: string; location?: string
      snippet?: string; link?: string; type?: string; updated?: string
    }>) {
      const applyUrl = j.link ?? ''
      const title    = j.title ?? ''
      const company  = j.company ?? ''

      if (!applyUrl || !title) continue

      const { data: byUrl } = await supabase
        .from('jobs').select('id').eq('apply_url', applyUrl).limit(1)
      if (byUrl?.[0]) { deduplicated++; continue }

      const { data: byTitle } = await supabase
        .from('jobs').select('id')
        .ilike('title', title.trim())
        .ilike('company_name', company.trim())
        .limit(1)
      if (byTitle?.[0]) { deduplicated++; continue }

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
