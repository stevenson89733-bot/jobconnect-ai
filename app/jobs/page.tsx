import { unstable_cache } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/public'
import JobsClient from './JobsClient'

const PAGE_SIZE = 20

// Cached independently per page number — see lib/supabase/public.ts for why
// this can't use the cookie-based server client. Tagged 'jobs' so
// POST /api/jobs can invalidate every cached page immediately on a new post
// instead of waiting out the 60s window.
const getJobsPage = unstable_cache(
  async (page: number) => {
    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const supabase = createPublicClient()
    const { data: jobs, count, error } = await supabase
      .from('jobs')
      .select('id, title, company_name, location, salary_label, job_type, category, tags, is_featured, created_at', { count: 'exact' })
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      console.error('Failed to fetch jobs:', error.message)
    }

    return { jobs: jobs ?? [], total: count ?? 0 }
  },
  ['jobs-page'],
  { revalidate: 60, tags: ['jobs'] }
)

export default async function JobsPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string }
}) {
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10) || 1)
  const { jobs, total } = await getJobsPage(page)
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <JobsClient
      jobs={jobs ?? []}
      initialQuery={searchParams.q ?? ''}
      page={page}
      totalPages={totalPages}
      total={total}
    />
  )
}
