'use server'
import { createClient } from '@/lib/supabase/server'

export type ProfileFields = {
  full_name: string
  title: string
  location: string
  bio: string
  experience: string
  skills: string
  education: string
  linkedin_url: string
  github_url: string
  years_experience: string // parsed to integer|null before the DB write
  phone: string            // private — never selected/shown on employer-facing pages
  portfolio_url: string
  availability: string
  work_preference: string
}

// Updates the current user's own profile row. The user id is read SERVER-SIDE
// from the session — never taken from the client. RLS also enforces own-row only.
export async function updateProfile(fields: ProfileFields): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: 'You must be signed in to update your profile.' }

    const parsedYears = parseInt(fields.years_experience, 10)

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name:        fields.full_name,
        title:            fields.title,
        location:         fields.location,
        bio:              fields.bio,
        experience:       fields.experience,
        skills:           fields.skills,
        education:        fields.education,
        linkedin_url:     fields.linkedin_url,
        github_url:       fields.github_url,
        years_experience: Number.isFinite(parsedYears) ? parsedYears : null,
        phone:            fields.phone,
        portfolio_url:    fields.portfolio_url,
        availability:     fields.availability,
        work_preference:  fields.work_preference,
      })
      .eq('user_id', user.id)

    if (error) return { ok: false, error: error.message }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Something went wrong' }
  }
}
