import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileForm from './ProfileForm'

export const dynamic = 'force-dynamic'

const FIELDS = ['full_name', 'title', 'location', 'bio', 'experience', 'skills', 'education', 'linkedin_url', 'github_url'] as const

export default async function ProfilePage() {
  let user = null
  let profile: Record<string, string | null> | null = null
  try {
    const supabase = createClient()
    const res = await supabase.auth.getUser()
    user = res.data.user
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select(FIELDS.join(', '))
        .eq('user_id', user.id)
        .single()
      profile = (data as Record<string, string | null> | null) ?? null
    }
  } catch {
    // Supabase unavailable — fall through to the login redirect below
  }

  // redirect() must live outside try/catch (it throws NEXT_REDIRECT internally)
  if (!user) redirect('/login?redirectTo=/profile')

  const initial = {
    full_name:    profile?.full_name    ?? '',
    title:        profile?.title        ?? '',
    location:     profile?.location     ?? '',
    bio:          profile?.bio          ?? '',
    experience:   profile?.experience   ?? '',
    skills:       profile?.skills       ?? '',
    education:    profile?.education     ?? '',
    linkedin_url: profile?.linkedin_url ?? '',
    github_url:   profile?.github_url   ?? '',
  }

  return <ProfileForm initial={initial} email={user.email ?? ''} />
}
