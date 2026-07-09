import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Verifies the current session belongs to a signed-in employer.
 * - Not signed in → redirects to /login (throws NEXT_REDIRECT; caller must
 *   NOT wrap this in a try/catch).
 * - Signed in but not an employer → returns false; the caller should render
 *   its own "employers only" UI rather than a raw 500 or silent failure.
 * - Signed in employer → returns true.
 */
export async function requireEmployer(redirectTo: string): Promise<boolean> {
  let viewer = null
  let role: string | null = null

  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    viewer = user
    if (user) {
      const { data } = await supabase.from('profiles').select('role').eq('user_id', user.id).single()
      role = data?.role ?? null
    }
  } catch {
    // fall through to the login redirect below
  }

  if (!viewer) redirect(`/login?redirectTo=${redirectTo}`)

  return role === 'employer'
}
