import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireEmployer } from '@/lib/auth/requireEmployer'
import EmployerOnlyGate from '@/components/EmployerOnlyGate'
import PublicProfileView from './PublicProfileView'

export const dynamic = 'force-dynamic'

// Explicit display fields — email is intentionally NEVER selected.
const DISPLAY_FIELDS = 'full_name, title, location, bio, experience, skills, education, linkedin_url, github_url'

export default async function PublicCandidateProfile({ params }: { params: { user_id: string } }) {
  const targetId = params.user_id

  // Must be signed in as an employer — redirect() throws, so this call stays
  // outside any try/catch (see requireEmployer for details).
  const isEmployer = await requireEmployer(`/candidate/${targetId}`)
  if (!isEmployer) return <EmployerOnlyGate message="Candidate profiles are visible to employer accounts only." />

  // Load the target profile via service-role (bypasses RLS). Candidates only,
  // explicit non-email fields. A non-candidate / missing id yields no row.
  //
  // TODO: service-role bypass, not the intended end state — see
  // supabase/employer_read_candidates_proposal.sql. Once that RLS policy is
  // applied, swap createAdminClient() for the normal createClient() so the
  // database (not just requireEmployer()) enforces the employer check.
  let profile: Record<string, string | null> | null = null
  try {
    const admin = createAdminClient()
    const { data } = await admin
      .from('profiles')
      .select(DISPLAY_FIELDS)
      .eq('user_id', targetId)
      .eq('role', 'candidate')
      .maybeSingle()
    profile = (data as Record<string, string | null> | null) ?? null
  } catch {
    // service role unavailable / invalid id — treat as not found (no 500)
  }

  if (!profile) notFound()

  return <PublicProfileView profile={profile} />
}
