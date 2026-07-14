import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Verifies the current session belongs to a signed-in admin.
 * Same shape as requireEmployer() — not signed in redirects to /login
 * (throws NEXT_REDIRECT; caller must NOT wrap this in a try/catch); signed
 * in but not an admin returns false so the caller can render its own
 * "not authorized" UI instead of a raw 500.
 *
 * Admin is a plain boolean flag on profiles (lib/auth/requireAdmin.ts +
 * supabase/reviews.sql) — there is no broader role system yet. This is
 * intentionally the smallest viable check for lot 1 of Employee Reviews;
 * a real role/permission system is out of scope here.
 */
export async function requireAdmin(redirectTo: string): Promise<boolean> {
  let viewer = null
  let isAdmin = false

  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    viewer = user
    if (user) {
      const { data } = await supabase.from('profiles').select('is_admin').eq('user_id', user.id).single()
      isAdmin = data?.is_admin ?? false
    }
  } catch {
    // fall through to the login redirect below
  }

  if (!viewer) redirect(`/login?redirectTo=${redirectTo}`)

  return isAdmin
}
