import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { getTranslations } from 'next-intl/server'
import { getCandidateProfile } from '@/lib/profile'
import { parseSkillSet, calculateMatchPercent } from '@/lib/jobMatching'
import { applyJobFilters, normalizeJobCompany, parseSort, JOB_SELECT_FIELDS } from '@/lib/jobsQuery'

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
  const remote = searchParams.get('remote') === '1'
  const jobType = searchParams.get('type') ?? 'All'
  const category = searchParams.get('category') ?? 'All'
  const sort = parseSort(searchParams.get('sort'))

  const supabase = createClient()
  let query = supabase
    .from('jobs')
    .select(JOB_SELECT_FIELDS, { count: 'exact' })
    .eq('is_active', true)

  query = applyJobFilters(query, { q, remote, jobType, category, sort })

  const { data: jobs, count, error } = await query.range(from, to)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Real Match % (see app/jobs/page.tsx for the full reasoning) — plain
  // array/set comparison against the candidate's real profile skills, no
  // LLM call, so no rate limiting is warranted; null (badge omitted) for
  // logged-out users or empty profiles, never a fabricated score.
  let skillSet = new Set<string>()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const profile = await getCandidateProfile(supabase, user.id)
    skillSet = parseSkillSet(profile?.skills)
  }

  const jobsWithMatch = (jobs ?? []).map(normalizeJobCompany).map((job) => ({
    ...job,
    matchPercent: calculateMatchPercent(job.tags, skillSet),
  }))

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

  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single()
  if (profile?.role !== 'employer') {
    return NextResponse.json({ error: t('onlyEmployerAccountsCanPostJobs') }, { status: 403 })
  }

  const body = await req.json()
  const { data: job, error } = await supabase
    .from('jobs')
    .insert({ ...body, posted_by: user.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // New post — invalidate every cached /jobs page immediately rather than
  // waiting out the 60s revalidate window (see app/jobs/page.tsx).
  revalidateTag('jobs')

  return NextResponse.json(job, { status: 201 })
}
