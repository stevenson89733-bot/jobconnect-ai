import type { SupabaseClient } from '@supabase/supabase-js'

export type CandidateProfileFields = {
  is_premium: boolean
  title: string | null
  bio: string | null
  experience: string | null
  skills: string | null
  education: string | null
}

// Single source of truth for "the candidate's real saved profile" — used by
// both AI Career Coach and the AI Resume Builder pre-fill so neither invents
// or duplicates its own copy of this query.
export async function getCandidateProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<CandidateProfileFields | null> {
  const { data } = await supabase
    .from('profiles')
    .select('is_premium, title, bio, experience, skills, education')
    .eq('user_id', userId)
    .single()

  return (data as CandidateProfileFields | null) ?? null
}
