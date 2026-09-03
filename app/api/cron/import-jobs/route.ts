import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { fetchArbeitnowJobs, mapArbeitnowJobType } from '@/lib/arbeitnow'
import { fetchAdzunaJobs, adzunaSourceKey, ADZUNA_COUNTRIES, type AdzunaCountryCode } from '@/lib/adzuna'
import { classifyCrossBorder } from '@/lib/ai/crossBorder'
import { analyzeGeoCompliance } from '@/lib/ai/geoAnalysis'

// CRITIQUE : route protégée par CRON_SECRET — jamais exposée à des non-admins.
// Appelée exclusivement par GitHub Actions (GET + Authorization: Bearer header).

export const maxDuration = 60

// AI enrichment capped per run to stay within the 60s budget.
// Unenriched jobs (geo_analysis IS NULL) will be picked up on the next run.
const MAX_ENRICH_PER_RUN = 12

type JobInsert = {
  title: string
  company_name: string
  description: string
  location: string
  work_type: 'remote'
  job_type: string
  category: string
  tags: string[]
  apply_url: string
  source: string
  salary_min: number | null
  salary_max: number | null
  salary_label: string | null
  is_active: true
  posted_by: null
}

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  const secret = process.env.CRON_SECRET
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  let imported = 0
  let deduplicated = 0
  let errors = 0
  const newJobIds: string[] = []

  async function upsertJob(data: JobInsert): Promise<string | null> {
    // Dedup by apply_url (indexed — fast)
    const { data: byUrl } = await supabase
      .from('jobs').select('id').eq('apply_url', data.apply_url).limit(1)
    if (byUrl?.[0]) { deduplicated++; return null }

    // Dedup by title + company_name (case-insensitive)
    const { data: byTitle } = await supabase
      .from('jobs').select('id')
      .ilike('title', data.title.trim())
      .ilike('company_name', data.company_name.trim())
      .limit(1)
    if (byTitle?.[0]) { deduplicated++; return null }

    const { data: job, error } = await supabase
      .from('jobs').insert(data).select('id').single()
    if (error) {
      errors++
      console.error('[cron/import-jobs] insert error:', error.message, data.apply_url)
      return null
    }
    imported++
    return job.id
  }

  // ── Arbeitnow ─────────────────────────────────────────────────────────────
  try {
    const jobs = await fetchArbeitnowJobs({ limit: 50 })
    for (const j of jobs) {
      const id = await upsertJob({
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
      if (id) newJobIds.push(id)
    }
  } catch (err) {
    errors++
    console.error('[cron/import-jobs] Arbeitnow fetch error:', err instanceof Error ? err.message : err)
  }

  // ── Adzuna (all countries) ─────────────────────────────────────────────────
  for (const { code } of ADZUNA_COUNTRIES) {
    try {
      const jobs = await fetchAdzunaJobs({ country: code as AdzunaCountryCode, resultsPerPage: 50 })
      for (const j of jobs) {
        const salaryLabel =
          j.salary_min && j.salary_max
            ? `${Math.round(j.salary_min / 1000)}k–${Math.round(j.salary_max / 1000)}k/yr`
            : null
        const id = await upsertJob({
          title: j.title,
          company_name: j.company_name,
          description: j.description,
          location: j.location,
          work_type: 'remote',
          job_type: 'Full-time',
          category: 'Engineering',
          tags: [],
          apply_url: j.redirect_url,
          source: adzunaSourceKey(code as AdzunaCountryCode),
          salary_min: j.salary_min,
          salary_max: j.salary_max,
          salary_label: salaryLabel,
          is_active: true,
          posted_by: null,
        })
        if (id) newJobIds.push(id)
      }
    } catch (err) {
      errors++
      console.error(`[cron/import-jobs] Adzuna ${code} error:`, err instanceof Error ? err.message : err)
    }
  }

  // ── AI enrichment (crossBorder + geoAnalysis) for new jobs ────────────────
  // Capped at MAX_ENRICH_PER_RUN to stay within the 60s budget.
  // The two AI calls per job are fired concurrently (Promise.allSettled).
  const toEnrich = newJobIds.slice(0, MAX_ENRICH_PER_RUN)
  let enriched = 0
  for (const jobId of toEnrich) {
    try {
      const { data: job } = await supabase
        .from('jobs').select('title, description, location').eq('id', jobId).single()
      if (!job) continue

      await Promise.allSettled([
        classifyCrossBorder(job.title, job.description ?? '').then(async (c) => {
          await supabase.from('jobs').update({
            cross_border_status: c.status,
            cross_border_reason: c.reason,
            cross_border_signals: c.signals.length > 0 ? c.signals : null,
          }).eq('id', jobId)
        }),
        analyzeGeoCompliance(job.title, job.description ?? '', job.location ?? '').then(async (g) => {
          await supabase.from('jobs').update({ geo_analysis: g }).eq('id', jobId)
        }),
      ])
      enriched++
    } catch (err) {
      console.error('[cron/import-jobs] enrich error:', err instanceof Error ? err.message : err)
    }
  }

  const enrichPending = newJobIds.length - toEnrich.length
  console.log(`[cron/import-jobs] imported=${imported} deduplicated=${deduplicated} errors=${errors} enriched=${enriched} enrichPending=${enrichPending}`)

  return NextResponse.json({ imported, deduplicated, errors, enriched, enrichPending })
}
