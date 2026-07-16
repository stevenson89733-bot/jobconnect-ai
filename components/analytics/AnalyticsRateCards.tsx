import { Reply, CalendarCheck2, Award } from 'lucide-react'
import StatCard from '@/components/dashboard/StatCard'
import FadeIn from '@/components/dashboard/FadeIn'
import type { ApplicationRates } from '@/lib/applicationRates'

// Reuses StatCard as-is (same shape as lot 1's Applications Sent card) —
// the only new thing here is the empty/sparse-state handling around it.
export default function AnalyticsRateCards({ rates }: { rates: ApplicationRates }) {
  if (rates.total === 0) {
    return (
      <FadeIn delay={0.05}>
        <div className="card text-center py-10 text-slate-600 dark:text-slate-400">
          <div className="text-3xl mb-2">📊</div>
          <p className="text-sm">Apply to jobs to see your response, interview, and offer rates here.</p>
        </div>
      </FadeIn>
    )
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Response Rate (of all applications)" value={`${rates.responseRate}%`} icon={Reply} delay={0.05} />
        <StatCard label="Interview Rate (of all applications)" value={`${rates.interviewRate}%`} icon={CalendarCheck2} delay={0.1} />
        <StatCard label="Offer Rate (of all applications)" value={`${rates.offerRate}%`} icon={Award} delay={0.15} />
      </div>
      {!rates.anyResponseYet && (
        <FadeIn delay={0.2}>
          <p className="text-xs text-slate-600 dark:text-slate-400 text-center sm:text-left">
            Rates update as employers review your applications.
          </p>
        </FadeIn>
      )}
    </div>
  )
}
