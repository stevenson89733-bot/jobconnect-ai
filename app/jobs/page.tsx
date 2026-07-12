import { unstable_cache } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/public'
import JobsClient from './JobsClient'

const PAGE_SIZE = 20

export type SortOption = 'relevance' | 'date' | 'salary'

type Filters = {
  q: string
  remote: boolean
  jobType: string
  category: string
  sort: SortOption
  page: number
}

// Cached independently per unique combination of filters/page — see
// lib/supabase/public.ts for why this can't use the cookie-based server
// client. Tagged 'jobs' so POST /api/jobs can invalidate every cached
// variant immediately on a new post instead of waiting out the 60s window.
const getJobsPage = unstable_cache(
  async ({ q, remote, jobType, category, sort, page }: Filters) => {
    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const supabase = createPublicClient()
    let query = supabase
      .from('jobs')
      // Real company logo via the real company_id relationship — null for
      // every job right now (companies table has no rows yet), so the
      // client always falls back to an initials avatar until real company
      // rows with logo_url exist. Never a stock/generic logo.
      .select(
        'id, title, company_name, location, salary_label, salary_min, job_type, category, tags, description, is_featured, created_at, company:companies(logo_url)',
        { count: 'exact' }
      )
      .eq('is_active', true)

    if (q) {
      // Real keyword match across title/company/description only — no
      // fabricated relevance scoring beyond what these ilike hits are.
      const escaped = q.replace(/[%_]/g, (c) => `\\${c}`)
      query = query.or(
        `title.ilike.%${escaped}%,company_name.ilike.%${escaped}%,description.ilike.%${escaped}%`
      )
    }
    if (remote) {
      // Derived directly from the job's own real location text (every
      // active job today is written as "Remote · <region>") — never
      // inferred from company name/industry.
      query = query.ilike('location', 'Remote%')
    }
    if (jobType && jobType !== 'All') query = query.eq('job_type', jobType)
    if (category && category !== 'All') query = query.eq('category', category)

    if (sort === 'salary') {
      // nullsFirst: false keeps jobs without a real salary_min at the end
      // regardless of sort direction, rather than guessing a value for them.
      query = query.order('salary_min', { ascending: false, nullsFirst: false })
    } else if (sort === 'date') {
      query = query.order('created_at', { ascending: false })
    } else {
      // "Relevance" with no real per-query relevance signal beyond the
      // keyword match itself just means the same sensible default order:
      // featured first, then most recent.
      query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false })
    }

    const { data: jobs, count, error } = await query.range(from, to)

    if (error) {
      console.error('Failed to fetch jobs:', error.message)
    }

    // Supabase's JS types the to-one embedded relation as an array even
    // though company_id is a single FK — flatten to match the real shape.
    const normalized = (jobs ?? []).map((job) => ({
      ...job,
      company: Array.isArray(job.company) ? job.company[0] ?? null : job.company,
    }))

    return { jobs: normalized, total: count ?? 0 }
  },
  ['jobs-page'],
  { revalidate: 60, tags: ['jobs'] }
)

export default async function JobsPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string; remote?: string; type?: string; category?: string; sort?: string }
}) {
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10) || 1)
  const q = (searchParams.q ?? '').trim()
  const remote = searchParams.remote === '1'
  const jobType = searchParams.type ?? 'All'
  const category = searchParams.category ?? 'All'
  const sort: SortOption = (['relevance', 'date', 'salary'] as const).includes(searchParams.sort as SortOption)
    ? (searchParams.sort as SortOption)
    : 'relevance'

  const { jobs, total } = await getJobsPage({ q, remote, jobType, category, sort, page })
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <JobsClient
      jobs={jobs ?? []}
      initialQuery={q}
      initialRemote={remote}
      initialJobType={jobType}
      initialCategory={category}
      initialSort={sort}
      page={page}
      totalPages={totalPages}
      total={total}
    />
  )
}
