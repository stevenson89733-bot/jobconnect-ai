import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getCandidateProfile } from '@/lib/profile'
import { absoluteUrl } from '@/lib/seo'
import SkillGapClient from './SkillGapClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Mobility Skill-Gap | JobConnect AI',
  description: 'Compare your real profile against a target role or a real job listing — see which skills you already have and which to develop next, with GPT-4o.',
  alternates: { canonical: absoluteUrl('/ai-tools/skill-gap') },
  openGraph: {
    title: 'Mobility Skill-Gap | JobConnect AI',
    description: 'See which skills you already have and which to develop for your next move, grounded in your real profile.',
    url: absoluteUrl('/ai-tools/skill-gap'),
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Mobility Skill-Gap | JobConnect AI',
    description: 'See which skills you already have and which to develop for your next move, grounded in your real profile.',
  },
}

export default async function SkillGapPage({
  searchParams,
}: {
  searchParams: { jobId?: string; targetRole?: string }
}) {
  let isPremium = false
  let initialSkills = ''
  let initialExperience = ''
  let initialTargetRole = ''
  let jobTitle: string | null = null
  let jobCompany: string | null = null
  let jobId: string | null = null

  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const profile = await getCandidateProfile(supabase, user.id)
      isPremium = profile?.is_premium ?? false
      initialSkills = profile?.skills?.trim() ?? ''
      initialExperience = profile?.experience?.trim() ?? ''
      initialTargetRole = profile?.title?.trim() ?? ''
    }

    if (searchParams.jobId) {
      const { data: job } = await supabase
        .from('jobs')
        .select('id, title, company_name')
        .eq('id', searchParams.jobId)
        .eq('is_active', true)
        .single()
      if (job) {
        jobId = job.id
        jobTitle = job.title ?? null
        jobCompany = job.company_name ?? null
      }
    }

    if (!jobId && searchParams.targetRole?.trim()) {
      initialTargetRole = searchParams.targetRole.trim()
    }
  } catch {}

  return (
    <SkillGapClient
      isPremium={isPremium}
      initialSkills={initialSkills}
      initialExperience={initialExperience}
      initialTargetRole={initialTargetRole}
      jobId={jobId}
      jobTitle={jobTitle}
      jobCompany={jobCompany}
    />
  )
}
