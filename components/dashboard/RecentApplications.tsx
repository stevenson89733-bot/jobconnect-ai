import Link from 'next/link'
import { Inbox } from 'lucide-react'
import { getTranslations, getLocale } from 'next-intl/server'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { APPLICATION_STATUS_VARIANT, type ApplicationStatus } from '@/lib/applicationStatus'
import { timeAgo } from '@/lib/timeAgo'
import type { ApplicationRates, AvgResponseTime } from '@/lib/applicationRates'
import ScheduledSlot from '@/components/shared/ScheduledSlot'
import FadeIn from './FadeIn'

export type ApplicationRow = {
  id: string
  status: string
  status_updated_at: string | null
  created_at: string
  initiated_by_employer: boolean
  scheduled_at: string | null
  scheduled_timezone: string | null
  title: string
  company_name: string
}

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale, { month: 'short', day: 'numeric' })
}

export default async function RecentApplications({
  applications,
  rates,
  avgResponseTime,
}: {
  applications: ApplicationRow[]
  rates?: ApplicationRates
  avgResponseTime?: AvgResponseTime
}) {
  const t = await getTranslations('candidate')
  const tStatus = await getTranslations('applicationStatus')
  const locale = await getLocale()

  return (
    <FadeIn className="h-full">
      <Card className="h-full">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>{t('recentApplications')}</CardTitle>
          <Link href="/candidate/applications" className="text-xs text-primary dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
            {t('viewAllApplications')}
          </Link>
        </CardHeader>
        {rates && rates.total > 0 && (
          <div className="px-6 pb-1 -mt-2">
            {rates.anyResponseYet ? (
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {t('applicationsReviewedCount', { responded: rates.responded, total: rates.total })}
                {avgResponseTime?.avgDays != null && (
                  <> · {t('avgResponseTimeInline', { days: avgResponseTime.avgDays })}</>
                )}
              </p>
            ) : (
              <p className="text-xs text-slate-600 dark:text-slate-400">{t('noResponsesYet')}</p>
            )}
          </div>
        )}
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-10 text-slate-600 dark:text-slate-400">
              <Inbox className="w-8 h-8 mx-auto mb-3 opacity-60" strokeWidth={1.5} />
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{t('noApplicationsYet')}</p>
              <Link href="/jobs" className="text-xs text-primary dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
                {t('seeAllJobs')}
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                    <th className="text-start pb-3 font-medium">{t('tableCompany')}</th>
                    <th className="text-start pb-3 font-medium">{t('tableRole')}</th>
                    <th className="text-start pb-3 font-medium">{t('tableStatus')}</th>
                    <th className="text-start pb-3 font-medium">{t('tableDate')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 font-medium text-slate-800 dark:text-slate-200">{app.company_name}</td>
                      <td className="py-3 text-slate-600 dark:text-slate-400">{app.title}</td>
                      <td className="py-3">
                        <Badge variant={APPLICATION_STATUS_VARIANT[app.status as ApplicationStatus] ?? 'default'}>
                          {tStatus(app.status as ApplicationStatus)}
                        </Badge>
                        {app.initiated_by_employer && (
                          <div className="text-[11px] text-primary dark:text-blue-400 mt-1">{t('invitedByEmployer')}</div>
                        )}
                        {app.status === 'interview' && (
                          <ScheduledSlot
                            scheduledAt={app.scheduled_at}
                            scheduledTimezone={app.scheduled_timezone}
                            className="block text-[11px] mt-1"
                          />
                        )}
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
    </FadeIn>
  )
}
