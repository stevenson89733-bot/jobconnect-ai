'use client'
import { useState } from 'react'
import { submitCompanyReview } from '@/app/actions/reviews'
import { timeAgo, type OwnReview, type PublicReview } from '@/lib/reviews'

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 text-amber-500 dark:text-amber-400" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= rating ? '' : 'text-slate-300 dark:text-slate-700'}>★</span>
      ))}
    </div>
  )
}

const STATUS_LABEL: Record<OwnReview['status'], string> = {
  pending: 'Pending review — visible once approved by our team.',
  approved: 'Approved — visible publicly on this page.',
  rejected: 'Not approved for public display.',
}

function WriteReviewForm({ companyName, onSubmitted }: { companyName: string; onSubmitted: (review: OwnReview) => void }) {
  const [rating, setRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reviewText.trim()) return
    setSubmitting(true)
    setError('')
    const res = await submitCompanyReview({ companyName, rating, reviewText })
    if (res.ok) {
      onSubmitted({
        id: 'local-pending',
        rating,
        review_text: reviewText.trim(),
        status: 'pending',
        created_at: new Date().toISOString(),
      })
    } else {
      setError(res.error)
    }
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-3">
      <h3 className="font-semibold text-slate-900 dark:text-white">Write a Review</h3>
      <div>
        <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1.5">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className={`text-2xl leading-none ${n <= rating ? 'text-amber-500 dark:text-amber-400' : 'text-slate-300 dark:text-slate-700'}`}
              aria-label={`${n} star${n === 1 ? '' : 's'}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1.5">Your Review</label>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          rows={5}
          required
          placeholder="Share your real experience as an applicant at this company..."
          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary resize-none"
        />
      </div>
      {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
      <p className="text-xs text-slate-500 dark:text-slate-500">
        Your review is published anonymously as &ldquo;Verified Candidate&rdquo; — never with your name. It won&rsquo;t appear publicly until approved.
      </p>
      <button type="submit" disabled={submitting} className="btn-primary text-sm px-5 py-2 disabled:opacity-50">
        {submitting ? 'Submitting…' : 'Submit Review'}
      </button>
    </form>
  )
}

export default function ReviewsSection({
  companyName,
  reviews,
  canReview,
  ownReview: initialOwnReview,
}: {
  companyName: string
  reviews: PublicReview[]
  canReview: boolean
  ownReview: OwnReview | null
}) {
  const [ownReview, setOwnReview] = useState(initialOwnReview)

  const average = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : null

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-semibold text-slate-900 dark:text-white">
          Reviews {reviews.length > 0 ? `(${reviews.length})` : ''}
        </h2>
        {average != null && (
          <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <Stars rating={Math.round(average)} />
            <span>{average.toFixed(1)} average</span>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="card text-center py-10 text-slate-600 dark:text-slate-500">
          <div className="text-3xl mb-2">💬</div>
          <p className="text-sm">No reviews yet for {companyName}.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="card">
              <div className="flex items-center justify-between mb-2">
                <Stars rating={r.rating} />
                <span className="text-xs text-slate-500 dark:text-slate-500">{timeAgo(r.created_at)}</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap mb-2">{r.review_text}</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-500">Verified Candidate</p>
            </div>
          ))}
        </div>
      )}

      {ownReview ? (
        <div className="card border-primary/30">
          <p className="text-sm text-slate-700 dark:text-slate-300 mb-1">
            <span className="font-medium">Your review:</span> {STATUS_LABEL[ownReview.status]}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Stars rating={ownReview.rating} />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 whitespace-pre-wrap">{ownReview.review_text}</p>
        </div>
      ) : canReview ? (
        <WriteReviewForm companyName={companyName} onSubmitted={setOwnReview} />
      ) : null}
    </div>
  )
}
