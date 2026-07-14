'use client'
import { useState } from 'react'
import { moderateCompanyReview } from '@/app/actions/reviews'
import { timeAgo } from '@/lib/reviews'

type ReviewStatus = 'pending' | 'approved' | 'rejected'
type ReviewRow = {
  id: string
  company_name: string
  rating: number
  review_text: string
  interview_difficulty: number | null
  status: ReviewStatus
  created_at: string
}

const STATUS_BADGE: Record<ReviewStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  approved: 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
}

function ReviewRowCard({ review, onDecide }: { review: ReviewRow; onDecide: (id: string, status: ReviewStatus) => void }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  async function decide(decision: 'approved' | 'rejected') {
    setPending(true)
    setError('')
    const res = await moderateCompanyReview(review.id, decision)
    if (res.ok) {
      onDecide(review.id, decision)
    } else {
      setError(res.error)
    }
    setPending(false)
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900 dark:text-white">{review.company_name}</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[review.status]}`}>
            {review.status}
          </span>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-500">{timeAgo(review.created_at)}</span>
      </div>
      <p className="text-sm text-amber-500 dark:text-amber-400 mb-2">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
      {review.interview_difficulty != null && (
        <p className="text-xs text-slate-500 dark:text-slate-500 mb-2">
          Interview difficulty: <span className="font-medium text-slate-700 dark:text-slate-300">{review.interview_difficulty}/5</span>
        </p>
      )}
      <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap mb-3">{review.review_text}</p>
      {error && <p className="text-red-600 dark:text-red-400 text-xs mb-2">{error}</p>}
      {review.status === 'pending' && (
        <div className="flex gap-2">
          <button
            onClick={() => decide('approved')}
            disabled={pending}
            className="btn-primary text-xs px-4 py-2 disabled:opacity-50"
          >
            ✓ Approve
          </button>
          <button
            onClick={() => decide('rejected')}
            disabled={pending}
            className="btn-outline text-xs px-4 py-2 disabled:opacity-50"
          >
            ✕ Reject
          </button>
        </div>
      )}
    </div>
  )
}

export default function AdminReviewsClient({ reviews: initialReviews }: { reviews: ReviewRow[] }) {
  const [reviews, setReviews] = useState(initialReviews)

  function handleDecide(id: string, status: ReviewStatus) {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
  }

  const pending = reviews.filter((r) => r.status === 'pending')
  const decided = reviews.filter((r) => r.status !== 'pending')

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-semibold text-slate-900 dark:text-white mb-3">
          Pending ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-500">Nothing waiting on moderation.</p>
        ) : (
          <div className="space-y-3">
            {pending.map((r) => (
              <ReviewRowCard key={r.id} review={r} onDecide={handleDecide} />
            ))}
          </div>
        )}
      </div>

      {decided.length > 0 && (
        <div>
          <h2 className="font-semibold text-slate-900 dark:text-white mb-3">Past decisions</h2>
          <div className="space-y-3">
            {decided.map((r) => (
              <ReviewRowCard key={r.id} review={r} onDecide={handleDecide} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
