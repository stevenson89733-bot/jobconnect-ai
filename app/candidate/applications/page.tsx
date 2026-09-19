import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, Inbox, Briefcase, Eye, MessageSquare, Gift, XCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { timeAgo } from '@/lib/timeAgo'
import { getLocale } from 'next-intl/server'
import { APPLICATION_STATUS_VARIANT, type ApplicationStatus } from '@/lib/applicationStatus'
import { Badge } from '@/components/ui/badge'
import ApplicationStatusSelect from '@/components/candidate/ApplicationStatusSelect'

export const dynamic = 'force-dynamic'

type ApplicationWithJob = {
  id: string
  job_id: string
  status: string
  created_at: string
  status_updated_at: string | null
  initiated_by_employer: boolean | null
  jobs: { title: string; company_name: string; work_type: string } | null
}

function StatPill({ count, label, icon: Icon, color }: { count: number; label: string; icon: React.ElementType; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1 px-5 py-3 rounded-xl bg-white dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/40 shadow-sm">
      <Icon className={`w-4 h-4 ${color}`} strokeWidth={1.75} />
      <span className="text-2xl font-bold text-slate-900 dark:text-white">{count}</span>
      <span className="text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">{label}</span>
    </div>
  )
}

export default async function ApplicationsPage() {
  const supabase = createClient()
  const locale = await getLocale()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="text-slate-600 dark:text-slate-400">
          <Link href="/login?redirectTo=/candidate/applications" className="text-primary hover:underline">Sign in</Link> to see your applications.
        </p>
      </div>
    )
  }

  const { data: rawApps } = await supabase
    .from('applications')
    .select('id, job_id, status, created_at, status_updated_at, initiated_by_employer, jobs!job_id(title, company_name, work_type)')
    .eq('candidate_id', user.id)
    .order('created_at', { ascending: false })

  const apps = ((rawApps ?? []) as unknown as ApplicationWithJob[])

  const byStatus = (s: string) => apps.filter((a) => a.status === s).length
  const stats = {
    total: apps.length,
    submitted: byStatus('submitted'),
    viewed: byStatus('viewed'),
    interview: byStatus('interview'),
    offer: byStatus('offer'),
    rejected: byStatus('rejected'),
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/candidate" className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Applications</h1>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-3">
        <StatPill count={stats.total} label="Total" icon={Briefcase} color="text-slate-500" />
        <StatPill count={stats.viewed} label="Viewed" icon={Eye} color="text-amber-500" />
        <StatPill count={stats.interview} label="Interviews" icon={MessageSquare} color="text-accent" />
        <StatPill count={stats.offer} label="Offers" icon={Gift} color="text-green-500" />
        <StatPill count={stats.rejected} label="Rejected" icon={XCircle} color="text-slate-400" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All applications</CardTitle>
        </CardHeader>
        <CardContent>
          {apps.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <Inbox className="w-8 h-8 mx-auto mb-3 opacity-50" strokeWidth={1.5} />
              <p className="text-sm mb-3">No applications yet.</p>
              <Link href="/jobs" className="text-xs text-primary dark:text-blue-400 hover:underline">
                Browse jobs →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                    <th className="text-start pb-3 font-medium">Company</th>
                    <th className="text-start pb-3 font-medium">Role</th>
                    <th className="text-start pb-3 font-medium">Status</th>
                    <th className="text-start pb-3 font-medium">Applied</th>
                    <th className="text-start pb-3 font-medium">Browse</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {apps.map((app) => {
                    const job = app.jobs
                    return (
                      <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap pr-4">
                          {job?.company_name ?? '—'}
                        </td>
                        <td className="py-3.5 text-slate-600 dark:text-slate-400 max-w-[200px] truncate pr-4">
                          {job?.title ?? '—'}
                          {app.initiated_by_employer && (
                            <span className="ml-2 text-[10px] text-primary dark:text-blue-400 font-medium">Invited</span>
                          )}
                        </td>
                        <td className="py-3.5 pr-4">
                          <ApplicationStatusSelect
                            applicationId={app.id}
                            currentStatus={app.status as ApplicationStatus}
                          />
                          {app.status_updated_at && app.status !== 'submitted' && (
                            <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                              {timeAgo(app.status_updated_at, locale, 'verbose')}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap pr-4">
                          {new Date(app.created_at).toLocaleDateString(locale, { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="py-3.5">
                          <Link
                            href={`/jobs?job=${app.job_id}`}
                            className="text-[11px] text-primary dark:text-blue-400 hover:underline whitespace-nowrap"
                          >
                            View job →
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
