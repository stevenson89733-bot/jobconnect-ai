import { unstable_cache } from 'next/cache'
import { notFound } from 'next/navigation'
import { createPublicClient } from '@/lib/supabase/public'
import { createClient } from '@/lib/supabase/server'
import { getCandidateProfile } from '@/lib/profile'
import { parseSkillSet, calculateMatchPercent } from '@/lib/jobMatching'
import { JOB_SELECT_FIELDS, normalizeJobCompany } from '@/lib/jobsQuery'
import { candidateHasApplicationAt, type OwnReview, type PublicReview } from '@/lib/reviews'
import CompanyClient from './CompanyClient'

// Cached per company name — no candidate-specific data (that's computed
// fresh per-request below, same reasoning as app/jobs/page.tsx). Tagged
// 'jobs' so a new job posting invalidates this immediately, same as the
// Jobs page.
const getCompanyData = unstable_cache(
  async (name: string) => {
    const supabase = createPublicClient()

    // Real companies table row, if one exists for this name — the table is
    // empty today, so this is null for every company right now. Never
    // fabricated in its place.
    const { data: company } = await supabase
      .from('companies')
      .select('name, logo_url, website')
      .ilike('name', name)
      .maybeSingle()

    const { data: jobs, error } = await supabase
      .from('jobs')
      .select(JOB_SELECT_FIELDS)
      .eq('is_active', true)
      .ilike('company_name', name)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) console.error('Failed to fetch company jobs:', error.message)

    return { company: company ?? null, jobs: (jobs ?? []).map(normalizeJobCompany) }
  },
  ['company-page'],
  { revalidate: 60, tags: ['jobs'] }
)

export default async function CompanyPage({ params }: { params: { name: string } }) {
  const name = decodeURIComponent(params.name)
  const { company, jobs } = await getCompanyData(name)

  // A real company page only exists if it has (or ever had) real jobs
  // posted under this exact name, or a real companies row — otherwise
  // there's nothing genuine to show.
  if (jobs.length === 0 && !company) notFound()

  const displayName = company?.name ?? jobs[0]?.company_name ?? name

  // Real Match % — same computation as the Jobs page (lib/jobMatching.ts),
  // never a second matching system.
  let skillSet = new Set<string>()
  let canReview = false
  let ownReview: OwnReview | null = null
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const profile = await getCandidateProfile(supabase, user.id)
      skillSet = parseSkillSet(profile?.skills)

      const { data: existing } = await supabase
        .from('company_reviews')
        .select('id, rating, review_text, status, created_at')
        .eq('candidate_id', user.id)
        .eq('company_name', displayName)
        .maybeSingle()
      ownReview = (existing as OwnReview | null) ?? null

      if (!ownReview) {
        canReview = await candidateHasApplicationAt(supabase, user.id, displayName)
      }
    }
  } catch {}

  // Approved reviews only, via the anonymity-enforcing public view — never
  // the base table, and never includes candidate_id (lib/reviews.ts,
  // supabase/reviews.sql). Fetched fresh per request, not cached alongside
  // the 'jobs'-tagged data above — moderation approvals should show up on
  // the next real page load, not wait on an unrelated cache tag.
  let reviews: PublicReview[] = []
  try {
    const publicSupabase = createPublicClient()
    const { data } = await publicSupabase
      .from('company_reviews_public')
      .select('id, company_name, rating, review_text, created_at')
      .ilike('company_name', displayName)
      .order('created_at', { ascending: false })
    reviews = (data as PublicReview[] | null) ?? []
  } catch {}

  const jobsWithMatch = jobs.map((job) => ({
    ...job,
    matchPercent: calculateMatchPercent(job.tags, skillSet),
  }))

  // Simple factual aggregation across this company's own real open
  // positions with real salary data — not a market "insight", just what's
  // actually posted. Omitted entirely below (in CompanyClient) if none
  // have salary data.
  const salaries = jobs.filter((j) => j.salary_min != null)
  const salaryInsights = salaries.length > 0
    ? {
        min: Math.min(...salaries.map((j) => j.salary_min as number)),
        max: Math.max(...salaries.map((j) => (j.salary_max ?? j.salary_min) as number)),
        count: salaries.length,
      }
    : null

  return (
    <CompanyClient
      name={displayName}
      logoUrl={company?.logo_url ?? null}
      website={company?.website ?? null}
      jobs={jobsWithMatch}
      salaryInsights={salaryInsights}
      reviews={reviews}
      canReview={canReview}
      ownReview={ownReview}
    />
  )
}
