import { createClient } from '@/lib/supabase/server'
import ApplicationsTrackerClient, { type TrackerRow } from './ApplicationsTrackerClient'

export const dynamic = 'force-dynamic'

type JobRef = { title: string; company_name: string }
type RawRow = {
  id: string
  status: string
  status_updated_at: string | null
  created_at: string
  initiated_by_employer: boolean | null
  jobs: JobRef[] | JobRef | null
}

function jobInfo(row: RawRow): JobRef {
  const job = Array.isArray(row.jobs) ? row.jobs[0] : row.jobs
  return { title: job?.title ?? 'Unknown role', company_name: job?.company_name ?? 'Unknown company' }
}

export default async function ApplicationsTrackerPage() {
  const supabase = createClient()
  let applications: TrackerRow[] = []

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('applications')
        .select('id, status, status_updated_at, created_at, initiated_by_employer, jobs!job_id(title, company_name)')
        .eq('candidate_id', user.id)
        .order('created_at', { ascending: false })

      applications = ((data as unknown as RawRow[] | null) ?? []).map((row) => ({
        id: row.id,
        status: row.status,
        status_updated_at: row.status_updated_at,
        created_at: row.created_at,
        initiated_by_employer: row.initiated_by_employer ?? false,
        ...jobInfo(row),
      }))
    }
  } catch {
    // Supabase unavailable — render with an empty list rather than crashing
  }

  return <ApplicationsTrackerClient applications={applications} />
}
