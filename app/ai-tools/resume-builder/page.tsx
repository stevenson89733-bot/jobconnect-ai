import { createClient } from '@/lib/supabase/server'
import { getCandidateProfile } from '@/lib/profile'
import ResumeBuilderClient from './ResumeBuilderClient'

export const dynamic = 'force-dynamic'

export default async function ResumeBuilderPage() {
  let isPremium = false
  // Pre-fill values — same real profile source as Career Coach. If the
  // profile has no experience, these stay empty, which is the correct
  // behavior: it surfaces the "add your experience first" guard client-side
  // rather than ever sending sparse/blank input to the LLM.
  let initialTargetRole = ''
  let initialExperience = ''
  let initialSkills = ''
  let initialEducation = ''
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
      initialEducation = profile?.education?.trim() ?? ''
      initialSummary = profile?.bio?.trim() ?? ''
    }
  } catch {}

  return (
    <ResumeBuilderClient
      isPremium={isPremium}
      initialTargetRole={initialTargetRole}
      initialExperience={initialExperience}
      initialSkills={initialSkills}
      initialEducation={initialEducation}
      initialSummary={initialSummary}
    />
  )
}
