import Link from 'next/link'
import { Lock, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getCandidateProfile } from '@/lib/profile'
import { buildWeeklyActivity } from '@/lib/weeklyActivity'
import { computeApplicationRates } from '@/lib/applicationRates'
import { buildCareerProgressPoints } from '@/lib/careerProgress'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import StatCard from '@/components/dashboard/StatCard'
import WeeklyActivityChart from '@/components/analytics/WeeklyActivityChart'
import AnalyticsRateCards from '@/components/analytics/AnalyticsRateCards'
import CareerProgressChart from '@/components/analytics/CareerProgressChart'
import AnalyticsAIInsights from '@/components/analytics/AnalyticsAIInsights'
import type { CareerAnalysis } from '@/lib/ai/careerCoach'

export const dynamic = 'force-dynamic'

function UpsellGate() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <Card>
        <CardContent className="p-10 text-center">
          <Lock className="w-8 h-8 mx-auto mb-3 text-primary" strokeWidth={1.5} />
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Analytics Dashboard is a Premium feature</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
            Upgrade to Premium to track your real application activity and see your AI Career Coach insights in one place.
          </p>
          <Link href="/pricing"><Button variant="primary">View Premium Plans</Button></Link>
        </CardContent>
      </Card>
    </div>
  )
}

export default async function AnalyticsPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <UpsellGate />

  const profileRow = await getCandidateProfile(supabase, user.id)
  if (!profileRow?.is_premium) return <UpsellGate />

  const [{ data: applications }, { data: savedJobs }, { data: analysisHistory }] = await Promise.all([
    supabase.from('applications').select('created_at, status').eq('candidate_id', user.id),
    supabase.from('saved_jobs').select('created_at').eq('candidate_id', user.id),
    // Full history, oldest first — feeds both Career Progress (the whole
    // list) and AI Insights (just the most recent row) from one query,
    // rather than fetching "most recent" separately.
    supabase.from('career_analysis').select('analysis_json, generated_at').eq('candidate_id', user.id).order('generated_at', { ascending: true }),
  ])

  const applicationsCount = applications?.length ?? 0
  const weeklyActivity = buildWeeklyActivity(
    (applications ?? []).map((a) => a.created_at as string),
    (savedJobs ?? []).map((s) => s.created_at as string)
  )
  const rates = computeApplicationRates((applications ?? []).map((a) => a.status as string))

  const careerProgressPoints = buildCareerProgressPoints(analysisHistory ?? [])
  const analysisRow = analysisHistory && analysisHistory.length > 0 ? analysisHistory[analysisHistory.length - 1] : null

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">Analytics Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Your real application activity and AI Career Coach insights, in one place.
        </p>
      </div>

      <div className="max-w-xs">
        <StatCard label="Applications Sent" value={applicationsCount} icon={Send} delay={0} />
      </div>

      <WeeklyActivityChart weeks={weeklyActivity} />

      <AnalyticsRateCards rates={rates} />

      <CareerProgressChart points={careerProgressPoints} />

      <AnalyticsAIInsights
        isPremium={!!profileRow.is_premium}
        analysis={(analysisRow?.analysis_json as CareerAnalysis | undefined) ?? null}
        generatedAt={analysisRow?.generated_at ?? null}
      />
    </div>
  )
}
