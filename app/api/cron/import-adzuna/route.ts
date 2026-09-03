import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { fetchAdzunaJobs, adzunaSourceKey, ADZUNA_COUNTRIES, type AdzunaCountryCode } from '@/lib/adzuna'

// CRITIQUE : protégé par CRON_SECRET — jamais exposé à des non-admins.
// Un pays par appel (?country=gb|au|fr|de|ca|nl) pour tenir dans 10s Vercel Hobby.

export const maxDuration = 10

const LIMIT = 15
const VALID_COUNTRIES = new Set<string>(ADZUNA_COUNTRIES.map((c) => c.code))

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const country = searchParams.get('country') ?? ''
  if (!VALID_COUNTRIES.has(country)) {
    return NextResponse.json(
      { error: `Invalid country. Valid values: ${[...VALID_COUNTRIES].join(', ')}` },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()
  let imported = 0
  let deduplicated = 0
  let errors = 0

  try {
    const jobs = await fetchAdzunaJobs({ country: country as AdzunaCountryCode, resultsPerPage: LIMIT })
    for (const j of jobs) {
      const { data: byUrl } = await supabase
        .from('jobs').select('id').eq('apply_url', j.redirect_url).limit(1)
      if (byUrl?.[0]) { deduplicated++; continue }

      const { data: byTitle } = await supabase
        .from('jobs').select('id')
        .ilike('title', j.title.trim())
        .ilike('company_name', j.company_name.trim())
        .limit(1)
      if (byTitle?.[0]) { deduplicated++; continue }

      const salaryLabel =
        j.salary_min && j.salary_max
          ? `${Math.round(j.salary_min / 1000)}k–${Math.round(j.salary_max / 1000)}k/yr`
          : null

      const { error } = await supabase.from('jobs').insert({
        title: j.title,
        company_name: j.company_name,
        description: j.description,
        location: j.location,
        work_type: 'remote',
        job_type: 'Full-time',
        category: 'Engineering',
        tags: [],
        apply_url: j.redirect_url,
        source: adzunaSourceKey(country as AdzunaCountryCode),
        salary_min: j.salary_min,
        salary_max: j.salary_max,
        salary_label: salaryLabel,
        is_active: true,
        posted_by: null,
      })
      if (error) { errors++; console.error('[import-adzuna]', error.message) }
      else imported++
    }
  } catch (err) {
    errors++
    console.error(`[import-adzuna/${country}] fetch error:`, err instanceof Error ? err.message : err)
  }

  return NextResponse.json({ source: `adzuna_${country}`, country, imported, deduplicated, errors })
}
