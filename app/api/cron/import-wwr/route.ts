import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { fetchWwrJobs } from '@/lib/wwr'

// CRITIQUE : protégé par CRON_SECRET — jamais exposé à des non-admins.
// RSS WWR est plus léger que les APIs JSON, répond généralement en 1-2s.

export const maxDuration = 10

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  let imported = 0
  let deduplicated = 0
  let errors = 0

  try {
    const jobs = await fetchWwrJobs({ limit: 15, timeoutMs: 5000 })
    for (const j of jobs) {
      const { data: byUrl } = await supabase
        .from('jobs').select('id').eq('apply_url', j.apply_url).limit(1)
      if (byUrl?.[0]) { deduplicated++; continue }

      const { data: byTitle } = await supabase
        .from('jobs').select('id')
        .ilike('title', j.title.trim())
        .ilike('company_name', j.company_name.trim())
        .limit(1)
      if (byTitle?.[0]) { deduplicated++; continue }

      const { error } = await supabase.from('jobs').insert({
        title: j.title,
        company_name: j.company_name,
        description: j.description,
        location: 'Worldwide',
        work_type: 'remote',
        job_type: 'Full-time',
        category: 'Engineering',
        tags: [],
        apply_url: j.apply_url,
        source: 'wwr',
        salary_min: null,
        salary_max: null,
        salary_label: null,
        is_active: true,
        posted_by: null,
      })
      if (error) { errors++; console.error('[import-wwr]', error.message) }
      else imported++
    }
  } catch (err) {
    // Timeout ou erreur réseau — retourner 200 avec ce qu'on a plutôt que 504
    console.error('[import-wwr] fetch error:', err instanceof Error ? err.message : err)
    errors++
  }

  return NextResponse.json({ source: 'wwr', imported, deduplicated, errors })
}
