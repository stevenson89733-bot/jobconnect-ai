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
  const [employerLoading, setEmployerLoading] = useState(false)
  const [employerError, setEmployerError] = useState('')

  const [showPromoField, setShowPromoField] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoError, setPromoError] = useState('')
  const [promoSuccess, setPromoSuccess] = useState(false)
  const [promoType, setPromoType] = useState<'candidate' | 'employer'>('candidate')

  async function handlePromoRedeem() {
    if (!promoCode.trim()) return
    setPromoLoading(true)
    setPromoError('')
    const res = await fetch('/api/promo/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: promoCode.trim() }),
    })
    if (res.status === 401) {
      window.location.href = '/login?redirectTo=/pricing'
      return
    }
    const data = await res.json()
    setPromoLoading(false)
    if (data.error) {
      setPromoError(data.error)
    } else {
      setPromoType(data.type === 'employer' ? 'employer' : 'candidate')
      setPromoSuccess(true)
      router.refresh()
    }
  }
  const isEmployerRedirect = searchParams.get('plan') === 'employer'
  const success  = searchParams.get('success')  === 'true' && !isEmployerRedirect
  const canceled = searchParams.get('canceled') === 'true' && !isEmployerRedirect
  const employerSuccess  = searchParams.get('success')  === 'true' && isEmployerRedirect
  const employerCanceled = searchParams.get('canceled') === 'true' && isEmployerRedirect

  useEffect(() => {
    if (canceled) setError(t('paymentCanceled'))
  }, [canceled, t])

  useEffect(() => {
    if (employerCanceled) setEmployerError(t('paymentCanceled'))
  }, [employerCanceled, t])

  useEffect(() => {
    if (success || employerSuccess) router.refresh()
  }, [success, employerSuccess, router])

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

  async function handleEmployerUpgrade() {
    setEmployerLoading(true)
    setEmployerError('')
    const res = await fetch('/api/stripe/checkout/employer', { method: 'POST' })
    if (res.status === 401) {
      window.location.href = '/login?redirectTo=/pricing'
      return
    }
    const data = await res.json()
    if (data.error) {
      setEmployerError(data.error)
      setEmployerLoading(false)
      return
    }
    window.location.href = data.url
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <h1 className="text-[32px] md:text-5xl font-extrabold text-slate-900 dark:text-white mb-3">{t('pageTitle')}</h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg">{t('pageSubtitle')}</p>
      </div>

      {/* Plain in-page anchor links, not JS tab state — both pricing
          sections below are always in the DOM, so "For Employers" is
          reachable by a normal same-page scroll/jump even before hydration
          runs, not gated behind a click that only works once React has
          mounted. */}
      <div className="flex justify-center gap-2 mb-14">
        <a
          href="#candidates"
          className="px-5 py-2.5 rounded-xl text-sm font-medium border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
        >
          {t('forCandidates')}
        </a>
        <a
          href="#employers"
          className="px-5 py-2.5 rounded-xl text-sm font-medium border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
        >
          {t('forEmployers')}
        </a>
      </div>

      {/* ── For Candidates ─────────────────────────────────────── */}
      <section id="candidates" className="scroll-mt-24 mb-20">
        <h2 className="text-sm font-semibold text-primary dark:text-blue-400 uppercase tracking-widest text-center mb-6">
          {t('forCandidates')}
        </h2>

        {/* Resume Builder mockup — visible proof of Premium value */}
        <div className="mb-8 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xl">
          <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2.5 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 mx-auto font-medium">✦ AI Resume Builder — Premium</span>
          </div>
          <div className="bg-white dark:bg-slate-900 grid grid-cols-5 divide-x divide-slate-100 dark:divide-slate-700/50 text-xs">
            <div className="col-span-2 p-4 space-y-3">
              <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Job Description</div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed border border-slate-200 dark:border-slate-700">
                Senior Product Manager at Stripe — Remote — $160k+
              </div>
              <div className="bg-primary text-white rounded-lg px-3 py-2 text-center font-semibold text-[11px]">
                ✦ Analyze &amp; Improve
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">ATS Score</span>
                  <span className="font-bold text-green-600 dark:text-green-400">87 / 100</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '87%' }} />
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">✓ 12 keywords matched · 3 improvements applied</div>
              </div>
            </div>
            <div className="col-span-3 p-4 bg-slate-50 dark:bg-slate-800/50 space-y-2.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Your Resume — Optimized</span>
                <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full">ATS 87</span>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-bold text-slate-900 dark:text-white text-sm">Amara Diallo</div>
                <div className="text-[11px] text-primary dark:text-blue-400 font-medium">Senior Product Manager</div>
                <div className="border-t border-slate-100 dark:border-slate-700 pt-2 space-y-1">
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">✦ Led cross-functional team of 12, shipped payments for 50M users</div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">✦ Increased conversion 34% via A/B-tested checkout redesign</div>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {['Product Strategy', 'Roadmapping', 'Stripe API', 'A/B Testing'].map((s) => (
                    <span key={s} className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[9px] px-1.5 py-0.5 rounded">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {success && (
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
            <div className="absolute top-4 end-4">
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
            {promoSuccess ? (
              <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-xl text-center">
                <p className="text-green-700 dark:text-green-400 font-semibold text-sm">
                  {promoType === 'employer'
                    ? '🎉 Employer access activated! Free job postings for 30 days.'
                    : '🎉 Premium activated! You have 3 months of free access.'}
                </p>
              </div>
            ) : (
              <>
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
                {/* Promo code section */}
                {!showPromoField ? (
                  <button
                    onClick={() => setShowPromoField(true)}
                    className="w-full text-center text-xs text-slate-400 dark:text-slate-500 hover:text-primary dark:hover:text-blue-400 transition-colors mt-1 py-1"
                  >
                    Have a promo code?
                  </button>
                ) : (
                  <div className="mt-3 space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoError('') }}
                        onKeyDown={e => e.key === 'Enter' && handlePromoRedeem()}
                        placeholder="PROMO CODE"
                        className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 uppercase tracking-widest"
                        autoFocus
                      />
                      <button
                        onClick={handlePromoRedeem}
                        disabled={promoLoading || !promoCode.trim()}
                        className="px-4 py-2 text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg disabled:opacity-40 hover:bg-slate-700 dark:hover:bg-slate-100 transition-colors flex-shrink-0"
                      >
                        {promoLoading ? '…' : 'Apply'}
                      </button>
                    </div>
                    {promoError && (
                      <p className="text-xs text-red-600 dark:text-red-400 text-center">{promoError}</p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── For Employers ──────────────────────────────────────── */}
      <section id="employers" className="scroll-mt-24">
        <h2 className="text-sm font-semibold text-primary dark:text-blue-400 uppercase tracking-widest text-center mb-6">
          {t('forEmployers')}
        </h2>

        {/* Employer dashboard mockup */}
        <div className="mb-8 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xl">
          <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2.5 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 mx-auto font-medium">✦ Employer Dashboard — Growth</span>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 text-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-800 dark:text-white text-sm">Senior AI Engineer</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">🌍 Remote · Worldwide · ⭐ Featured</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-primary">34</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">applicants</div>
              </div>
            </div>
            <div className="space-y-2.5">
              <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Top Candidates by AI Match</div>
              {[
                { initials: 'ML', name: 'Mei L.', title: 'ML Engineer · Shanghai', match: 94, color: 'bg-green-500' },
                { initials: 'AP', name: 'Arjun P.', title: 'AI Research · Bangalore', match: 88, color: 'bg-blue-500' },
                { initials: 'SR', name: 'Sofia R.', title: 'Senior Engineer · Berlin', match: 82, color: 'bg-indigo-500' },
              ].map((c) => (
                <div key={c.name} className="flex items-center gap-3">
                  <div className={`w-7 h-7 ${c.color} rounded-full flex items-center justify-center text-white font-bold text-[9px] shrink-0`}>{c.initials}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-800 dark:text-white text-[11px]">{c.name}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{c.title}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[11px] font-bold text-slate-800 dark:text-white">{c.match}%</div>
                    <div className="w-14 bg-slate-200 dark:bg-slate-700 rounded-full h-1 mt-0.5">
                      <div className="bg-green-500 h-1 rounded-full" style={{ width: `${c.match}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {employerSuccess && (
          <div className="mb-8 p-5 bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-xl text-center">
            <p className="text-green-700 dark:text-green-400 font-semibold mb-3">{t('employerSuccessTitle')}</p>
            <a href="/recruiter" className="btn-primary text-sm py-2 px-5">{t('goToRecruiterDashboard')}</a>
          </div>
        )}

        {employerError && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl text-red-700 dark:text-red-400 text-sm text-center">
            {employerError}
          </div>
        )}

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
            <button
              onClick={handleEmployerUpgrade}
              disabled={employerLoading}
              className="btn-primary py-3 text-sm font-semibold disabled:opacity-50 w-full"
            >
              {employerLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  {t('redirectingToStripe')}
                </span>
              ) : t('employerUpgradeButton')}
            </button>
          </div>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 text-center mt-6">{t('employerPlanLimitNote')}</p>
      </section>

      {/* ── Trusted by ──────────────────────────────────────────── */}
      <section className="mt-20 pt-12 border-t border-slate-200 dark:border-slate-800">
        <p className="text-center text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-8">
          Trusted by teams at
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8">
          {['Anthropic', 'Vercel', 'Stripe', 'Figma', 'Linear', 'Notion'].map((name) => (
            <div key={name} className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
              <img
                src={`https://logo.clearbit.com/${name.toLowerCase()}.com`}
                alt={name}
                className="w-6 h-6 rounded object-contain"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
              />
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">{name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────────── */}
      <section className="mt-16 grid md:grid-cols-2 gap-6">
        <div className="card border-l-4 border-primary">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shrink-0">AD</div>
            <div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic mb-3">
                &ldquo;The ATS scorer told me exactly which keywords I was missing for a Berlin fintech role. Got the interview in 48 hours after fixing my CV.&rdquo;
              </p>
              <div className="text-xs font-semibold text-slate-900 dark:text-white">Amara D.</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Product Manager · Lagos → Berlin</div>
            </div>
          </div>
        </div>
        <div className="card border-l-4 border-[#57C7E3]">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#57C7E3] flex items-center justify-center text-white font-bold text-sm shrink-0">SK</div>
            <div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic mb-3">
                &ldquo;We posted a role on a Tuesday and had 34 AI-matched international candidates by Thursday. Hired within 3 weeks — faster than any agency we&apos;ve used.&rdquo;
              </p>
              <div className="text-xs font-semibold text-slate-900 dark:text-white">Sebastián K.</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Head of Engineering · Toronto-based SaaS</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
