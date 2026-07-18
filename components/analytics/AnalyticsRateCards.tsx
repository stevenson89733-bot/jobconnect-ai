import { Reply, CalendarCheck2, Award } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import StatCard from '@/components/dashboard/StatCard'
import FadeIn from '@/components/dashboard/FadeIn'
import type { ApplicationRates } from '@/lib/applicationRates'

// Reuses StatCard as-is (same shape as lot 1's Applications Sent card) —
// the only new thing here is the empty/sparse-state handling around it.
export default async function AnalyticsRateCards({ rates }: { rates: ApplicationRates }) {
  const t = await getTranslations('analytics')

  if (rates.total === 0) {
    return (
      <FadeIn delay={0.05}>
        <div className="card text-center py-10 text-slate-600 dark:text-slate-400">
          <div className="text-3xl mb-2">📊</div>
          <p className="text-sm">{t('rateCardsEmpty')}</p>
        </div>
      </FadeIn>
    )
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label={t('responseRate')} value={`${rates.responseRate}%`} icon={Reply} delay={0.05} />
        <StatCard label={t('interviewRate')} value={`${rates.interviewRate}%`} icon={CalendarCheck2} delay={0.1} />
        <StatCard label={t('offerRate')} value={`${rates.offerRate}%`} icon={Award} delay={0.15} />
      </div>
      {!rates.anyResponseYet && (
        <FadeIn delay={0.2}>
          <p className="text-xs text-slate-600 dark:text-slate-400 text-center sm:text-left">
            {t('ratesUpdateNote')}
          </p>
        </FadeIn>
      )}
    </div>
  )
}
