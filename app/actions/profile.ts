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
// from the session — never taken from the client. RLS also enforces own-row
// only. Accepts a PARTIAL set of fields so each editable section on the
// redesigned profile page can save just its own slice — e.g. saving the Bio
// section doesn't need to also resend Experience/Education/Skills — rather
// than requiring the whole form's state on every section save.
export async function updateProfile(fields: Partial<ProfileFields>): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: 'You must be signed in to update your profile.' }

    const update: Record<string, string | number | null> = {}
    for (const key of Object.keys(fields) as (keyof ProfileFields)[]) {
      if (key === 'years_experience') {
        const parsedYears = parseInt(fields.years_experience ?? '', 10)
        update.years_experience = Number.isFinite(parsedYears) ? parsedYears : null
      } else {
        update[key] = fields[key] as string
      }
    }

    if (Object.keys(update).length === 0) return { ok: true }

    const { error } = await supabase.from('profiles').update(update).eq('user_id', user.id)

    if (error) return { ok: false, error: error.message }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Something went wrong' }
  }
}
