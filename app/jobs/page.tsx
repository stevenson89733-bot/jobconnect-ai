import { createClient } from '@/lib/supabase/server'
import JobsClient from './JobsClient'

export const revalidate = 60 // refresh cached jobs every 60s

const PAGE_SIZE = 20

export default async function JobsPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string }
}) {
  const supabase = createClient()

  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10) || 1)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

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

  const total = count ?? 0
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
