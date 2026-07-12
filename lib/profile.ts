import type { SupabaseClient } from '@supabase/supabase-js'

export type CandidateProfileFields = {
  is_premium: boolean
  title: string | null
  bio: string | null
  experience: string | null
  skills: string | null
  education: string | null
  full_name: string | null
  email: string | null
  phone: string | null
  linkedin_url: string | null
  github_url: string | null
  portfolio_url: string | null
}

// Single source of truth for "the candidate's real saved profile" — used by
// AI Career Coach, the AI Resume Builder pre-fill, and its live preview
// (contact fields) so nothing invents or duplicates its own copy of this
// query. Callers that don't need every field (e.g. Career Coach only reads
// .skills) simply ignore the rest.
export async function getCandidateProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<CandidateProfileFields | null> {
  const { data } = await supabase
    .from('profiles')
    .select('is_premium, title, bio, experience, skills, education, full_name, email, phone, linkedin_url, github_url, portfolio_url')
    .eq('user_id', userId)
    .single()

  return (data as CandidateProfileFields | null) ?? null
}
