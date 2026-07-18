import Link from 'next/link'
import { Inbox } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { APPLICATION_STATUS_VARIANT, type ApplicationStatus } from '@/lib/applicationStatus'
import { timeAgo } from '@/lib/timeAgo'
import FadeIn from './FadeIn'

export type ApplicationRow = {
  id: string
  status: string
  status_updated_at: string | null
  created_at: string
  title: string
  company_name: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default async function RecentApplications({ applications }: { applications: ApplicationRow[] }) {
  const t = await getTranslations('candidate')
  const tStatus = await getTranslations('applicationStatus')

  return (
    <FadeIn className="h-full">
      <Card className="h-full">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>{t('recentApplications')}</CardTitle>
          <Link href="/jobs" className="text-xs text-primary dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
            {t('seeAllJobs')}
          </Link>
        </CardHeader>
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
                    <th className="text-left pb-3 font-medium">{t('tableCompany')}</th>
                    <th className="text-left pb-3 font-medium">{t('tableRole')}</th>
                    <th className="text-left pb-3 font-medium">{t('tableStatus')}</th>
                    <th className="text-left pb-3 font-medium">{t('tableDate')}</th>
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
                        {app.status !== 'submitted' && app.status_updated_at && (
                          <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                            {timeAgo(app.status_updated_at, 'verbose')}
                          </div>
                        )}
                      </td>
                      <td className="py-3 text-slate-600 dark:text-slate-400">{formatDate(app.created_at)}</td>
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
