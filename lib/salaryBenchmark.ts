import type { SupabaseClient } from '@supabase/supabase-js'

// Real market comparison, not a personal salary history (no such data
// exists or can exist without fabrication — confirmed in the Analytics
// Dashboard audit). Matches active job postings against the candidate's
// own real target role text using the same plain ilike substring
// approach already used for job search (lib/jobsQuery.ts) — no new
// fuzzy-matching system invented for this.
const MIN_SAMPLE_SIZE = 3

export type SalaryBenchmark =
  | { status: 'no_target_role' }
  | { status: 'insufficient_data'; targetRole: string; sampleSize: number }
  | { status: 'ok'; targetRole: string; sampleSize: number; averageSalary: number; rangeMin: number; rangeMax: number }

export async function computeSalaryBenchmark(
  supabase: SupabaseClient,
  targetRole: string | null | undefined
): Promise<SalaryBenchmark> {
  const role = (targetRole ?? '').trim()
  if (!role) return { status: 'no_target_role' }

  const escaped = role.replace(/[%_]/g, (c) => `\\${c}`)
  const { data, error } = await supabase
    .from('jobs')
    .select('salary_min, salary_max')
    .eq('is_active', true)
    .ilike('title', `%${escaped}%`)
    .not('salary_min', 'is', null)

  if (error) {
    console.error('[salaryBenchmark]', error.message)
    return { status: 'insufficient_data', targetRole: role, sampleSize: 0 }
  }

  const rows = (data ?? []) as { salary_min: number; salary_max: number | null }[]
  if (rows.length < MIN_SAMPLE_SIZE) {
    return { status: 'insufficient_data', targetRole: role, sampleSize: rows.length }
  }

  const midpoints = rows.map((r) => (r.salary_max != null ? (r.salary_min + r.salary_max) / 2 : r.salary_min))
  const averageSalary = Math.round(midpoints.reduce((sum, v) => sum + v, 0) / midpoints.length)
  const rangeMin = Math.min(...rows.map((r) => r.salary_min))
  const rangeMax = Math.max(...rows.map((r) => r.salary_max ?? r.salary_min))

  return { status: 'ok', targetRole: role, sampleSize: rows.length, averageSalary, rangeMin, rangeMax }
}
