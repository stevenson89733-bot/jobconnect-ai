import type { SupabaseClient } from '@supabase/supabase-js'

export type ReviewStatus = 'pending' | 'approved' | 'rejected'

// Public-facing shape — deliberately has no candidate_id field at all
// (matches company_reviews_public, which never selects it).
export type PublicReview = {
  id: string
  company_name: string
  rating: number
  review_text: string
  created_at: string
}

// The candidate's own review of a company — includes status so the UI can
// show "pending"/"rejected" instead of a duplicate submit form.
export type OwnReview = {
  id: string
  rating: number
  review_text: string
  status: ReviewStatus
  created_at: string
}

export const MAX_REVIEW_TEXT_LENGTH = 4000

// Real application on record for a job at this company — same ilike match
// the Company Profile page itself already uses to find this company's jobs.
export async function candidateHasApplicationAt(
  supabase: SupabaseClient,
  candidateId: string,
  companyName: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('applications')
    .select('id, jobs!job_id(company_name)')
    .eq('candidate_id', candidateId)

  if (error || !data) return false

  return data.some((row) => {
    const job = Array.isArray(row.jobs) ? row.jobs[0] : row.jobs
    const jobCompany = (job as { company_name?: string } | null)?.company_name
    return !!jobCompany && jobCompany.toLowerCase() === companyName.toLowerCase()
  })
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return '1d ago'
  if (days < 7) return `${days}d ago`
  if (days < 14) return '1w ago'
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}
