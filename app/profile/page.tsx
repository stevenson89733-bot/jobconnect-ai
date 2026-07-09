import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileForm from './ProfileForm'

export const dynamic = 'force-dynamic'

const FIELDS = [
  'full_name', 'title', 'location', 'bio', 'experience', 'skills', 'education',
  'linkedin_url', 'github_url', 'avatar_url', 'years_experience', 'phone',
  'portfolio_url', 'availability', 'work_preference',
] as const

export default async function ProfilePage() {
  let user = null
  let profile: Record<string, string | number | null> | null = null
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
      profile = (data as Record<string, string | number | null> | null) ?? null
    }
  } catch {
    // Supabase unavailable — fall through to the login redirect below
  }

  // redirect() must live outside try/catch (it throws NEXT_REDIRECT internally)
  if (!user) redirect('/login?redirectTo=/profile')

  const initial = {
    full_name:        String(profile?.full_name    ?? ''),
    title:            String(profile?.title        ?? ''),
    location:         String(profile?.location     ?? ''),
    bio:              String(profile?.bio          ?? ''),
    experience:       String(profile?.experience   ?? ''),
    skills:           String(profile?.skills       ?? ''),
    education:        String(profile?.education    ?? ''),
    linkedin_url:     String(profile?.linkedin_url ?? ''),
    github_url:       String(profile?.github_url   ?? ''),
    years_experience: profile?.years_experience != null ? String(profile.years_experience) : '',
    phone:            String(profile?.phone           ?? ''),
    portfolio_url:    String(profile?.portfolio_url    ?? ''),
    availability:     String(profile?.availability     ?? ''),
    work_preference:  String(profile?.work_preference  ?? ''),
  }

  const avatarUrl = profile?.avatar_url ? String(profile.avatar_url) : null

  return <ProfileForm initial={initial} email={user.email ?? ''} avatarUrl={avatarUrl} />
}
