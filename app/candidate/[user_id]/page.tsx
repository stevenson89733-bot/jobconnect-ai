import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireEmployer } from '@/lib/auth/requireEmployer'
import EmployerOnlyGate from '@/components/EmployerOnlyGate'
import PublicProfileView from './PublicProfileView'

export const dynamic = 'force-dynamic'

// Explicit display fields — email and phone are intentionally NEVER selected.
const DISPLAY_FIELDS = 'full_name, title, location, bio, experience, skills, education, linkedin_url, github_url, avatar_url, years_experience, portfolio_url, availability, work_preference'

export default async function PublicCandidateProfile({ params }: { params: { user_id: string } }) {
  const targetId = params.user_id

  // Must be signed in as an employer — redirect() throws, so this call stays
  // outside any try/catch (see requireEmployer for details).
  const isEmployer = await requireEmployer(`/candidate/${targetId}`)
  if (!isEmployer) return <EmployerOnlyGate message="Candidate profiles are visible to employer accounts only." />

  // Load the target profile via the normal RLS-respecting client. The
  // "Employers can view candidate profiles" policy (supabase/
  // employer_read_candidates_proposal.sql + supabase/
  // fix_employer_read_recursion.sql) enforces the employer check at the
  // database level. Candidates only, explicit non-email fields. A
  // non-candidate / missing id yields no row.
  let profile: Record<string, string | number | null> | null = null
  try {
    const supabase = createClient()
    const { data } = await supabase
      .from('profiles')
      .select(DISPLAY_FIELDS)
      .eq('user_id', targetId)
      .eq('role', 'candidate')
      .maybeSingle()
    profile = (data as Record<string, string | number | null> | null) ?? null
  } catch {
    // Supabase unavailable / invalid id — treat as not found (no 500)
  }

  if (!profile) notFound()

  return <PublicProfileView profile={profile} />
}
