import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getCandidateProfile } from '@/lib/profile'
import { absoluteUrl } from '@/lib/seo'
import LinkedInOptimizerClient from './LinkedInOptimizerClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'LinkedIn Optimizer | JobConnect AI',
  description: 'Analyze your real LinkedIn profile for improvements, or generate an optimized headline, about section, and experience highlights from your real JobConnect AI profile.',
  alternates: { canonical: absoluteUrl('/ai-tools/linkedin-optimizer') },
  openGraph: {
    title: 'LinkedIn Optimizer | JobConnect AI',
    description: 'Analyze or generate an optimized LinkedIn profile with GPT-4o, grounded in your real experience.',
    url: absoluteUrl('/ai-tools/linkedin-optimizer'),
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'LinkedIn Optimizer | JobConnect AI',
    description: 'Analyze or generate an optimized LinkedIn profile with GPT-4o, grounded in your real experience.',
  },
}

export default async function LinkedInOptimizerPage({
  searchParams,
}: {
  searchParams: { targetRole?: string }
}) {
  let isPremium = false
  let initialTargetRole = ''
  let initialExperience = ''
  let initialSkills = ''
  let initialSummary = ''

  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const profile = await getCandidateProfile(supabase, user.id)
      isPremium = profile?.is_premium ?? false
      initialTargetRole = profile?.title?.trim() ?? ''
      initialExperience = profile?.experience?.trim() ?? ''
      initialSkills = profile?.skills?.trim() ?? ''
      initialSummary = profile?.bio?.trim() ?? ''
    }

    if (searchParams.targetRole?.trim()) {
      initialTargetRole = searchParams.targetRole.trim()
    }
  } catch {}

  return (
    <LinkedInOptimizerClient
      isPremium={isPremium}
      initialTargetRole={initialTargetRole}
      initialExperience={initialExperience}
      initialSkills={initialSkills}
      initialSummary={initialSummary}
    />
  )
}
