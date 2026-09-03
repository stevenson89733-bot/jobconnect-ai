import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { fetchWwrJobs } from '@/lib/wwr'

// CRITIQUE : protégé par CRON_SECRET — jamais exposé à des non-admins.
// Retourne toujours 200 — même sur timeout externe — pour que le cron
// reste vert indépendamment de la disponibilité de la source.

// 30s nécessite Vercel Pro — sur Hobby, cette route reste accessible
// uniquement via le PostJobModal admin (import manuel).
export const maxDuration = 30

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  let imported = 0
  let deduplicated = 0

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
      if (error) console.error('[import-wwr] insert:', error.message)
      else imported++
    }
    return NextResponse.json({ source: 'wwr', imported, deduplicated })
  } catch (err) {
    console.error('[import-wwr] error:', err instanceof Error ? err.message : err)
    return NextResponse.json({ source: 'wwr', imported: 0, deduplicated: 0, error: String(err) })
  }
}
