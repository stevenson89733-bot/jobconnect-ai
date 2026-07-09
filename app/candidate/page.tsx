import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

type Profile = {
  full_name: string | null
  title: string | null
  location: string | null
  bio: string | null
  experience: string | null
  skills: string | null
}

type JobRef = { title: string; company_name: string }
type ApplicationRow = {
  id: string
  status: string
  created_at: string
  jobs: JobRef[] | JobRef | null
}

// AI-recommended jobs require a real matching pipeline that doesn't exist yet —
// intentionally left out of this pass rather than shipped with invented % match.
const AI_MATCHES: never[] = []

const STATUS_COLORS: Record<string, string> = {
  submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  interview: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  rejected:  'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  viewed:    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function jobInfo(row: ApplicationRow): JobRef {
  const job = Array.isArray(row.jobs) ? row.jobs[0] : row.jobs
  return { title: job?.title ?? 'Unknown role', company_name: job?.company_name ?? 'Unknown company' }
}

export default async function CandidateDashboard() {
  const supabase = createClient()

  let email = ''
  let profile: Profile | null = null
  let applicationsCount = 0
  let applications: ApplicationRow[] = []

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      email = user.email ?? ''

      const [{ data: profileData }, { count }, { data: appsData }] = await Promise.all([
        supabase.from('profiles').select('full_name, title, location, bio, experience, skills').eq('user_id', user.id).single(),
        supabase.from('applications').select('*', { count: 'exact', head: true }).eq('candidate_id', user.id),
        supabase.from('applications')
          .select('id, status, created_at, jobs!job_id(title, company_name)')
          .eq('candidate_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
      ])

      profile = (profileData as Profile | null) ?? null
      applicationsCount = count ?? 0
      applications = (appsData as unknown as ApplicationRow[] | null) ?? []
    }
  } catch {
    // Supabase unavailable — render with empty/zeroed data rather than crashing
  }

  const fullName = profile?.full_name?.trim() || ''
  const firstName = fullName.split(/\s+/)[0] || email.split('@')[0] || 'there'
  const initials = fullName
    ? fullName.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('')
    : (email[0] ?? '?').toUpperCase()

  // Profile completion — the 6 fields expected: name, title, location, skills,
  // experience, and bio (as "résumé").
  const completionFields = [profile?.full_name, profile?.title, profile?.location, profile?.bio, profile?.skills, profile?.experience]
  const filledCount = completionFields.filter(f => !!f?.trim()).length
  const completion = Math.round((filledCount / completionFields.length) * 100)

  const skillTags = (profile?.skills ?? '').split(',').map(s => s.trim()).filter(Boolean)

  // TODO: no profile_views tracking table yet — wire up once view analytics exist.
  const profileViews = 0
  // TODO: no interviews table / no application-status workflow sets a real
  // "interview" state yet — wire up once that exists.
  const interviewsScheduled = 0

  const METRICS = [
    { label: 'Applications Sent', value: applicationsCount, icon: '📤', color: 'text-primary' },
    { label: 'Profile Views', value: profileViews, icon: '👁', color: 'text-green-600 dark:text-green-400' },
    { label: 'Interviews Scheduled', value: interviewsScheduled, icon: '📅', color: 'text-purple-600 dark:text-purple-400' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white text-xl font-bold">
            {initials}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back, {firstName} 👋</h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Your career snapshot</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href="/jobs" className="btn-outline text-sm">Browse Jobs</Link>
          <Link href="/profile" className="btn-primary text-sm">Edit Profile</Link>
        </div>
      </div>

      {/* Profile completion */}
      {completion < 100 && (
        <div className="card mb-8 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-[220px]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Profile completion</span>
              <span className="text-sm font-semibold text-primary">{completion}%</span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full" style={{ width: `${completion}%` }} />
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-500 mt-2">
              Complete your profile to get noticed by more recruiters.
            </p>
          </div>
          <Link href="/profile" className="btn-primary text-sm shrink-0">Complete Profile</Link>
        </div>
      )}

      {/* AI Tools */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          <span className="text-orange-600 dark:text-accent">✦</span> AI Tools
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/ai-tools/resume-builder" className="card hover:border-primary/50 transition-all group flex items-start gap-4">
            <div className="text-3xl">📄</div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors mb-0.5">AI Resume Builder</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Generate an ATS-optimized resume with GPT-4o and a resume score.</p>
            </div>
          </Link>
          <Link href="/ai-tools/cover-letter" className="card hover:border-accent/50 transition-all group flex items-start gap-4">
            <div className="text-3xl">✉️</div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-accent transition-colors mb-0.5">AI Cover Letter</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Write a personalized cover letter tailored to any company and role.</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {METRICS.map((m) => (
          <div key={m.label} className="card">
            <div className="mb-3">
              <span className="text-2xl">{m.icon}</span>
            </div>
            <div className={`text-3xl font-extrabold ${m.color} mb-1`}>{m.value}</div>
            <div className="text-xs text-slate-600 dark:text-slate-500">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="grid xl:grid-cols-3 gap-6 mb-6">
        {/* Applications table */}
        <div className="xl:col-span-2 card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-900 dark:text-white">Recent Applications</h2>
            <Link href="/jobs" className="text-xs text-primary hover:text-blue-500 dark:hover:text-blue-400">Browse jobs →</Link>
          </div>
          {applications.length === 0 ? (
            <div className="text-center py-10 text-slate-600 dark:text-slate-500">
              <div className="text-3xl mb-2">📭</div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">You haven&apos;t applied to any jobs yet.</p>
              <Link href="/jobs" className="text-xs text-primary hover:text-blue-500 dark:hover:text-blue-400">Browse jobs →</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-600 dark:text-slate-500 border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left pb-3 font-medium">Company</th>
                    <th className="text-left pb-3 font-medium">Role</th>
                    <th className="text-left pb-3 font-medium">Status</th>
                    <th className="text-left pb-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {applications.map((app) => {
                    const { title, company_name } = jobInfo(app)
                    return (
                      <tr key={app.id} className="hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 font-medium text-slate-800 dark:text-slate-200">{company_name}</td>
                        <td className="py-3 text-slate-600 dark:text-slate-400">{title}</td>
                        <td className="py-3">
                          <span className={`badge ${STATUS_COLORS[app.status] ?? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="py-3 text-slate-600 dark:text-slate-500">{formatDate(app.created_at)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Skills */}
        <div className="card">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-5">Skills</h2>
          {skillTags.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-500 text-center py-6">No skills added yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skillTags.map((skill) => (
                <span key={skill} className="badge bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 text-xs">
                  {skill}
                </span>
              ))}
            </div>
          )}
          <Link href="/profile" className="mt-5 block text-center text-xs text-primary hover:text-blue-500 dark:hover:text-blue-400">
            Update skills →
          </Link>
        </div>
      </div>

      {/* AI Matches — hidden until a real matching pipeline exists */}
      {AI_MATCHES.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">AI-Matched Jobs for You</h2>
              <p className="text-xs text-slate-600 dark:text-slate-500 mt-0.5">Based on your profile and preferences</p>
            </div>
            <Link href="/jobs" className="text-xs text-primary hover:text-blue-500 dark:hover:text-blue-400">See all matches →</Link>
          </div>
        </div>
      )}
    </div>
  )
}
