import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getCandidateProfile } from '@/lib/profile'
import { absoluteUrl } from '@/lib/seo'
import CvBuilderClient from './CvBuilderClient'
import { effectiveIsPremium } from '@/lib/adminAccess'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'AI CV Builder | JobConnect AI',
  description: 'Improve your existing CV with AI scoring and section rewrites, or generate a new ATS-ready CV from your profile — tailored to your target markets.',
  alternates: { canonical: absoluteUrl('/ai-tools/cv-builder') },
  openGraph: {
    title: 'AI CV Builder | JobConnect AI',
    description: 'Improve or generate a professional CV with AI.',
    url: absoluteUrl('/ai-tools/cv-builder'),
    type: 'website',
  },
}

export default async function CvBuilderPage() {
  let isPremium = false
  let initialName = ''
  let initialTitle = ''
  let initialEmail = ''
  let initialPhone = ''
  let initialSkills = ''
  let initialEducation = ''
  let initialExperience = ''

  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const profile = await getCandidateProfile(supabase, user.id)
      isPremium = effectiveIsPremium(profile ?? {})
      initialName = profile?.full_name?.trim() ?? ''
      initialTitle = profile?.title?.trim() ?? ''
      initialEmail = profile?.email?.trim() ?? user.email ?? ''
      initialPhone = profile?.phone?.trim() ?? ''
      initialSkills = profile?.skills?.trim() ?? ''
      initialEducation = profile?.education?.trim() ?? ''
      initialExperience = profile?.experience?.trim() ?? ''
    }
  } catch {}

  return (
    <CvBuilderClient
      isPremium={isPremium}
      initialName={initialName}
      initialTitle={initialTitle}
      initialEmail={initialEmail}
      initialPhone={initialPhone}
      initialSkills={initialSkills}
      initialEducation={initialEducation}
      initialExperience={initialExperience}
    />
  )
}
