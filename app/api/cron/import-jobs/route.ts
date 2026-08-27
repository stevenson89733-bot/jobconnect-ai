import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { fetchAdzunaJobs, ADZUNA_COUNTRIES, adzunaSourceKey } from '@/lib/adzuna'
import { fetchArbeitnowJobs, mapArbeitnowJobType } from '@/lib/arbeitnow'
import { fetchRemotiveJobs, mapRemotiveCategory, mapRemotiveJobType, parseRemotiveSalary } from '@/lib/remotive'
import type { AdzunaCountryCode } from '@/lib/adzuna'

const JOBS_PER_SOURCE = 50

type ImportResult = {
  source: string
  fetched: number
  inserted: number
  skipped: number
  error?: string
}

function salaryLabel(min: number | null, max: number | null): string | null {
  if (!min || !max) return null
  return `$${Math.round(min / 1000)}k–$${Math.round(max / 1000)}k`
}

async function deduplicateByApplyUrl(
  supabase: ReturnType<typeof createAdminClient>,
  applyUrls: string[],
): Promise<Set<string>> {
  if (applyUrls.length === 0) return new Set()
  const { data } = await supabase
    .from('jobs')
    .select('apply_url')
    .in('apply_url', applyUrls)
  return new Set((data ?? []).map((r: { apply_url: string }) => r.apply_url))
}

async function importAdzunaCountry(
  supabase: ReturnType<typeof createAdminClient>,
  country: AdzunaCountryCode,
): Promise<ImportResult> {
  const source = adzunaSourceKey(country)
  try {
    const jobs = await fetchAdzunaJobs({ country, resultsPerPage: JOBS_PER_SOURCE })
    const applyUrls = jobs.map((j) => j.redirect_url).filter(Boolean)
    const existing = await deduplicateByApplyUrl(supabase, applyUrls)

    const newJobs = jobs.filter((j) => j.redirect_url && !existing.has(j.redirect_url))
    if (newJobs.length === 0) {
      return { source, fetched: jobs.length, inserted: 0, skipped: jobs.length }
    }

    const rows = newJobs.map((j) => ({
      title: j.title,
      company_name: j.company_name,
      location: j.location || 'Remote',
      work_type: 'remote',
      job_type: 'Full-time',
      category: 'Engineering',
      description: j.description,
      salary_min: j.salary_min,
      salary_max: j.salary_max,
      salary_label: salaryLabel(j.salary_min, j.salary_max),
      tags: [],
      apply_url: j.redirect_url,
      source,
      posted_by: null,
      is_featured: false,
    }))

    const { error } = await supabase.from('jobs').insert(rows)
    if (error) throw new Error(error.message)

    return { source, fetched: jobs.length, inserted: newJobs.length, skipped: existing.size }
  } catch (err) {
    return { source, fetched: 0, inserted: 0, skipped: 0, error: err instanceof Error ? err.message : String(err) }
  }
}

async function importArbeitnow(
  supabase: ReturnType<typeof createAdminClient>,
): Promise<ImportResult> {
  const source = 'arbeitnow'
  try {
    const jobs = await fetchArbeitnowJobs({ limit: JOBS_PER_SOURCE })
    const applyUrls = jobs.map((j) => j.url).filter(Boolean)
    const existing = await deduplicateByApplyUrl(supabase, applyUrls)

    const newJobs = jobs.filter((j) => j.url && !existing.has(j.url))
    if (newJobs.length === 0) {
      return { source, fetched: jobs.length, inserted: 0, skipped: jobs.length }
    }

    const rows = newJobs.map((j) => ({
      title: j.title,
      company_name: j.company_name,
      location: j.location || 'Remote, Worldwide',
      work_type: 'remote',
      job_type: mapArbeitnowJobType(j.job_types),
      category: 'Engineering',
      description: j.description,
      salary_min: null,
      salary_max: null,
      salary_label: null,
      tags: j.tags,
      apply_url: j.url,
      source,
      posted_by: null,
      is_featured: false,
    }))

    const { error } = await supabase.from('jobs').insert(rows)
    if (error) throw new Error(error.message)

    return { source, fetched: jobs.length, inserted: newJobs.length, skipped: existing.size }
  } catch (err) {
    return { source, fetched: 0, inserted: 0, skipped: 0, error: err instanceof Error ? err.message : String(err) }
  }
}

async function importRemotive(
  supabase: ReturnType<typeof createAdminClient>,
): Promise<ImportResult> {
  const source = 'remotive'
  try {
    const jobs = await fetchRemotiveJobs({ limit: JOBS_PER_SOURCE })
    const applyUrls = jobs.map((j) => j.url).filter(Boolean)
    const existing = await deduplicateByApplyUrl(supabase, applyUrls)

    const newJobs = jobs.filter((j) => j.url && !existing.has(j.url))
    if (newJobs.length === 0) {
      return { source, fetched: jobs.length, inserted: 0, skipped: jobs.length }
    }

    const rows = newJobs.map((j) => {
      const { min, max } = parseRemotiveSalary(j.salary)
      const minN = min ? parseInt(min, 10) : null
      const maxN = max ? parseInt(max, 10) : null
      return {
        title: j.title,
        company_name: j.company_name,
        location: j.candidate_required_location || 'Remote, Worldwide',
        work_type: 'remote',
        job_type: mapRemotiveJobType(j.job_type),
        category: mapRemotiveCategory(j.category),
        description: j.description,
        salary_min: minN,
        salary_max: maxN,
        salary_label: salaryLabel(minN, maxN),
        tags: j.tags,
        apply_url: j.url,
        source,
        posted_by: null,
        is_featured: false,
      }
    })

    const { error } = await supabase.from('jobs').insert(rows)
    if (error) throw new Error(error.message)

    return { source, fetched: jobs.length, inserted: newJobs.length, skipped: existing.size }
  } catch (err) {
    return { source, fetched: 0, inserted: 0, skipped: 0, error: err instanceof Error ? err.message : String(err) }
  }
}

export async function POST(req: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  }

  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const started = Date.now()

  const results = await Promise.allSettled([
    ...ADZUNA_COUNTRIES.map((c) => importAdzunaCountry(supabase, c.code)),
    importArbeitnow(supabase),
    importRemotive(supabase),
  ])

  const summary: ImportResult[] = results.map((r) =>
    r.status === 'fulfilled'
      ? r.value
      : { source: 'unknown', fetched: 0, inserted: 0, skipped: 0, error: String(r.reason) }
  )

  const totalInserted = summary.reduce((acc, r) => acc + r.inserted, 0)
  const errors = summary.filter((r) => r.error)

  return NextResponse.json(
    {
      ok: true,
      duration_ms: Date.now() - started,
      total_inserted: totalInserted,
      results: summary,
      ...(errors.length > 0 && { errors: errors.map((e) => ({ source: e.source, error: e.error })) }),
    },
    { status: 200 }
  )
}
