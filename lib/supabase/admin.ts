import { createClient } from '@supabase/supabase-js'

/**
 * Service-role Supabase client — BYPASSES Row Level Security.
 * SERVER-ONLY: it reads SUPABASE_SERVICE_ROLE_KEY. Never import this into a
 * client component or expose the key to the browser.
 *
 * Current callers: app/candidates/page.tsx and app/candidate/[user_id]/page.tsx,
 * to let a signed-in employer read candidate profiles. That's a temporary
 * workaround, not the intended end state — see
 * supabase/employer_read_candidates_proposal.sql for the additive RLS policy
 * that would let those reads go through the normal (RLS-respecting) client
 * instead, with the database enforcing the employer check rather than only
 * application code (lib/auth/requireEmployer.ts).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase service role not configured')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}
