import { unstable_cache } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/public'

/**
 * Number of live job listings — the same definition as the /jobs total
 * (`is_active = true`), counted with a HEAD request (no rows fetched).
 * Cached for an hour and tagged 'jobs' so POST /api/jobs can refresh it.
 * Returns null on any failure (missing env at build, DB error) so callers
 * hide the stat instead of showing an invented number.
 */
export const getActiveJobCount = unstable_cache(
  async (): Promise<number | null> => {
    try {
      const { count, error } = await createPublicClient()
        .from('jobs')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true)
      if (error) {
        console.error('[jobStats] active job count failed:', error.message)
        return null
      }
      return count ?? null
    } catch (err) {
      console.error('[jobStats] active job count failed:', err instanceof Error ? err.message : err)
      return null
    }
  },
  ['active-job-count'],
  { revalidate: 3600, tags: ['jobs'] }
)

/**
 * Rounds down to the nearest hundred (from 1,000 up) so a "3,200+" label
 * stays true even if the cached count is up to an hour old.
 */
export function floorForDisplay(count: number): number {
  return count >= 1000 ? Math.floor(count / 100) * 100 : count
}
