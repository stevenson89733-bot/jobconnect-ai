'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { submitCompanyReview } from '@/app/actions/reviews'
import { timeAgo, type OwnReview, type PublicReview } from '@/lib/reviews'

function Stars({ rating, label }: { rating: number; label: string }) {
  return (
    <div className="flex gap-0.5 text-amber-500 dark:text-amber-400" aria-label={label}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= rating ? '' : 'text-slate-300 dark:text-slate-700'}>★</span>
      ))}
    </div>
  )
}

function WriteReviewForm({ companyName, onSubmitted }: { companyName: string; onSubmitted: (review: OwnReview) => void }) {
  const t = useTranslations('companyProfile')
  const [rating, setRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  // null = not set — an optional field, never defaulted to a number the
  // candidate didn't actually pick.
  const [interviewDifficulty, setInterviewDifficulty] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reviewText.trim()) return
    setSubmitting(true)
    setError('')
    const res = await submitCompanyReview({ companyName, rating, reviewText, interviewDifficulty })
    if (res.ok) {
      onSubmitted({
        id: 'local-pending',
        rating,
        review_text: reviewText.trim(),
        interview_difficulty: interviewDifficulty,
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
      <h3 className="font-semibold text-slate-900 dark:text-white">{t('writeReview')}</h3>
      <div>
        <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1.5">{t('rating')}</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className={`text-2xl leading-none ${n <= rating ? 'text-amber-500 dark:text-amber-400' : 'text-slate-300 dark:text-slate-700'}`}
              aria-label={t('starsLabel', { count: n })}
            >
              ★
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1.5">{t('interviewDifficultyOptional')}</label>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setInterviewDifficulty(interviewDifficulty === n ? null : n)}
              className={`w-8 h-8 rounded-full text-sm font-medium border transition-colors ${
                interviewDifficulty === n
                  ? 'bg-primary text-white border-primary'
                  : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
              aria-label={t('interviewDifficultyOf5', { count: n })}
              aria-pressed={interviewDifficulty === n}
            >
              {n}
            </button>
          ))}
          {interviewDifficulty != null && (
            <button
              type="button"
              onClick={() => setInterviewDifficulty(null)}
              className="text-xs text-slate-600 dark:text-slate-400 hover:underline ml-1"
            >
              {t('clear')}
            </button>
          )}
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{t('difficultyScaleNote')}</p>
      </div>
      <div>
        <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1.5">{t('yourReview')}</label>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          rows={5}
          required
          placeholder={t('reviewPlaceholder')}
          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary resize-none"
        />
      </div>
      {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
      <p className="text-xs text-slate-600 dark:text-slate-400">{t('anonymityNote')}</p>
      <button type="submit" disabled={submitting} className="btn-primary text-sm px-5 py-2 disabled:opacity-50">
        {submitting ? t('submitting') : t('submitReview')}
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
  const t = useTranslations('companyProfile')
  const [ownReview, setOwnReview] = useState(initialOwnReview)

  const average = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : null

  // Only ever computed from reviews that actually have a real submitted
  // value — never shown at all if zero approved reviews filled it in.
  const difficultyValues = reviews.map((r) => r.interview_difficulty).filter((v): v is number => v != null)
  const averageDifficulty = difficultyValues.length > 0
    ? difficultyValues.reduce((sum, v) => sum + v, 0) / difficultyValues.length
    : null

  const statusLabel: Record<OwnReview['status'], string> = {
    pending: t('statusPending'),
    approved: t('statusApproved'),
    rejected: t('statusRejected'),
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-semibold text-slate-900 dark:text-white">
          {reviews.length > 0 ? t('reviewsCount', { count: reviews.length }) : t('reviews')}
        </h2>
        {average != null && (
          <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <Stars rating={Math.round(average)} label={t('starsOutOf5', { count: Math.round(average) })} />
            <span>{t('averageRating', { rating: average.toFixed(1) })}</span>
          </div>
        )}
      </div>

      {averageDifficulty != null && (
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {t('averageInterviewDifficulty')} <span className="font-medium text-slate-900 dark:text-white">{averageDifficulty.toFixed(1)}/5</span>
          {' '}{t('basedOnReviews', { count: difficultyValues.length })}
        </p>
      )}

      {reviews.length === 0 ? (
        <div className="card text-center py-10 text-slate-600 dark:text-slate-400">
          <div className="text-3xl mb-2">💬</div>
          <p className="text-sm">{t('noReviewsYet', { name: companyName })}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="card">
              <div className="flex items-center justify-between mb-2">
                <Stars rating={r.rating} label={t('starsOutOf5', { count: r.rating })} />
                <span className="text-xs text-slate-600 dark:text-slate-400">{timeAgo(r.created_at)}</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap mb-2">{r.review_text}</p>
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">{t('verifiedCandidate')}</p>
                {r.interview_difficulty != null && (
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {t('interviewDifficultyValue', { value: r.interview_difficulty })}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {ownReview ? (
        <div className="card border-primary/30">
          <p className="text-sm text-slate-700 dark:text-slate-300 mb-1">
            <span className="font-medium">{t('yourReviewLabel')}</span> {statusLabel[ownReview.status]}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Stars rating={ownReview.rating} label={t('starsOutOf5', { count: ownReview.rating })} />
          </div>
          {ownReview.interview_difficulty != null && (
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {t('interviewDifficultyValue', { value: ownReview.interview_difficulty })}
            </p>
          )}
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 whitespace-pre-wrap">{ownReview.review_text}</p>
        </div>
      ) : canReview ? (
        <WriteReviewForm companyName={companyName} onSubmitted={setOwnReview} />
      ) : null}
    </div>
  )
}
