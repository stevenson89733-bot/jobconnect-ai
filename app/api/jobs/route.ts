import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { getTranslations } from 'next-intl/server'
import { getCandidateProfile } from '@/lib/profile'
import { parseSkillSet, calculateMatchPercent } from '@/lib/jobMatching'
import { calculateJobScore } from '@/lib/jobScoring'
import { applyJobFilters, normalizeJobCompany, parseSort, parseCrossBorder, parseTrueRemote, JOB_SELECT_FIELDS } from '@/lib/jobsQuery'
import { employerPlanLimit } from '@/lib/employerPlan'
import { classifyCrossBorder } from '@/lib/ai/crossBorder'
import { analyzeGeoCompliance } from '@/lib/ai/geoAnalysis'

const PAGE_SIZE = 20

// Backs the Jobs page's infinite scroll (page 1 is server-rendered directly
// in app/jobs/page.tsx; this serves page 2+ as the user scrolls). Same
// filters/sort/select as that page — factored into lib/jobsQuery.ts so the
// two never drift apart.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const q = (searchParams.get('q') ?? '').trim()
  const workType = searchParams.get('workType') ?? 'All'
  const jobType = searchParams.get('type') ?? 'All'
  const category = searchParams.get('category') ?? 'All'
  const sort = parseSort(searchParams.get('sort'))
  const crossBorder = parseCrossBorder(searchParams.get('crossBorder'))
  const trueRemote = parseTrueRemote(searchParams.get('trueRemote'))
  const country = searchParams.get('country') ?? ''

  const supabase = createClient()
  let query = supabase
    .from('jobs')
    .select(JOB_SELECT_FIELDS, { count: 'exact' })
    .eq('is_active', true)

  query = applyJobFilters(query, { q, workType, jobType, category, sort, crossBorder, country, trueRemote })

  const { data: jobs, count, error } = await query.range(from, to)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Real Match % (see app/jobs/page.tsx for the full reasoning) — plain
  // array/set comparison against the candidate's real profile skills, no
  // LLM call, so no rate limiting is warranted; null (badge omitted) for
  // logged-out users or empty profiles, never a fabricated score.
  let skillSet = new Set<string>()
  let candidateProfile: Awaited<ReturnType<typeof getCandidateProfile>> = null
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    candidateProfile = await getCandidateProfile(supabase, user.id)
    skillSet = parseSkillSet(candidateProfile?.skills)
  }

  const jobsWithMatch = (jobs ?? []).map(normalizeJobCompany).map((job) => {
    const scoreResult = calculateJobScore(job, candidateProfile)
    return {
      ...job,
      matchPercent: calculateMatchPercent(job.tags, skillSet),
      matchScore: scoreResult?.score ?? null,
      matchDetails: scoreResult?.details ?? null,
    }
  })

  const total = count ?? 0
  return NextResponse.json({
    jobs: jobsWithMatch,
    page,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    total,
  })
}

export async function POST(req: Request) {
  const t = await getTranslations('errors')
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  // Never rendered — PostJobModal redirects to /login on a 401 rather than
  // displaying this text, so it's left untranslated intentionally.
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role, employer_plan, is_unlimited_posting, is_admin').eq('user_id', user.id).single()
  if (!profile?.is_admin && profile?.role !== 'employer') {
    return NextResponse.json({ error: t('onlyEmployerAccountsCanPostJobs') }, { status: 403 })
  }

  // Real, enforced free-tier limit — counts this employer's own currently
  // active postings (not a lifetime cap), so deactivating an old listing
  // frees up a real slot rather than permanently using up their one shot.
  // Bypass limit for unlimited accounts (admin/owner).
  if (!profile?.is_admin && !profile.is_unlimited_posting) {
    const { count: activeCount } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('posted_by', user.id)
      .eq('is_active', true)
    const limit = employerPlanLimit(profile.employer_plan)
    if ((activeCount ?? 0) >= limit) {
      return NextResponse.json(
        { error: t('employerPlanLimitReached', { limit }), code: 'PLAN_LIMIT_REACHED' },
        { status: 403 }
      )
    }
  }

  const body = await req.json()
  const VALID_SOURCES = new Set(['wwr', 'remotive', 'direct', 'arbeitnow', 'adzuna_gb', 'adzuna_au', 'adzuna_fr', 'adzuna_de', 'adzuna_ca', 'adzuna_nl'])
  const source = body.source && VALID_SOURCES.has(body.source) ? body.source : null

  // Deduplication — skip insert if a matching job already exists:
  // 1. Exact apply_url match (fastest — indexed column)
  // 2. Fallback: case-insensitive title + company_name match
  if (body.apply_url) {
    const { data: byUrl } = await supabase
      .from('jobs').select('id').eq('apply_url', body.apply_url).limit(1)
    if (byUrl?.[0]) {
      return NextResponse.json({ deduplicated: true, id: byUrl[0].id }, { status: 200 })
    }
  }
  if (body.title && body.company_name) {
    const { data: byTitle } = await supabase
      .from('jobs').select('id')
      .ilike('title', body.title.trim())
      .ilike('company_name', body.company_name.trim())
      .limit(1)
    if (byTitle?.[0]) {
      return NextResponse.json({ deduplicated: true, id: byTitle[0].id }, { status: 200 })
    }
  }

  const { data: job, error } = await supabase
    .from('jobs')
    .insert({ ...body, source, posted_by: user.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Cross-border remote-friendly classification — only meaningful for
  // work_type='remote' (a hybrid/onsite posting is location-bound by
  // definition, so classifying it would waste a real Mistral call for no
  // real answer). Synchronous: this project has no reliable background-
  // task primitive (no waitUntil usage anywhere else), and posting volume
  // is low enough that the extra ~1-2s latency here matches every other
  // single-LLM-call flow in this app (company summary, Career Coach, etc.).
  // A classification failure never blocks the actual job posting — the
  // real row already exists; cross_border_status just stays null (same
  // "not yet classified" state a pre-migration row would have) rather than
  // erroring the whole request over a non-critical enrichment step.
  if (job.work_type === 'remote') {
    try {
      const classification = await classifyCrossBorder(job.title, job.description ?? '')
      const { data: updated, error: updateError } = await supabase
        .from('jobs')
        .update({
          cross_border_status: classification.status,
          cross_border_reason: classification.reason,
          cross_border_signals: classification.signals.length > 0 ? classification.signals : null,
        })
        .eq('id', job.id)
        .select()
        .single()
      if (!updateError && updated) Object.assign(job, updated)
      else if (updateError) console.error('[jobs/cross-border] update failed:', updateError.message)
    } catch (err) {
      console.error('[jobs/cross-border] classification failed:', err instanceof Error ? err.message : err)
    }

    // Geo-compliance analysis — same pattern as cross-border: synchronous,
    // failure-safe, never blocks the actual job posting response.
    try {
      const geoResult = await analyzeGeoCompliance(job.title, job.description ?? '', job.location ?? '')
      const { data: geoUpdated, error: geoError } = await supabase
        .from('jobs')
        .update({ geo_analysis: geoResult })
        .eq('id', job.id)
        .select()
        .single()
      if (!geoError && geoUpdated) Object.assign(job, geoUpdated)
      else if (geoError) console.error('[jobs/geo-analysis] update failed:', geoError.message)
    } catch (err) {
      console.error('[jobs/geo-analysis] analysis failed:', err instanceof Error ? err.message : err)
    }
  }

  // New post — invalidate every cached /jobs page immediately rather than
  // waiting out the 60s revalidate window (see app/jobs/page.tsx).
  revalidateTag('jobs')

  return NextResponse.json(job, { status: 201 })
}
