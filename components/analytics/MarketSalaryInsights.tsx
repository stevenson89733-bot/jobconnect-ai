import Link from 'next/link'
import { LineChart } from 'lucide-react'
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
export default function MarketSalaryInsights({ benchmark }: { benchmark: SalaryBenchmark }) {
  return (
    <FadeIn delay={0.25}>
      <Card className="bg-slate-50 dark:bg-slate-900/40">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <LineChart className="w-4 h-4 text-primary" strokeWidth={1.75} />
            <h2 className="font-semibold text-slate-900 dark:text-white">Market Salary Insights</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-500 mb-5">
            Real salary data from current job postings matching your target role — not your personal salary history.
          </p>

          {benchmark.status === 'no_target_role' && (
            <div className="text-center py-6">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Set a target role on your profile to see real salary benchmarks for it.
              </p>
              <Link href="/profile"><Button variant="primary" size="sm">Set Target Role</Button></Link>
            </div>
          )}

          {benchmark.status === 'insufficient_data' && (
            <p className="text-sm text-slate-600 dark:text-slate-500 text-center py-6">
              Not enough market data for &ldquo;{benchmark.targetRole}&rdquo; yet
              {benchmark.sampleSize > 0 ? ` (only ${benchmark.sampleSize} matching posting${benchmark.sampleSize === 1 ? '' : 's'} found — need at least 3)` : ''}.
            </p>
          )}

          {benchmark.status === 'ok' && (
            <>
              <div className="grid grid-cols-2 gap-6 mb-2">
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatUsd(benchmark.averageSalary)}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">Average posted salary</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatUsd(benchmark.rangeMin)}–{formatUsd(benchmark.rangeMax)}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">Real posted range</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-500">
                Based on {benchmark.sampleSize} real posting{benchmark.sampleSize === 1 ? '' : 's'} for &ldquo;{benchmark.targetRole}&rdquo;.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </FadeIn>
  )
}
