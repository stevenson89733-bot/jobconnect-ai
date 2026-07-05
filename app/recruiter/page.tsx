import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

const METRICS = [
  { label: 'Active Job Posts', value: '8', delta: '+2 this month', icon: '📋', color: 'text-primary' },
  { label: 'Total Applicants', value: '347', delta: '+64 this week', icon: '👥', color: 'text-green-600 dark:text-green-400' },
  { label: 'Interviews Scheduled', value: '12', delta: '5 this week', icon: '📅', color: 'text-orange-600 dark:text-accent' },
  { label: 'Avg. Time to Hire', value: '14d', delta: '3 days faster', icon: '⚡', color: 'text-purple-600 dark:text-purple-400' },
]

const ACTIVE_JOBS = [
  { title: 'Senior AI Engineer', applicants: 84, new: 12, status: 'Active', posted: '5 days ago' },
  { title: 'Staff Frontend Engineer', applicants: 67, new: 8, status: 'Active', posted: '8 days ago' },
  { title: 'Product Designer', applicants: 103, new: 21, status: 'Active', posted: '2 days ago' },
  { title: 'Backend Engineer', applicants: 93, new: 5, status: 'Paused', posted: '12 days ago' },
]

const TOP_CANDIDATES = [
  { name: 'Alex Chen', role: 'AI Engineer', match: 97, location: 'San Francisco', skills: ['Python', 'ML', 'LLMs'] },
  { name: 'Sarah Park', role: 'Frontend Engineer', match: 94, location: 'Remote · EU', skills: ['React', 'TypeScript', 'Next.js'] },
  { name: 'Marcus Lee', role: 'Product Designer', match: 91, location: 'New York', skills: ['Figma', 'UX', 'Design Systems'] },
]

