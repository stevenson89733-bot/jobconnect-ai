'use client'

import Link from 'next/link'

type Props = {
  count: number
  previews: { company: string; title: string; matchScore: number | null; coverLetterExcerpt: string }[]
}

export default function PendingReviewBanner({ count, previews }: Props) {
  if (count === 0) return null

  return (
    <div className="rounded-2xl border border-amber-300 dark:border-amber-600/50 bg-amber-50 dark:bg-amber-900/20 p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📋</span>
          <div>
            <p className="font-semibold text-amber-900 dark:text-amber-200">
              {count} application{count === 1 ? '' : 's'} ready for your review
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              Auto-Apply drafted these for you. Review and approve before they&apos;re sent.
            </p>
          </div>
        </div>
        <Link
          href="/candidate/applications?filter=pending_review"
          className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors"
        >
          Review now →
        </Link>
      </div>

      {previews.length > 0 && (
        <div className="mt-4 space-y-2">
          {previews.map((p, i) => (
            <div key={i} className="rounded-xl bg-white dark:bg-slate-800/60 border border-amber-200 dark:border-amber-700/40 px-4 py-3">
              <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                <span className="text-sm font-medium text-slate-900 dark:text-white">{p.title}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{p.company}</span>
                {p.matchScore !== null && (
                  <span className="text-xs font-semibold text-green-700 dark:text-green-400 ml-auto">{p.matchScore}% match</span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 italic">&ldquo;{p.coverLetterExcerpt}&rdquo;</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
