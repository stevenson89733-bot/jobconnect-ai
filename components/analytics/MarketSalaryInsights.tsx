import Link from 'next/link'
import { LineChart } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import FadeIn from '@/components/dashboard/FadeIn'
import type { SalaryBenchmark } from '@/lib/salaryBenchmark'

function formatUsd(n: number) {
  return `$${Math.round(n / 1000)}k`
}

// Deliberately visually distinct from the personal cards above it (tinted
// background, explicit "not your personal history" line) — this is real
// market context from real job postings, never a claim about the
// candidate's own salary or trend.
export default async function MarketSalaryInsights({ benchmark }: { benchmark: SalaryBenchmark }) {
  const t = await getTranslations('analytics')

  return (
    <FadeIn delay={0.25}>
      <Card className="bg-slate-50 dark:bg-slate-900/40">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <LineChart className="w-4 h-4 text-primary" strokeWidth={1.75} />
            <h2 className="font-semibold text-slate-900 dark:text-white">{t('marketSalaryTitle')}</h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-5">
            {t('marketSalarySubtitle')}
          </p>

          {benchmark.status === 'no_target_role' && (
            <div className="text-center py-6">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {t('noTargetRole')}
              </p>
              <Link href="/profile"><Button variant="primary" size="sm">{t('setTargetRole')}</Button></Link>
            </div>
          )}

          {benchmark.status === 'insufficient_data' && (
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center py-6">
              {t('insufficientData', {
                role: benchmark.targetRole,
                sample: benchmark.sampleSize > 0 ? t('insufficientDataSample', { count: benchmark.sampleSize }) : '',
              })}
            </p>
          )}

          {benchmark.status === 'ok' && (
            <>
              <div className="grid grid-cols-2 gap-6 mb-2">
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatUsd(benchmark.averageSalary)}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{t('averagePostedSalary')}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatUsd(benchmark.rangeMin)}–{formatUsd(benchmark.rangeMax)}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{t('realPostedRange')}</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {t('basedOnPostings', { count: benchmark.sampleSize, role: benchmark.targetRole })}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </FadeIn>
  )
}
