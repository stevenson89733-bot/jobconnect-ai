'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

export default function PricingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('pricing')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const success  = searchParams.get('success')  === 'true'
  const canceled = searchParams.get('canceled') === 'true'
  // Real, shareable deep link — PostJobModal's "View plans" link on a
  // blocked 2nd posting sends employers straight to this tab.
  const [tab, setTab] = useState<'candidates' | 'employers'>(
    searchParams.get('for') === 'employers' ? 'employers' : 'candidates'
  )

  useEffect(() => {
    if (canceled) setError(t('paymentCanceled'))
  }, [canceled, t])

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
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-3">{t('pageTitle')}</h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg">{t('pageSubtitle')}</p>
      </div>

      {/* Candidate / Employer tabs — clearly separates the two real pricing
          models rather than mixing them into one grid. */}
      <div className="flex justify-center gap-2 mb-10">
        <button
          onClick={() => setTab('candidates')}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            tab === 'candidates'
              ? 'bg-primary text-white'
              : 'border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600'
          }`}
        >
          {t('forCandidates')}
        </button>
        <button
          onClick={() => setTab('employers')}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            tab === 'employers'
              ? 'bg-primary text-white'
              : 'border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600'
          }`}
        >
          {t('forEmployers')}
        </button>
      </div>

      {success && tab === 'candidates' && (
        <div className="mb-8 p-5 bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-xl text-center">
          <p className="text-green-700 dark:text-green-400 font-semibold mb-3">{t('successTitle')}</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="/ai-tools/resume-builder" className="btn-primary text-sm py-2 px-5">{t('goToResumeBuilder')}</a>
            <a href="/ai-tools/cover-letter" className="btn-outline text-sm py-2 px-5">{t('goToCoverLetter')}</a>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl text-red-700 dark:text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {tab === 'candidates' ? (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Free plan */}
          <div className="card flex flex-col">
            <div className="mb-6">
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">{t('candidateFreeLabel')}</div>
              <div className="text-4xl font-extrabold text-slate-900 dark:text-white">$0</div>
              <div className="text-slate-600 dark:text-slate-400 text-sm mt-1">{t('candidateFreeDesc')}</div>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {[t('candidateFreeFeature1'), t('candidateFreeFeature2'), t('candidateFreeFeature3'), t('candidateFreeFeature4')].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                  <span className="text-green-600 dark:text-green-400 shrink-0">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/jobs" className="btn-outline text-sm py-3 text-center block">{t('browseJobs')}</Link>
          </div>

          {/* Premium plan */}
          <div className="card border-primary/50 bg-gradient-to-br from-primary/5 to-white dark:to-card flex flex-col relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="text-xs font-semibold bg-orange-700 text-white px-2.5 py-1 rounded-full">{t('mostPopular')}</span>
            </div>
            <div className="mb-6">
              <div className="text-sm font-semibold text-primary dark:text-blue-400 uppercase tracking-wider mb-1">{t('candidatePremiumLabel')}</div>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">$19</span>
                <span className="text-slate-600 dark:text-slate-400 mb-1">{t('candidatePremiumPeriod')}</span>
              </div>
              <div className="text-slate-600 dark:text-slate-400 text-sm mt-1">{t('candidatePremiumDesc')}</div>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {[
                t('candidatePremiumFeature1'), t('candidatePremiumFeature2'), t('candidatePremiumFeature3'),
                t('candidatePremiumFeature4'), t('candidatePremiumFeature5'), t('candidatePremiumFeature6'), t('candidatePremiumFeature7'),
              ].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                  <span className="text-orange-600 dark:text-accent shrink-0">✦</span> {f}
                </li>
              ))}
            </ul>
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
                  {t('redirectingToStripe')}
                </span>
              ) : t('upgradeButton')}
            </button>
            <p className="text-xs text-slate-600 dark:text-slate-400 text-center mt-3">{t('stripeNote')}</p>
          </div>
        </div>
      ) : (
        <div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Employer Free plan */}
            <div className="card flex flex-col">
              <div className="mb-6">
                <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">{t('employerFreeLabel')}</div>
                <div className="text-4xl font-extrabold text-slate-900 dark:text-white">$0</div>
                <div className="text-slate-600 dark:text-slate-400 text-sm mt-1">{t('employerFreeDesc')}</div>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {[t('employerFreeFeature1'), t('employerFreeFeature2'), t('employerFreeFeature3')].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/register?role=employer" className="btn-outline text-sm py-3 text-center block">{t('postAJob')}</Link>
            </div>

            {/* Employer Growth plan — real price, no live checkout yet */}
            <div className="card border-primary/50 bg-gradient-to-br from-primary/5 to-white dark:to-card flex flex-col relative overflow-hidden">
              <div className="mb-6">
                <div className="text-sm font-semibold text-primary dark:text-blue-400 uppercase tracking-wider mb-1">{t('employerGrowthLabel')}</div>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">$49</span>
                  <span className="text-slate-600 dark:text-slate-400 mb-1">{t('employerGrowthPeriod')}</span>
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-sm mt-1">{t('employerGrowthDesc')}</div>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {[t('employerGrowthFeature1'), t('employerGrowthFeature2'), t('employerGrowthFeature3'), t('employerGrowthFeature4')].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                    <span className="text-orange-600 dark:text-accent shrink-0">✦</span> {f}
                  </li>
                ))}
              </ul>
              {/* No real Stripe checkout for employer plans yet — honest
                  disabled state rather than a fake/broken payment flow. */}
              <button disabled className="btn-primary py-3 text-sm font-semibold opacity-50 w-full cursor-not-allowed">
                {t('comingSoon')}
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 text-center mt-6">{t('employerPlanLimitNote')}</p>
        </div>
      )}
    </div>
  )
}
