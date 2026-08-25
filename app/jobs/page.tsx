import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/public'
import { createClient } from '@/lib/supabase/server'
import { getCandidateProfile } from '@/lib/profile'
import { parseSkillSet, calculateMatchPercent } from '@/lib/jobMatching'
import { calculateJobScore } from '@/lib/jobScoring'
import { applyJobFilters, normalizeJobCompany, parseSort, parseCrossBorder, JOB_SELECT_FIELDS, type JobFilters } from '@/lib/jobsQuery'
import { absoluteUrl } from '@/lib/seo'
import JobsClient from './JobsClient'

const PAGE_SIZE = 20
export type { SortOption } from '@/lib/jobsQuery'

export const metadata: Metadata = {
  title: 'Browse Remote Jobs | JobConnect AI',
  description: 'Search real remote job openings by keyword, category, and job type — from AI Engineering to Design, Data, and Developer Relations.',
  alternates: { canonical: absoluteUrl('/jobs') },
  openGraph: {
    title: 'Browse Remote Jobs | JobConnect AI',
    description: 'Search real remote job openings by keyword, category, and job type.',
    url: absoluteUrl('/jobs'),
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Browse Remote Jobs | JobConnect AI',
    description: 'Search real remote job openings by keyword, category, and job type.',
  },
}

// Cached independently per unique combination of filters/page — see
// lib/supabase/public.ts for why this can't use the cookie-based server
// client. Tagged 'jobs' so POST /api/jobs can invalidate every cached
// variant immediately on a new post instead of waiting out the 60s window.
// Deliberately has NO candidate-specific data (no match %) — that's
// computed fresh per-request below, outside the cache, so it's never
// leaked across different users.
const getJobsPage = unstable_cache(
  async ({ q, workType, jobType, category, sort, crossBorder, country, page }: JobFilters & { page: number }) => {
    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const supabase = createPublicClient()
    let query = supabase
      .from('jobs')
      // Real company logo via the real company_id relationship — null for
      // every job right now (companies table has no rows yet), so the
      // client always falls back to an initials avatar until real company
      // rows with logo_url exist. Never a stock/generic logo.
      .select(JOB_SELECT_FIELDS, { count: 'exact' })
      .eq('is_active', true)

    query = applyJobFilters(query, { q, workType, jobType, category, sort, crossBorder, country })

    const { data: jobs, count, error } = await query.range(from, to)

    if (error) {
      console.error('Failed to fetch jobs:', error.message)
    }

    return { jobs: (jobs ?? []).map(normalizeJobCompany), total: count ?? 0 }
  },
  ['jobs-page'],
  { revalidate: 60, tags: ['jobs'] }
)

export default async function JobsPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string; workType?: string; type?: string; category?: string; sort?: string; crossBorder?: string; country?: string }
}) {
  const q = (searchParams.q ?? '').trim()
  const workType = searchParams.workType ?? 'All'
  const jobType = searchParams.type ?? 'All'
  const category = searchParams.category ?? 'All'
  const sort = parseSort(searchParams.sort)
  const crossBorder = parseCrossBorder(searchParams.crossBorder)
  const country = searchParams.country ?? ''

  const { jobs, total } = await getJobsPage({ q, workType, jobType, category, sort, crossBorder, country, page: 1 })
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  // Real Match % — a plain array/set comparison against the candidate's own
  // real profile skills (lib/jobMatching.ts), never an LLM call, so no rate
  // limiting is warranted here (same reasoning as any cheap authenticated
  // read). Only computed when the candidate is signed in AND has real
  // skills listed; otherwise every job's matchPercent stays null and the
  // client omits the badge entirely rather than showing a fabricated score.
  let skillSet = new Set<string>()
  let candidateProfile: Awaited<ReturnType<typeof getCandidateProfile>> = null
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      candidateProfile = await getCandidateProfile(supabase, user.id)
      skillSet = parseSkillSet(candidateProfile?.skills)
    }
  } catch {}

  const jobsWithMatch = jobs.map((job) => {
    const scoreResult = calculateJobScore(job, candidateProfile)
    return {
      ...job,
      matchPercent: calculateMatchPercent(job.tags, skillSet),
      matchScore: scoreResult?.score ?? null,
      matchDetails: scoreResult?.details ?? null,
    }
  })

  return (
    <JobsClient
      jobs={jobsWithMatch}
      initialQuery={q}
      initialWorkType={workType}
      initialJobType={jobType}
      initialCategory={category}
      initialSort={sort}
      initialCrossBorder={crossBorder}
      initialCountry={country}
      totalPages={totalPages}
      total={total}
    />
  )
}
