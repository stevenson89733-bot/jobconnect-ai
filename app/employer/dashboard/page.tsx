import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

type JobRow = {
  id: string
  title: string
  location: string
  is_featured: boolean
  featured_until: string | null
  created_at: string
}

type AutoApplyLogRow = {
  id: string
  job_id: string
  status: string
  applied_at: string
  profiles: { full_name: string | null; email: string | null } | null
  jobs: { title: string } | null
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    sent: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    skipped: 'bg-gray-100 text-gray-600',
    below_threshold: 'bg-orange-100 text-orange-700',
  }
  const cls = map[status] ?? 'bg-gray-100 text-gray-600'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
      {status}
    </span>
  )
}

export default async function EmployerDashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (profile?.role !== 'employer') redirect('/login')

  // Section 1 — jobs
  const { data: jobRows } = await supabase
    .from('jobs')
    .select('id, title, location, is_featured, featured_until, created_at')
    .eq('posted_by', user.id)
    .order('created_at', { ascending: false })

  const jobs: JobRow[] = (jobRows as JobRow[] | null) ?? []
  const jobIds = jobs.map((j) => j.id)

  // Section 2 — auto_apply_log (employer can't read other users' rows via RLS → use admin)
  const adminClient = createAdminClient()
  let logs: AutoApplyLogRow[] = []
  if (jobIds.length > 0) {
    const { data: logRows } = await adminClient
      .from('auto_apply_log')
      .select('id, job_id, status, applied_at, jobs(title)')
      .in('job_id', jobIds)
      .order('applied_at', { ascending: false })
      .limit(50)

    if (logRows && logRows.length > 0) {
      const userIds = [...new Set(logRows.map((l: any) => l.user_id).filter(Boolean))]

      // Re-fetch with user_id for profile join
      const { data: logRowsFull } = await adminClient
        .from('auto_apply_log')
        .select('id, job_id, user_id, status, applied_at, jobs(title)')
        .in('job_id', jobIds)
        .order('applied_at', { ascending: false })
        .limit(50)

      const allUserIds = [...new Set((logRowsFull ?? []).map((l: any) => l.user_id).filter(Boolean))]

      const { data: profileRows } = await adminClient
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', allUserIds)

      const profileByUserId = new Map((profileRows ?? []).map((p: any) => [p.user_id, p]))

      logs = (logRowsFull ?? []).map((l: any) => ({
        id: l.id,
        job_id: l.job_id,
        status: l.status,
        applied_at: l.applied_at,
        profiles: profileByUserId.get(l.user_id) ?? null,
        jobs: Array.isArray(l.jobs) ? l.jobs[0] : l.jobs,
      }))
    }
  }

  // Application count per job
  const appCountByJob: Record<string, number> = {}
  for (const log of logs) {
    appCountByJob[log.job_id] = (appCountByJob[log.job_id] ?? 0) + 1
  }

  const now = new Date()
  const isFeaturedActive = (job: JobRow) =>
    job.is_featured && (job.featured_until == null || new Date(job.featured_until) > now)
  const hasFeatured = jobs.some(isFeaturedActive)

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Recruteur</h1>

      {/* Section 1 — Mes offres */}
      <section id="mes-offres">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Mes offres</h2>
        {jobs.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Aucune offre publiée.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Titre</th>
                  <th className="px-4 py-3 text-left">Localisation</th>
                  <th className="px-4 py-3 text-left">Candidatures</th>
                  <th className="px-4 py-3 text-left">Featured</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-900">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{job.title}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{job.location}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{appCountByJob[job.id] ?? 0}</td>
                    <td className="px-4 py-3">
                      {isFeaturedActive(job) ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                          Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">
                          Inactif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`#candidatures-${job.id}`}
                        className="text-primary dark:text-blue-400 hover:underline text-xs"
                      >
                        Voir les candidatures
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Section 2 — Candidatures reçues */}
      <section id="candidatures-recues">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Candidatures reçues</h2>
        {logs.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Aucune candidature reçue via Auto-Apply.</p>
        ) : (
          <>
            {jobs.map((job) => {
              const jobLogs = logs.filter((l) => l.job_id === job.id)
              if (jobLogs.length === 0) return null
              return (
                <div key={job.id} id={`candidatures-${job.id}`} className="mb-6">
                  <h3 className="text-sm font-semibold text-primary dark:text-blue-400 mb-3">
                    {job.title}
                    <span className="ml-2 text-xs text-slate-500 font-normal">({jobLogs.length})</span>
                  </h3>
                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wide">
                        <tr>
                          <th className="px-4 py-3 text-left">Candidat</th>
                          <th className="px-4 py-3 text-left">Email</th>
                          <th className="px-4 py-3 text-left">Poste</th>
                          <th className="px-4 py-3 text-left">Statut</th>
                          <th className="px-4 py-3 text-left">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-900">
                        {jobLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                              {log.profiles?.full_name ?? '—'}
                            </td>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                              {log.profiles?.email ?? '—'}
                            </td>
                            <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                              {log.jobs?.title ?? '—'}
                            </td>
                            <td className="px-4 py-3">
                              <StatusBadge status={log.status} />
                            </td>
                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">
                              {new Date(log.applied_at).toLocaleDateString('fr-FR')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            })}
          </>
        )}
      </section>

      {/* Section 3 — Featured Listing */}
      <section id="featured-listing">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Featured Listing</h2>
        {hasFeatured ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-5">
            <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">
              Featured actif sur {jobs.filter((j) => j.is_featured).length} offre(s)
            </p>
            <p className="text-xs text-green-700 dark:text-green-400 mb-4">
              Vos offres apparaissent en tête de liste avec une mise en avant visuelle.
              {jobs.filter(isFeaturedActive).some((j) => j.featured_until) && (
                <> Expire le{' '}
                  {new Date(jobs.filter(isFeaturedActive).find((j) => j.featured_until)!.featured_until!).toLocaleDateString('fr-FR')}.
                </>
              )}
            </p>
            <Link
              href="/employer/featured"
              className="inline-block text-sm font-medium text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700 rounded-lg px-4 py-2 hover:bg-green-100 dark:hover:bg-green-800/40 transition-colors"
            >
              Renouveler →
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
            <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
              Mettez votre offre en avant
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
              $49 · 30 jours · Visibilité maximale
            </p>
            <Link
              href="/employer/featured"
              className="inline-block text-sm font-semibold bg-accent text-white rounded-lg px-4 py-2 hover:bg-orange-600 transition-colors"
            >
              Activer Featured →
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
