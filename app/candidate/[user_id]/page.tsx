import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import PublicProfileView from './PublicProfileView'

export const dynamic = 'force-dynamic'

// Explicit display fields — email is intentionally NEVER selected.
const DISPLAY_FIELDS = 'full_name, title, bio, experience, skills, education, linkedin_url, github_url'

function AccessDenied() {
  return (
    <div className="max-w-xl mx-auto px-6 py-24 text-center">
      <div className="text-5xl mb-4">🔒</div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Employers only</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-6">
        Candidate profiles are visible to employer accounts only.
      </p>
      <Link href="/dashboard" className="btn-primary text-sm px-6 py-2.5">Back to dashboard</Link>
    </div>
  )
}

export default async function PublicCandidateProfile({ params }: { params: { user_id: string } }) {
  const targetId = params.user_id

  // 1) Must be signed in — read the viewer + their role SERVER-SIDE.
  let viewer = null
  let viewerRole: string | null = null
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    viewer = user
    if (user) {
      const { data } = await supabase.from('profiles').select('role').eq('user_id', user.id).single()
      viewerRole = data?.role ?? null
    }
  } catch {
    // fall through to the login redirect below
  }

  // redirect() throws NEXT_REDIRECT — keep it out of try/catch
  if (!viewer) redirect(`/login?redirectTo=/candidate/${targetId}`)

  // 2) Access reserved to employers — clean refusal, never a 500.
  if (viewerRole !== 'employer') return <AccessDenied />

  // 3) Load the target profile via service-role (bypasses RLS). Candidates only,
  //    explicit non-email fields. A non-candidate / missing id yields no row.
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
