import { createClient } from '@/lib/supabase/server'
import JobsClient from './JobsClient'

export const revalidate = 60 // refresh cached jobs every 60s

export default async function JobsPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const supabase = createClient()

  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('id, title, company_name, location, salary_label, job_type, category, tags, is_featured, created_at')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch jobs:', error.message)
  }

  return (
    <JobsClient
      jobs={jobs ?? []}
      initialQuery={searchParams.q ?? ''}
    />
  )
}
