import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getCandidateProfile } from '@/lib/profile'
import { absoluteUrl } from '@/lib/seo'
import InterviewPrepClient from './InterviewPrepClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'AI Interview Prep | JobConnect AI',
  description: 'Practice real interview questions tailored to a job posting or your profile, with written AI feedback on each answer.',
  alternates: { canonical: absoluteUrl('/ai-tools/interview-prep') },
  openGraph: {
    title: 'AI Interview Prep | JobConnect AI',
    description: 'Practice real interview questions tailored to a job posting or your profile, with written AI feedback on each answer.',
    url: absoluteUrl('/ai-tools/interview-prep'),
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Interview Prep | JobConnect AI',
    description: 'Practice real interview questions tailored to a job posting or your profile, with written AI feedback on each answer.',
  },
}

export default async function InterviewPrepPage({
  searchParams,
}: {
  searchParams: { jobId?: string; targetRole?: string }
}) {
  let isPremium = false
  // Pre-fill from the candidate's real profile — same source as Career
  // Coach and the Resume Builder pre-fill, never a second/duplicate query.
  let initialTargetRole = ''
  let initialExperience = ''
  let initialSkills = ''
  // Real job context (item 3 of the plan): arriving via a real listing's
  // "Prepare for interview" link (?jobId=) pre-fills company/description
  // from that real row — never invented job details, same pattern as the
  // Cover Letter generator's ?jobId= handling.
  let initialCompany = ''
  let initialJobDescription = ''

  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const profile = await getCandidateProfile(supabase, user.id)
      isPremium = profile?.is_premium ?? false
      initialTargetRole = profile?.title?.trim() ?? ''
      initialExperience = profile?.experience?.trim() ?? ''
      initialSkills = profile?.skills?.trim() ?? ''
    }

    if (searchParams.jobId) {
      const { data: job } = await supabase
        .from('jobs')
        .select('title, company_name, description')
        .eq('id', searchParams.jobId)
        .eq('is_active', true)
        .single()
      if (job) {
        initialTargetRole = job.title ?? initialTargetRole
        initialCompany = job.company_name ?? ''
        initialJobDescription = job.description ?? ''
      }
    }

    // Copilot hand-off (?targetRole=...) — same reasoning as the Resume
    // Builder's identical param: a value the candidate just typed in the
    // chat is more timely than a possibly-stale saved profile title. Only
    // applies when there's no real job context above, which already takes
    // priority as the more specific real source.
    if (!searchParams.jobId && searchParams.targetRole?.trim()) {
      initialTargetRole = searchParams.targetRole.trim()
    }
  } catch {}

  return (
    <InterviewPrepClient
      isPremium={isPremium}
      initialTargetRole={initialTargetRole}
      initialCompany={initialCompany}
      initialJobDescription={initialJobDescription}
      initialExperience={initialExperience}
      initialSkills={initialSkills}
    />
  )
}
