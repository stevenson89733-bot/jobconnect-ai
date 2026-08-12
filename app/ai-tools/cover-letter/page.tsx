import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getCandidateProfile } from '@/lib/profile'
import { absoluteUrl } from '@/lib/seo'
import CoverLetterClient from './CoverLetterClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'AI Cover Letter Generator | JobConnect AI',
  description: 'Generate a tailored cover letter from a real job description and your own profile, with automatic company research.',
  alternates: { canonical: absoluteUrl('/ai-tools/cover-letter') },
  openGraph: {
    title: 'AI Cover Letter Generator | JobConnect AI',
    description: 'Generate a tailored cover letter from a real job description and your own profile.',
    url: absoluteUrl('/ai-tools/cover-letter'),
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Cover Letter Generator | JobConnect AI',
    description: 'Generate a tailored cover letter from a real job description and your own profile.',
  },
}

export default async function CoverLetterPage({
  searchParams,
}: {
  searchParams: { jobId?: string; targetRole?: string; company?: string; targetCountry?: string }
}) {
  let isPremium = false
  // Auto Personalization (item 5 of the lot-1 spec): pull from the
  // candidate's real saved profile, same source as Career Coach and the
  // Resume Builder pre-fill — never a second/duplicate mechanism.
  let initialStrengths = ''
  let initialTargetRole = ''
  // Generate from Job Description (item 1): if the candidate arrived via
  // "Write cover letter" on a real listing (?jobId=...), pre-fill company/
  // role/JD from that real row — never invented job details.
  let initialCompany = ''
  let initialJobDescription = ''

  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const profile = await getCandidateProfile(supabase, user.id)
      isPremium = profile?.is_premium ?? false
      initialTargetRole = profile?.title?.trim() ?? ''
      // Combine real bio + skills into a starting point for "strengths" —
      // still just a prefill, fully editable, same pattern as the Resume
      // Builder's experience/skills pre-fill.
      initialStrengths = [profile?.bio?.trim(), profile?.skills?.trim()]
        .filter(Boolean)
        .join('\n')
    }

    if (searchParams.jobId) {
      const { data: job } = await supabase
        .from('jobs')
        .select('title, company_name, description')
        .eq('id', searchParams.jobId)
        .eq('is_active', true)
        .single()
      if (job) {
        // jobId context takes precedence over everything — real listing data.
        initialTargetRole = job.title ?? initialTargetRole
        initialCompany = job.company_name ?? ''
        initialJobDescription = job.description ?? ''
      }
    } else {
      if (searchParams.company?.trim()) initialCompany = searchParams.company.trim()
    }
  } catch {}

  // jobId pre-fill already merged into initialTargetRole above when present.
  // For the non-jobId path, param and profile are passed separately so the
  // client applies: param > AIToolsContext > profile.
  const initialTargetRoleFromParam = !searchParams.jobId && searchParams.targetRole?.trim()
    ? searchParams.targetRole.trim()
    : searchParams.jobId
      ? initialTargetRole  // already the job title — treat as a "param-level" value
      : ''
  const initialTargetRoleFromProfile = searchParams.jobId ? '' : initialTargetRole

  const VALID_COUNTRIES = ['US', 'UK', 'CA', 'DE', 'FR']
  const initialTargetCountryFromParam = searchParams.targetCountry && VALID_COUNTRIES.includes(searchParams.targetCountry)
    ? searchParams.targetCountry
    : ''

  return (
    <CoverLetterClient
      isPremium={isPremium}
      initialTargetRoleFromParam={initialTargetRoleFromParam}
      initialTargetRoleFromProfile={initialTargetRoleFromProfile}
      initialCompany={initialCompany}
      initialJobDescription={initialJobDescription}
      initialStrengths={initialStrengths}
      initialTargetCountryFromParam={initialTargetCountryFromParam}
    />
  )
}
