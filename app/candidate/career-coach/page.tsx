import Link from 'next/link'
import { Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { matchJobsToSkills } from '@/lib/jobMatching'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import CareerCoachClient from '@/components/career-coach/CareerCoachClient'
import type { CareerAnalysis } from '@/lib/ai/careerCoach'

export const dynamic = 'force-dynamic'

function UpsellGate() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <Card>
        <CardContent className="p-10 text-center">
          <Lock className="w-8 h-8 mx-auto mb-3 text-primary" strokeWidth={1.5} />
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-1">AI Career Coach is a Premium feature</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
            Upgrade to Premium to get a full AI-generated career assessment — ATS score, missing skills,
            resume and interview suggestions, a career roadmap, and more.
          </p>
          <Link href="/pricing"><Button variant="primary">View Premium Plans</Button></Link>
        </CardContent>
      </Card>
    </div>
  )
}

export default async function CareerCoachPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <UpsellGate />

  const [{ data: profileRow }, { data: analysisRow }, { data: appliedJobIds }] = await Promise.all([
    supabase.from('profiles')
      .select('is_premium, skills')
      .eq('user_id', user.id)
      .single(),
    supabase.from('career_analysis')
      .select('analysis_json, generated_at')
      .eq('candidate_id', user.id)
      .maybeSingle(),
    supabase.from('applications').select('job_id').eq('candidate_id', user.id),
  ])

  if (!profileRow?.is_premium) return <UpsellGate />

  const hasSkills = !!(profileRow.skills ?? '').trim()
  const appliedIds = new Set((appliedJobIds ?? []).map((r) => r.job_id as string))
  const matchedJobs = await matchJobsToSkills(profileRow.skills, appliedIds, 4)

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">AI Career Coach</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          An AI-generated assessment of your profile — refresh anytime to regenerate it.
        </p>
      </div>

      <CareerCoachClient
        initialAnalysis={(analysisRow?.analysis_json as CareerAnalysis | undefined) ?? null}
        initialGeneratedAt={analysisRow?.generated_at ?? null}
        hasSkills={hasSkills}
        matchedJobs={matchedJobs}
      />
    </div>
  )
}
