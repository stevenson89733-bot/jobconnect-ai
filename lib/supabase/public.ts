import { createClient } from '@supabase/supabase-js'

/**
 * Anonymous, cookie-free Supabase client for public reads that need to be
 * wrapped in unstable_cache().
 *
 * unstable_cache() forbids calling dynamic APIs (cookies()/headers()) inside
 * the cached function, so the cookie-based createClient() in
 * lib/supabase/server.ts can't be used here — its cookies() call would also
 * force the whole route back into dynamic rendering, defeating the point of
 * caching. This client only ever uses the anon key against RLS policies that
 * are already public (no session required), e.g. "Public can view active
 * jobs" on public.jobs.
 */
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase env vars not configured')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}
