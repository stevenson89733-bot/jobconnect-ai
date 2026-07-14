// Real weekly bucketing of the candidate's own applications/saved-jobs
// timestamps — no synthetic/interpolated data points. A week with zero real
// rows is a real zero, not a gap to be filled in.

export type WeekBucket = { weekLabel: string; applications: number; savedJobs: number }

const DAY_MS = 24 * 60 * 60 * 1000
const WEEK_MS = 7 * DAY_MS

export function buildWeeklyActivity(
  applicationDates: string[],
  savedJobDates: string[],
  weeks = 8
): WeekBucket[] {
  const now = Date.now()

  const buckets: WeekBucket[] = Array.from({ length: weeks }, (_, i) => {
    const weeksAgo = weeks - 1 - i
    const weekStart = new Date(now - (weeksAgo + 1) * WEEK_MS)
    return {
      weekLabel: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      applications: 0,
      savedJobs: 0,
    }
  })

  const bucketIndexFor = (dateStr: string): number | null => {
    const t = new Date(dateStr).getTime()
    if (Number.isNaN(t)) return null
    const weeksAgo = Math.floor((now - t) / WEEK_MS)
    const idx = weeks - 1 - weeksAgo
    return idx >= 0 && idx < weeks ? idx : null
  }

  for (const d of applicationDates) {
    const idx = bucketIndexFor(d)
    if (idx != null) buckets[idx].applications++
  }
  for (const d of savedJobDates) {
    const idx = bucketIndexFor(d)
    if (idx != null) buckets[idx].savedJobs++
  }

  return buckets
}