type Application = {
  id: string
  message: string | null
  status: string
  created_at: string
  candidate_id: string
  profiles: { full_name: string; email: string }[] | null
  jobs: { id: string; title: string }[] | null
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
  // Fetch real applications for this employer's jobs
  let applicationsByJob: Record<string, { jobTitle: string; applications: Application[] }> = {}

  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data } = await supabase
        .from('applications')
        .select(`
          id, message, status, created_at, candidate_id,
          profiles!candidate_id ( full_name, email ),
          jobs!job_id ( id, title )
        `)
        .order('created_at', { ascending: false })

      if (data) {
        for (const app of data as Application[]) {
          const jobRow = Array.isArray(app.jobs) ? app.jobs[0] : app.jobs
          const jobId = jobRow?.id ?? 'unknown'
          const jobTitle = jobRow?.title ?? 'Unknown Job'
          if (!applicationsByJob[jobId]) {
            applicationsByJob[jobId] = { jobTitle, applications: [] }
          }
          applicationsByJob[jobId].applications.push(app)
        }
      }
    }
  } catch {
    // Supabase not configured or table doesn't exist yet — silently skip
  }

  const hasApplications = Object.keys(applicationsByJob).length > 0

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-orange-400 flex items-center justify-center text-white text-xl font-bold">
            A
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Employer Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Acme Corporation · Updated just now</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href="/jobs" className="btn-outline text-sm">View All Jobs</Link>
          <button className="btn-primary text-sm">+ Post a Job</button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {METRICS.map((m) => (
          <div key={m.label} className="card">
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{m.icon}</span>
              <span className="text-xs text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">{m.delta}</span>
            </div>
            <div className={`text-3xl font-extrabold ${m.color} mb-1`}>{m.value}</div>
            <div className="text-xs text-slate-600 dark:text-slate-500">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Real Applications Section */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">Applications Received</h2>
            <p className="text-xs text-slate-600 dark:text-slate-500 mt-0.5">Real candidates who applied to your job postings</p>
          </div>
          {hasApplications && (
            <span className="badge bg-accent/10 dark:bg-accent/20 text-orange-700 dark:text-accent text-xs">
              {Object.values(applicationsByJob).reduce((n, g) => n + g.applications.length, 0)} total
            </span>
          )}
        </div>

        {!hasApplications ? (
          <div className="text-center py-10 text-slate-600 dark:text-slate-500">
            <div className="text-3xl mb-2">📭</div>
            <p className="text-sm text-slate-600 dark:text-slate-400">No applications yet.</p>
            <p className="text-xs mt-1">
              Make sure you've run <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">supabase/applications.sql</code> in your Supabase SQL Editor.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(applicationsByJob).map(([jobId, group]) => (
              <div key={jobId}>
                <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                  {group.jobTitle}
                  <span className="text-xs text-slate-600 dark:text-slate-500 font-normal">({group.applications.length})</span>
                </h3>
                <div className="space-y-2">
                  {group.applications.map(app => (
                    <div key={app.id} className="flex items-start gap-4 p-3 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {(() => { const p = Array.isArray(app.profiles) ? app.profiles[0] : app.profiles; return (p?.full_name ?? p?.email ?? '?')[0].toUpperCase() })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        {(() => { const p = Array.isArray(app.profiles) ? app.profiles[0] : app.profiles; return (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-slate-900 dark:text-white">
                            {p?.full_name ?? 'Candidate'}
                          </span>
                          <span className="text-xs text-slate-600 dark:text-slate-500">{p?.email}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-600 ml-auto">{timeAgo(app.created_at)}</span>
                        </div>
                        ) })()}
                        {app.message && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{app.message}</p>
                        )}
                        {!app.message && (
                          <p className="text-xs text-slate-500 dark:text-slate-600 mt-1 italic">No message provided</p>
                        )}
                      </div>
                      <span className="badge bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 text-xs shrink-0">{app.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid xl:grid-cols-3 gap-6 mb-6">
        {/* Active Jobs */}
        <div className="xl:col-span-2 card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-900 dark:text-white">Active Job Postings</h2>
            <button className="text-xs text-primary hover:text-blue-500 dark:hover:text-blue-400">+ Post new job</button>
          </div>
          <div className="space-y-3">
            {ACTIVE_JOBS.map((job) => (
              <div key={job.title} className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800/50 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-sm text-slate-900 dark:text-white truncate">{job.title}</span>
                    <span className={`badge ${job.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                      {job.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-500">{job.posted} · {job.applicants} applicants</p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  {job.new > 0 && (
                    <span className="badge bg-accent/10 dark:bg-accent/20 text-orange-700 dark:text-accent">{job.new} new</span>
                  )}
                  <button className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Review →</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline */}
        <div className="card">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-5">Hiring Pipeline</h2>
          <div className="space-y-3">
            {[
              { stage: 'New Applications', count: 64, color: 'bg-blue-500' },
              { stage: 'Screening', count: 28, color: 'bg-purple-500' },
              { stage: 'Interview', count: 12, color: 'bg-yellow-500' },
              { stage: 'Offer Sent', count: 4, color: 'bg-green-500' },
              { stage: 'Hired', count: 2, color: 'bg-accent' },
            ].map((stage) => (
              <div key={stage.stage}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-700 dark:text-slate-300">{stage.stage}</span>
                  <span className="text-slate-600 dark:text-slate-400 font-medium">{stage.count}</span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${stage.color} rounded-full`}
                    style={{ width: `${Math.min((stage.count / 64) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top AI-Matched Candidates */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">Top AI-Matched Candidates</h2>
            <p className="text-xs text-slate-600 dark:text-slate-500 mt-0.5">Automatically ranked by fit score</p>
          </div>
          <Link href="/candidates" className="text-xs text-primary hover:text-blue-500 dark:hover:text-blue-400">View all →</Link>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {TOP_CANDIDATES.map((c) => (
            <div key={c.name} className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white text-sm font-bold">
                  {c.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-900 dark:text-white">{c.name}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-500">{c.location}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mb-3">
                <span className="text-xs bg-primary/10 dark:bg-primary/20 text-primary px-2 py-0.5 rounded-full font-semibold">🤖 {c.match}% match</span>
              </div>
              <div className="flex flex-wrap gap-1 mb-4">
                {c.skills.map((s) => (
                  <span key={s} className="badge bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs">{s}</span>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button className="text-xs btn-outline py-1.5 text-center rounded-lg">View Profile</button>
                <button className="text-xs btn-primary py-1.5 rounded-lg">Contact</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
