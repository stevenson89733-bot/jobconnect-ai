'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

const FEATURES_FREE = [
  'Browse all remote jobs',
  'Apply to unlimited jobs',
  'AI match scores',
  'Candidate dashboard',
]

const FEATURES_PREMIUM = [
  'Everything in Free',
  'AI Resume Builder (GPT-4o)',
  'AI Cover Letter Generator',
  'ATS Resume Score (0–100)',
  'PDF downloads',
  'Improvement tips',
  'Priority support',
]

export default function PricingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const success  = searchParams.get('success')  === 'true'
  const canceled = searchParams.get('canceled') === 'true'

  useEffect(() => {
    if (canceled) setError('Payment canceled — you were not charged.')
  }, [canceled])

  useEffect(() => {
    if (success) router.refresh()
  }, [success, router])

  async function handleUpgrade() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/stripe/checkout', { method: 'POST' })
    if (res.status === 401) {
      window.location.href = '/login?redirectTo=/pricing'
      return
    }
    const data = await res.json()
    if (data.error) {
      setError(data.error)
      setLoading(false)
      return
    }
    window.location.href = data.url
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-3">Simple, honest pricing</h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg">Start free. Unlock AI tools when you&apos;re ready.</p>
      </div>

      {success && (
        <div className="mb-8 p-5 bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-xl text-center">
          <p className="text-green-700 dark:text-green-400 font-semibold mb-3">🎉 Welcome to Premium! Your AI tools are now unlocked.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="/ai-tools/resume-builder" className="btn-primary text-sm py-2 px-5">
              AI Resume Builder →
            </a>
            <a href="/ai-tools/cover-letter" className="btn-outline text-sm py-2 px-5">
              AI Cover Letter →
            </a>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl text-red-700 dark:text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Free plan */}
        <div className="card flex flex-col">
          <div className="mb-6">
            <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Free</div>
            <div className="text-4xl font-extrabold text-slate-900 dark:text-white">$0</div>
            <div className="text-slate-600 dark:text-slate-400 text-sm mt-1">Forever free</div>
          </div>
          <ul className="space-y-3 mb-8 flex-1">
            {FEATURES_FREE.map(f => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                <span className="text-green-600 dark:text-green-400 shrink-0">✓</span> {f}
              </li>
            ))}
          </ul>
          <Link href="/jobs" className="btn-outline text-sm py-3 text-center block">
            Browse Jobs
          </Link>
        </div>

        {/* Premium plan */}
        <div className="card border-primary/50 bg-gradient-to-br from-primary/5 to-white dark:to-card flex flex-col relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <span className="text-xs font-semibold bg-orange-700 text-white px-2.5 py-1 rounded-full">Most Popular</span>
          </div>
          <div className="mb-6">
            <div className="text-sm font-semibold text-primary dark:text-blue-400 uppercase tracking-wider mb-1">Premium</div>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white">$19</span>
              <span className="text-slate-600 dark:text-slate-400 mb-1">/mo</span>
            </div>
            <div className="text-slate-600 dark:text-slate-400 text-sm mt-1">Cancel anytime</div>
          </div>
          <ul className="space-y-3 mb-8 flex-1">
            {FEATURES_PREMIUM.map(f => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                <span className="text-orange-600 dark:text-accent shrink-0">✦</span> {f}
              </li>
            ))}
          </ul>
          {error && !canceled && (
            <p className="text-red-600 dark:text-red-400 text-xs mb-3">{error}</p>
          )}
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="btn-primary py-3 text-sm font-semibold disabled:opacity-50 w-full"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Redirecting to Stripe…
              </span>
            ) : 'Upgrade to Premium — $19/mo'}
          </button>
          <p className="text-xs text-slate-600 dark:text-slate-400 text-center mt-3">
            Secure payment via Stripe · Test mode active
          </p>
        </div>
      </div>
    </div>
  )
}
