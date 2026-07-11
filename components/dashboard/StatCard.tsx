import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import FadeIn from './FadeIn'

// `accent` is reserved for the one "positive/complete" stat's ICON only
// (Profile Completion) — the number itself always stays the same neutral
// dark color across all stat cards, so the row never reads as mismatched.
export default function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  delay = 0,
}: {
  label: string
  value: string | number
  icon: LucideIcon
  accent?: string
  delay?: number
}) {
  const iconClass = accent ?? 'text-slate-400 dark:text-slate-500'
  const valueClass = 'text-slate-900 dark:text-white'

  return (
    <FadeIn delay={delay}>
      <Card className="h-full">
        <CardContent className="p-6">
          <div className={`mb-3 inline-flex ${iconClass}`}>
            <Icon className="w-6 h-6" strokeWidth={1.75} />
          </div>
          <div className={`text-3xl font-extrabold ${valueClass} mb-1 tabular-nums`}>{value}</div>
          <div className="text-xs text-slate-600 dark:text-slate-500">{label}</div>
        </CardContent>
      </Card>
    </FadeIn>
  )
}
