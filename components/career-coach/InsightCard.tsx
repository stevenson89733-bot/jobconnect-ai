import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import FadeIn from '@/components/dashboard/FadeIn'

// Generic report card reused across every score/text/list section of the
// Career Coach report — nothing section-specific lives in here.
export default function InsightCard({
  icon: Icon,
  title,
  badge,
  children,
  delay = 0,
}: {
  icon: LucideIcon
  title: string
  badge?: ReactNode
  children: ReactNode
  delay?: number
}) {
  return (
    <FadeIn delay={delay} className="h-full">
      <Card className="h-full">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon className="w-4 h-4 text-primary" strokeWidth={1.75} />
            {title}
          </CardTitle>
          {badge}
        </CardHeader>
        <CardContent className="text-sm text-slate-700 dark:text-slate-300">
          {children}
        </CardContent>
      </Card>
    </FadeIn>
  )
}
