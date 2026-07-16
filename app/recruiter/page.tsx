import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ApplicationStatusControl from '@/components/recruiter/ApplicationStatusControl'
import { companyInitials } from '@/lib/companyDisplay'
import { APPLICATION_STATUSES, type ApplicationStatus } from '@/lib/applicationStatus'

type Application = {
  id: string
  message: string | null
  status: ApplicationStatus
  status_updated_at: string | null
  created_at: string
  candidate_id: string
  job_id: string
  profiles: { full_name: string | null; email: string } | null
  jobs: { id: string; title: string }[] | null
}

type JobRow = {
  id: string
  title: string
  is_active: boolean
  created_at: string
}

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  submitted: 'Submitted',
  viewed: 'Viewed',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
}

const STATUS_COLOR: Record<ApplicationStatus, string> = {
  submitted: 'bg-blue-500',
  viewed: 'bg-yellow-500',
  interview: 'bg-accent',
  offer: 'bg-green-500',
  rejected: 'bg-slate-400 dark:bg-slate-600',
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return '1d ago'
  if (days < 7) return `${days}d ago`
  return `${Math.floor(days / 7)}w ago`
}

export default async function EmployerDashboard() {
  let companyName = ''
  let jobs: JobRow[] = []
  let applications: Application[] = []

  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const [{ data: profileRow }, { data: jobRows, error: jobsError }] = await Promise.all([
        supabase.from('profiles').select('company_name').eq('user_id', user.id).maybeSingle(),
        supabase
          .from('jobs')
          .select('id, title, is_active, created_at')
          .eq('posted_by', user.id)
          .order('created_at', { ascending: false }),
      ])

      companyName = profileRow?.company_name ?? ''
      if (jobsError) console.error('[recruiter/jobs]', jobsError.message)
      jobs = (jobRows as JobRow[] | null) ?? []

      // Two separate queries, joined in JS — applications.candidate_id and
      // profiles.user_id both reference auth.users(id) independently, with
      // no direct FK between applications and profiles, so PostgREST can't
      // embed `profiles!candidate_id` in one request (confirmed: this was
      // silently failing with PGRST200 even before this lot, which is why
      // this section always rendered "No applications yet" regardless of
      // real data — the error was never logged, just swallowed).
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id, message, status, status_updated_at, created_at, candidate_id, job_id,
          jobs!job_id ( id, title )
        `)
        .order('created_at', { ascending: false })

      if (error) console.error('[recruiter/applications]', error.message)

      if (data && data.length > 0) {
        const candidateIds = [...new Set(data.map((a) => a.candidate_id))]
        const { data: profileRows, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .in('user_id', candidateIds)

        if (profilesError) console.error('[recruiter/applicant-profiles]', profilesError.message)

        const profileByUserId = new Map((profileRows ?? []).map((p) => [p.user_id, p]))

        applications = data.map((app) => ({
          ...app,
          status: app.status as ApplicationStatus,
          profiles: profileByUserId.get(app.candidate_id) ?? null,
        }))
      }
    }
  } catch {
    // Supabase not configured or table doesn't exist yet — silently skip
  }

  const applicationsByJob: Record<string, { jobTitle: string; applications: Application[] }> = {}
  for (const app of applications) {
    const jobRow = Array.isArray(app.jobs) ? app.jobs[0] : app.jobs
    const jobId = jobRow?.id ?? app.job_id
    const jobTitle = jobRow?.title ?? 'Unknown Job'
    if (!applicationsByJob[jobId]) applicationsByJob[jobId] = { jobTitle, applications: [] }
    applicationsByJob[jobId].applications.push(app)
  }
  const hasApplications = applications.length > 0

  // Real counts only — no fabricated deltas/comparisons, since no historical
  // snapshot exists to compare against.
  const activeJobsCount = jobs.filter((j) => j.is_active).length
  const totalApplicants = applications.length
  const interviewingCount = applications.filter((a) => a.status === 'interview').length

  const statusCounts = APPLICATION_STATUSES.map((status) => ({
    status,
    count: applications.filter((a) => a.status === status).length,
  }))
  const maxStatusCount = Math.max(1, ...statusCounts.map((s) => s.count))

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-orange-400 flex items-center justify-center text-white text-xl font-bold">
            {companyInitials(companyName || 'Employer')}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Employer Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              {companyName || 'Add your company name in your profile'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href="/jobs" className="btn-outline text-sm">View All Jobs</Link>
          <button className="btn-primary text-sm">+ Post a Job</button>
        </div>
      </div>

      {/* Metrics — real counts only */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        <div className="card">
          <div className="flex items-start justify-between mb-3">
            <span className="text-2xl">📋</span>
          </div>
          <div className="text-3xl font-extrabold text-primary mb-1">{activeJobsCount}</div>
          <div className="text-xs text-slate-600 dark:text-slate-400">Active Job Posts</div>
        </div>
        <div className="card">
          <div className="flex items-start justify-between mb-3">
            <span className="text-2xl">👥</span>
          </div>
          <div className="text-3xl font-extrabold text-green-600 dark:text-green-400 mb-1">{totalApplicants}</div>
          <div className="text-xs text-slate-600 dark:text-slate-400">Total Applicants</div>
        </div>
        <div className="card">
          <div className="flex items-start justify-between mb-3">
            <span className="text-2xl">📅</span>
          </div>
          <div className="text-3xl font-extrabold text-orange-600 dark:text-accent mb-1">{interviewingCount}</div>
          <div className="text-xs text-slate-600 dark:text-slate-400">Currently in Interview</div>
        </div>
      </div>

      {/* Real Applications Section */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">Applications Received</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Real candidates who applied to your job postings</p>
          </div>
          {hasApplications && (
            <span className="badge bg-accent/10 dark:bg-accent/20 text-orange-700 dark:text-accent text-xs">
              {totalApplicants} total
            </span>
          )}
        </div>

        {!hasApplications ? (
          <div className="text-center py-10 text-slate-600 dark:text-slate-400">
            <div className="text-3xl mb-2">📭</div>
            <p className="text-sm text-slate-600 dark:text-slate-400">No applications yet.</p>
            <p className="text-xs mt-1">
              Make sure you&apos;ve run <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">supabase/applications.sql</code> in your Supabase SQL Editor.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(applicationsByJob).map(([jobId, group]) => (
              <div key={jobId}>
                <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                  {group.jobTitle}
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-normal">({group.applications.length})</span>
                </h3>
                <div className="space-y-2">
                  {group.applications.map(app => (
                    <div key={app.id} className="flex items-start gap-4 p-3 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {(() => { const p = app.profiles; return (p?.full_name ?? p?.email ?? '?')[0].toUpperCase() })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        {(() => { const p = app.profiles; return (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-slate-900 dark:text-white">
                            {p?.full_name ?? 'Candidate'}
                          </span>
                          <span className="text-xs text-slate-600 dark:text-slate-400">{p?.email}</span>
                          <span className="text-xs text-slate-600 dark:text-slate-400 ml-auto">{timeAgo(app.created_at)}</span>
                        </div>
                        ) })()}
                        {app.message && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{app.message}</p>
                        )}
                        {!app.message && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 italic">No message provided</p>
                        )}
                      </div>
                      <ApplicationStatusControl
                        applicationId={app.id}
                        initialStatus={app.status}
                        initialStatusUpdatedAt={app.status_updated_at}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid xl:grid-cols-3 gap-6 mb-6">
        {/* Real Job Postings */}
        <div className="xl:col-span-2 card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-900 dark:text-white">Your Job Postings</h2>
            <button className="text-xs text-primary hover:text-blue-500 dark:hover:text-blue-400">+ Post new job</button>
          </div>
          {jobs.length === 0 ? (
            <div className="text-center py-10 text-slate-600 dark:text-slate-400">
              <div className="text-3xl mb-2">📭</div>
              <p className="text-sm">You haven&apos;t posted any jobs yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => {
                const applicantCount = applicationsByJob[job.id]?.applications.length ?? 0
                const newCount = applicationsByJob[job.id]?.applications.filter((a) => a.status === 'submitted').length ?? 0
                return (
                  <div key={job.id} className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800/50 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium text-sm text-slate-900 dark:text-white truncate">{job.title}</span>
                        <span className={`badge ${job.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                          {job.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{timeAgo(job.created_at)} · {applicantCount} applicant{applicantCount === 1 ? '' : 's'}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      {newCount > 0 && (
                        <span className="badge bg-accent/10 dark:bg-accent/20 text-orange-700 dark:text-accent">{newCount} new</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Real status breakdown — the actual 5-stage lifecycle, not an
            invented pipeline with stages that don't exist (e.g. "Screening",
            "Hired") */}
        <div className="card">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-5">Applications by Status</h2>
          {!hasApplications ? (
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center py-6">No applications yet.</p>
          ) : (
            <div className="space-y-3">
              {statusCounts.map(({ status, count }) => (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-700 dark:text-slate-300">{STATUS_LABEL[status]}</span>
                    <span className="text-slate-600 dark:text-slate-400 font-medium">{count}</span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${STATUS_COLOR[status]} rounded-full`}
                      style={{ width: `${(count / maxStatusCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Browse Candidates */}
      <div className="card flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-semibold text-slate-900 dark:text-white">Browse Candidates</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">View candidate profiles on JobConnect AI</p>
        </div>
        <Link href="/candidates" className="btn-primary text-sm px-6 py-2.5">View all →</Link>
      </div>
    </div>
  )
}
