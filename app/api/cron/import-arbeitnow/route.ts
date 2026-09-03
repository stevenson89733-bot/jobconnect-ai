import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { fetchArbeitnowJobs, mapArbeitnowJobType } from '@/lib/arbeitnow'

// CRITIQUE : protégé par CRON_SECRET — jamais exposé à des non-admins.
// Conçu pour tenir dans le timeout Vercel Hobby (10s) :
// pas d'enrichissement IA, 15 offres max par appel.

export const maxDuration = 10

const LIMIT = 15

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
    const jobs = await fetchArbeitnowJobs({ limit: LIMIT })
    for (const j of jobs) {
      const { data: byUrl } = await supabase
        .from('jobs').select('id').eq('apply_url', j.url).limit(1)
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
        location: j.location,
        work_type: 'remote',
        job_type: mapArbeitnowJobType(j.job_types),
        category: 'Engineering',
        tags: j.tags.slice(0, 10),
        apply_url: j.url,
        source: 'arbeitnow',
        salary_min: null,
        salary_max: null,
        salary_label: null,
        is_active: true,
        posted_by: null,
      })
      if (error) { errors++; console.error('[import-arbeitnow]', error.message) }
      else imported++
    }
  } catch (err) {
    errors++
    console.error('[import-arbeitnow] fetch error:', err instanceof Error ? err.message : err)
  }

  return NextResponse.json({ source: 'arbeitnow', imported, deduplicated, errors })
}
