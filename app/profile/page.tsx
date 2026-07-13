import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { parseProjects, parseCertificates, parseLanguages } from '@/lib/profileSections'
import ProfileEditor from './ProfileEditor'

export const dynamic = 'force-dynamic'

const FIELDS = [
  'full_name', 'title', 'location', 'bio', 'experience', 'skills', 'education',
  'linkedin_url', 'github_url', 'avatar_url', 'years_experience', 'phone',
  'portfolio_url', 'availability', 'work_preference', 'is_premium',
  'projects', 'certificates', 'languages',
] as const

export default async function ProfilePage() {
  let user = null
  let profile: Record<string, unknown> | null = null
  let atsScore: number | null = null
  let profileStrength: number | null = null
  let analysisGeneratedAt: string | null = null

  try {
    const supabase = createClient()
    const res = await supabase.auth.getUser()
    user = res.data.user
    if (user) {
      const [{ data }, { data: analysisRow }] = await Promise.all([
        supabase.from('profiles').select(FIELDS.join(', ')).eq('user_id', user.id).single(),
        supabase.from('career_analysis').select('analysis_json, generated_at').eq('candidate_id', user.id).maybeSingle(),
      ])
      profile = (data as Record<string, unknown> | null) ?? null

      // Reads the ONE existing career_analysis result — never a second
      // scoring system computed on this page.
      const analysisJson = analysisRow?.analysis_json as { atsScore?: { score?: number }; profileStrength?: { score?: number } } | undefined
      atsScore = analysisJson?.atsScore?.score ?? null
      profileStrength = analysisJson?.profileStrength?.score ?? null
      analysisGeneratedAt = analysisRow?.generated_at ?? null
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
  const isPremium = !!profile?.is_premium

  return (
    <ProfileEditor
      initial={initial}
      email={user.email ?? ''}
      avatarUrl={avatarUrl}
      isPremium={isPremium}
      atsScore={atsScore}
      profileStrength={profileStrength}
      analysisGeneratedAt={analysisGeneratedAt}
      initialProjects={parseProjects(profile?.projects)}
      initialCertificates={parseCertificates(profile?.certificates)}
      initialLanguages={parseLanguages(profile?.languages)}
    />
  )
}
