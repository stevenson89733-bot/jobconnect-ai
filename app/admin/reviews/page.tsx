import { requireAdmin } from '@/lib/auth/requireAdmin'
import { createClient } from '@/lib/supabase/server'
import AdminReviewsClient from './AdminReviewsClient'

export const dynamic = 'force-dynamic'

type ReviewRow = {
  id: string
  company_name: string
  rating: number
  review_text: string
  interview_difficulty: number | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export default async function AdminReviewsPage() {
  const isAdmin = await requireAdmin('/admin/reviews')

  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <div className="text-4xl mb-3">🔒</div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Admins only</h1>
        <p className="text-slate-600 dark:text-slate-400">You don&rsquo;t have access to this page.</p>
      </div>
    )
  }

  // Admin RLS policy (public.is_admin(auth.uid())) grants read access to
  // every review regardless of status — the moderation queue needs pending
  // ones, and approved/rejected are shown too so admins can review past
  // decisions, never a separate un-auditable moderation trail.
  const supabase = createClient()
  const { data, error } = await supabase
    .from('company_reviews')
    .select('id, company_name, rating, review_text, interview_difficulty, status, created_at')
    .order('created_at', { ascending: false })

  if (error) console.error('[admin/reviews]', error.message)

  const reviews = (data as ReviewRow[] | null) ?? []

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Review Moderation</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8">
        Approve or reject candidate reviews before they appear publicly on Company Profile pages.
      </p>
      <AdminReviewsClient reviews={reviews} />
    </div>
  )
}
