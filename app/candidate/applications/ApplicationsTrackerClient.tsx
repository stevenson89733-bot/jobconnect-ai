'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Inbox } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { APPLICATION_STATUSES, APPLICATION_STATUS_VARIANT, type ApplicationStatus } from '@/lib/applicationStatus'
import { timeAgo } from '@/lib/timeAgo'

export type TrackerRow = {
  id: string
  status: string
  status_updated_at: string | null
  created_at: string
  title: string
  company_name: string
}

type Filter = ApplicationStatus | 'all'

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ApplicationsTrackerClient({ applications }: { applications: TrackerRow[] }) {
  const t = useTranslations('applicationTracker')
  const tCandidate = useTranslations('candidate')
  const tStatus = useTranslations('applicationStatus')
  const locale = useLocale()
  const [filter, setFilter] = useState<Filter>('all')

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: applications.length, submitted: 0, viewed: 0, interview: 0, offer: 0, rejected: 0 }
    for (const app of applications) {
      if (APPLICATION_STATUSES.includes(app.status as ApplicationStatus)) {
        c[app.status as ApplicationStatus] += 1
      }
    }
    return c
  }, [applications])

  const filtered = filter === 'all' ? applications : applications.filter((a) => a.status === filter)

  const tabs: Filter[] = ['all', ...APPLICATION_STATUSES]

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-3">
          <Link href="/candidate" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t('breadcrumbDashboard')}</Link>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-300">{t('breadcrumbCurrent')}</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">{t('title')}</h1>
        <p className="text-slate-600 dark:text-slate-400">{t('subtitle')}</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filter === tab
                ? 'bg-primary text-white border-primary'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:border-primary/50'
            }`}
          >
            {tab === 'all' ? t('filterAll') : tStatus(tab)} ({counts[tab]})
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          {applications.length === 0 ? (
            <div className="text-center py-14 text-slate-600 dark:text-slate-400">
              <Inbox className="w-8 h-8 mx-auto mb-3 opacity-60" strokeWidth={1.5} />
              <p className="text-sm mb-3">{tCandidate('noApplicationsYet')}</p>
              <Link href="/jobs" className="text-xs text-primary dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
                {tCandidate('seeAllJobs')}
              </Link>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-14 text-slate-600 dark:text-slate-400">
              <Inbox className="w-8 h-8 mx-auto mb-3 opacity-60" strokeWidth={1.5} />
              <p className="text-sm">{t('emptyFiltered')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                    <th className="text-start pb-3 font-medium">{tCandidate('tableCompany')}</th>
                    <th className="text-start pb-3 font-medium">{tCandidate('tableRole')}</th>
                    <th className="text-start pb-3 font-medium">{tCandidate('tableStatus')}</th>
                    <th className="text-start pb-3 font-medium">{tCandidate('tableDate')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filtered.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 font-medium text-slate-800 dark:text-slate-200">{app.company_name}</td>
                      <td className="py-3 text-slate-600 dark:text-slate-400">{app.title}</td>
                      <td className="py-3">
                        <Badge variant={APPLICATION_STATUS_VARIANT[app.status as ApplicationStatus] ?? 'default'}>
                          {tStatus(app.status as ApplicationStatus)}
                        </Badge>
                        {app.status !== 'submitted' && app.status_updated_at && (
                          <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                            {timeAgo(app.status_updated_at, locale, 'verbose')}
                          </div>
                        )}
                      </td>
                      <td className="py-3 text-slate-600 dark:text-slate-400">{formatDate(app.created_at, locale)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
