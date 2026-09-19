'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

type ProfileFields = {
  full_name?: string | null
  title?: string | null
  skills?: string | null
  cv_url?: string | null
  linkedin_url?: string | null
  bio?: string | null
}

const FIELDS: { key: keyof ProfileFields; label: string }[] = [
  { key: 'full_name',     label: 'Full name' },
  { key: 'title',         label: 'Job title / headline' },
  { key: 'skills',        label: 'Skills' },
  { key: 'cv_url',        label: 'CV / résumé' },
  { key: 'linkedin_url',  label: 'LinkedIn URL' },
  { key: 'bio',           label: 'Bio' },
]

function isFilled(value: string | null | undefined): boolean {
  return !!value?.trim()
}

export default function ProfileCompletion({ profile }: { profile: ProfileFields | null }) {
  const filled   = FIELDS.filter((f) => isFilled(profile?.[f.key]))
  const missing  = FIELDS.filter((f) => !isFilled(profile?.[f.key]))
  const pct      = Math.round((filled.length / FIELDS.length) * 100)
  const complete = pct >= 100

  // Animate bar on mount
  const [width, setWidth] = useState(0)
  const rafRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    rafRef.current = setTimeout(() => setWidth(pct), 80)
    return () => { if (rafRef.current) clearTimeout(rafRef.current) }
  }, [pct])

  if (complete) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 w-fit">
        <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <span className="text-sm font-semibold text-green-700 dark:text-green-400">Profile complete</span>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-card p-5 space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Profile Completion</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Complete your profile to get better job matches
          </p>
        </div>
        <span
          className="text-2xl font-bold tabular-nums"
          style={{ color: '#57C7E3' }}
        >
          {pct}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${width}%`, backgroundColor: '#57C7E3' }}
        />
      </div>

      {/* Missing items */}
      {missing.length > 0 && (
        <ul className="space-y-1.5">
          {missing.map((f) => (
            <li key={f.key} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <span className="w-4 h-4 shrink-0 rounded border border-slate-300 dark:border-slate-600 inline-flex items-center justify-center">
                {/* empty checkbox */}
              </span>
              {f.label}
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/profile"
        className="inline-block text-xs font-semibold rounded-lg px-4 py-2 text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: '#57C7E3' }}
      >
        Complete my profile →
      </Link>
    </div>
  )
}
