import Link from 'next/link'
import { Inbox } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge, type BadgeProps } from '@/components/ui/badge'
import FadeIn from './FadeIn'

export type ApplicationRow = {
  id: string
  status: string
  created_at: string
  title: string
  company_name: string
}

const STATUS_VARIANT: Record<string, NonNullable<BadgeProps['variant']>> = {
  submitted: 'primary',
  interview: 'success',
  rejected: 'default',
  viewed: 'warning',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function RecentApplications({ applications }: { applications: ApplicationRow[] }) {
  return (
    <FadeIn className="h-full">
      <Card className="h-full">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Recent Applications</CardTitle>
          <Link href="/jobs" className="text-xs text-primary hover:text-blue-500 dark:hover:text-blue-400">
            Browse jobs →
          </Link>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-10 text-slate-600 dark:text-slate-500">
              <Inbox className="w-8 h-8 mx-auto mb-3 opacity-60" strokeWidth={1.5} />
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">You haven&apos;t applied to any jobs yet.</p>
              <Link href="/jobs" className="text-xs text-primary hover:text-blue-500 dark:hover:text-blue-400">
                Browse jobs →
              </Link>
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
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 font-medium text-slate-800 dark:text-slate-200">{app.company_name}</td>
                      <td className="py-3 text-slate-600 dark:text-slate-400">{app.title}</td>
                      <td className="py-3">
                        <Badge variant={STATUS_VARIANT[app.status] ?? 'default'}>{app.status}</Badge>
                      </td>
                      <td className="py-3 text-slate-600 dark:text-slate-500">{formatDate(app.created_at)}</td>
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
