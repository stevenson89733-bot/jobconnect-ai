import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getCandidateFeatures, getCandidateExclusiveFeatures, getEmployerFeatures, getEmployerExclusiveFeatures } from '@/lib/planFeatures'
import { CheckoutButton } from './CheckoutButton'
import { PromoSection } from './PromoSection'
import { PricingBanners } from './PricingBanners'

export default async function PricingPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const t = await getTranslations('pricing')

  const isEmployerRedirect = searchParams.plan === 'employer'
  const success         = searchParams.success  === 'true' && !isEmployerRedirect
  const canceled        = searchParams.canceled === 'true' && !isEmployerRedirect
  const employerSuccess = searchParams.success  === 'true' && isEmployerRedirect
  const employerCanceled = searchParams.canceled === 'true' && isEmployerRedirect

  const Spinner = () => (
    <svg className="animate-spin w-4 h-4 inline" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
    </svg>
  )
  void Spinner

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <h1 className="text-[32px] md:text-5xl font-extrabold text-slate-900 dark:text-white mb-3">{t('pageTitle')}</h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg">{t('pageSubtitle')}</p>
      </div>

      <div className="flex justify-center gap-2 mb-14">
        <a href="#candidates" className="px-5 py-2.5 rounded-xl text-sm font-medium border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600 transition-colors">
          {t('forCandidates')}
        </a>
        <a href="#employers" className="px-5 py-2.5 rounded-xl text-sm font-medium border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600 transition-colors">
          {t('forEmployers')}
        </a>
      </div>

      {/* ── For Candidates ─────────────────────────────────────── */}
      <section id="candidates" className="scroll-mt-24 mb-20">
        <h2 className="text-sm font-semibold text-primary dark:text-blue-400 uppercase tracking-widest text-center mb-6">
          {t('forCandidates')}
        </h2>

        {/* Resume Builder mockup */}
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
              <div className="bg-primary text-white rounded-lg px-3 py-2 text-center font-semibold text-[11px]">✦ Analyze &amp; Improve</div>
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

        <PricingBanners
          success={success}
          canceled={canceled}
          employerSuccess={false}
          employerCanceled={false}
          labels={{
            successTitle: t('successTitle'),
            paymentCanceled: t('paymentCanceled'),
            employerSuccessTitle: t('employerSuccessTitle'),
            goToResumeBuilder: t('goToResumeBuilder'),
            goToCoverLetter: t('goToCoverLetter'),
            goToRecruiterDashboard: t('goToRecruiterDashboard'),
          }}
        />

        <div className="grid md:grid-cols-3 gap-6">
          {/* Free */}
          <div className="card flex flex-col">
            <div className="mb-6">
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">{t('candidateFreeBadge')}</div>
              <div className="text-5xl font-black text-slate-900 dark:text-white">$0</div>
              <div className="text-slate-600 dark:text-slate-400 text-sm mt-1">{t('candidateFreeDesc')}</div>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {getCandidateFeatures('free').map((f) => (
                <li key={f.label} className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                  <span className="shrink-0">{f.icon}</span> {f.label}
                </li>
              ))}
            </ul>
            <Link href="/jobs" className="btn-outline text-sm py-3 text-center block">{t('browseJobs')}</Link>
          </div>

          {/* Pro */}
          <div className="relative rounded-xl flex flex-col p-[2px]" style={{ background: 'linear-gradient(135deg, #2E5CF6, #57C7E3, #F0663A)' }}>
            <div className="card border-transparent bg-white dark:bg-card rounded-[10px] flex flex-col flex-1">
              <div className="mb-6">
                <div className="text-sm font-semibold text-primary dark:text-blue-400 uppercase tracking-wider mb-1">{t('candidateProBadge')}</div>
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-black text-slate-900 dark:text-white">$19.99</span>
                  <span className="text-slate-600 dark:text-slate-400 mb-1">{t('perMonth')}</span>
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-sm mt-1">{t('everythingInFree')}</div>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {getCandidateExclusiveFeatures('pro').map((f) => (
                  <li key={f.label} className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                    <span className="shrink-0">{f.icon}</span> {f.label}
                  </li>
                ))}
              </ul>
              <PromoSection
                upgradeLabel={t('upgradeButton')}
                loadingLabel={t('redirectingToStripe')}
                havePromoCode={t('havePromoCode')}
                placeholder={t('promoCodePlaceholder')}
                applyLabel={t('applyPromo')}
                candidateSuccess={t('promoCandidateSuccess')}
                employerSuccess={t('promoEmployerSuccess')}
              />
            </div>
          </div>

          {/* Elite */}
          <div className="card flex flex-col">
            <div className="mb-6">
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">{t('candidateEliteBadge')}</div>
              <div className="flex items-end gap-1">
                <span className="text-5xl font-black text-slate-900 dark:text-white">$39.99</span>
                <span className="text-slate-600 dark:text-slate-400 mb-1">{t('perMonth')}</span>
              </div>
              <div className="text-slate-600 dark:text-slate-400 text-sm mt-1">{t('everythingInPro')}</div>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {getCandidateExclusiveFeatures('elite').map((f) => (
                <li key={f.label} className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                  <span className="shrink-0">{f.icon}</span> {f.label}
                </li>
              ))}
            </ul>
            <CheckoutButton
              endpoint="/api/stripe/checkout/elite"
              label={t('eliteButton')}
              loadingLabel={t('redirectingToStripe')}
              className="btn-primary py-3 text-sm font-semibold disabled:opacity-50 w-full"
            />
          </div>
        </div>

        {/* Auto-Apply callout */}
        <Link
          href="/auto-apply"
          className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-cyan-500/25 bg-gradient-to-r from-[#10152A] to-[#0f1a35] px-6 py-4 hover:border-cyan-500/50 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <span className="text-2xl">🤖</span>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-bold text-white text-sm">{t('autoApplyTitle')}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">{t('proFeature')}</span>
              </div>
              <p className="text-xs text-slate-400">{t('autoApplyDesc')}</p>
            </div>
          </div>
          <span className="text-cyan-400 text-sm font-semibold group-hover:translate-x-0.5 transition-transform">{t('learnMore')}</span>
        </Link>
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

        <PricingBanners
          success={false}
          canceled={false}
          employerSuccess={employerSuccess}
          employerCanceled={employerCanceled}
          labels={{
            successTitle: t('successTitle'),
            paymentCanceled: t('paymentCanceled'),
            employerSuccessTitle: t('employerSuccessTitle'),
            goToResumeBuilder: t('goToResumeBuilder'),
            goToCoverLetter: t('goToCoverLetter'),
            goToRecruiterDashboard: t('goToRecruiterDashboard'),
          }}
        />

        <div className="grid md:grid-cols-2 gap-6">
          {/* Employer Free */}
          <div className="card flex flex-col">
            <div className="mb-6">
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">{t('employerFreeLabel')}</div>
              <div className="text-5xl font-black text-slate-900 dark:text-white">$0</div>
              <div className="text-slate-600 dark:text-slate-400 text-sm mt-1">{t('employerFreeDesc')}</div>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {getEmployerFeatures('employer_free').map((f) => (
                <li key={f.label} className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                  <span className="shrink-0">{f.icon}</span> {f.label}
                </li>
              ))}
            </ul>
            <Link href="/register?role=employer" className="btn-outline text-sm py-3 text-center block">{t('postAJob')}</Link>
          </div>

          {/* Employer Growth */}
          <div className="card border-primary/50 bg-gradient-to-br from-primary/5 to-white dark:to-card flex flex-col relative overflow-hidden">
            <div className="mb-6">
              <div className="text-sm font-semibold text-primary dark:text-blue-400 uppercase tracking-wider mb-1">{t('employerGrowthLabel')}</div>
              <div className="flex items-end gap-1">
                <span className="text-5xl font-black text-slate-900 dark:text-white">$49</span>
                <span className="text-slate-600 dark:text-slate-400 mb-1">{t('employerGrowthPeriod')}</span>
              </div>
              <div className="text-slate-600 dark:text-slate-400 text-sm mt-1">{t('everythingInFree')}</div>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {getEmployerExclusiveFeatures('employer_growth').map((f) => (
                <li key={f.label} className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                  <span className="shrink-0">{f.icon}</span> {f.label}
                </li>
              ))}
            </ul>
            <CheckoutButton
              endpoint="/api/stripe/checkout/employer"
              label={t('employerUpgradeButton')}
              loadingLabel={t('redirectingToStripe')}
              className="btn-primary py-3 text-sm font-semibold disabled:opacity-50 w-full"
            />
          </div>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 text-center mt-6">{t('employerPlanLimitNote')}</p>

        {/* Pro + Enterprise */}
        <div className="mt-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Employer Pro */}
            <div className="card border-[#57C7E3]/40 bg-gradient-to-br from-[#57C7E3]/5 to-white dark:to-card flex flex-col relative overflow-hidden">
              <div className="mb-6">
                <div className="text-sm font-semibold uppercase tracking-wider mb-1" style={{ color: '#57C7E3' }}>{t('employerProLabel')}</div>
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-black text-slate-900 dark:text-white">$99</span>
                  <span className="text-slate-600 dark:text-slate-400 mb-1">{t('perMonth')}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{t('everythingInGrowth')}</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {getEmployerExclusiveFeatures('employer_pro').map((f) => (
                  <li key={f.label} className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                    <span className="shrink-0">{f.icon}</span> {f.label}
                  </li>
                ))}
              </ul>
              <CheckoutButton
                endpoint="/api/stripe/checkout/employer-pro"
                label={t('employerProButton')}
                loadingLabel={t('redirectingToStripe')}
                className="w-full font-semibold text-white rounded-xl px-6 py-3 text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: '#57C7E3' }}
              />
            </div>

            {/* Enterprise */}
            <div className="card border-dashed border-slate-400 dark:border-slate-600 flex flex-col relative overflow-hidden opacity-90">
              <div className="absolute top-0 right-0 bg-slate-600 dark:bg-slate-700 text-slate-200 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-xl">PHASE 2</div>
              <div className="mb-6">
                <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{t('employerEnterpriseLabel')}</div>
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-black text-slate-900 dark:text-white">$299+</span>
                  <span className="text-slate-600 dark:text-slate-400 mb-1">{t('perMonth')}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{t('everythingInPro')}</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {getEmployerExclusiveFeatures('employer_enterprise').map((f) => (
                  <li key={f.label} className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                    <span className="shrink-0">{f.icon}</span> {f.label}
                  </li>
                ))}
              </ul>
              <button disabled className="w-full font-semibold rounded-xl px-6 py-3 text-sm border border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 opacity-70 cursor-not-allowed">
                {t('comingSoonBtn')}
              </button>
            </div>
          </div>

          {/* Featured Listing add-on */}
          <div className="mt-6 card border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-white dark:to-card relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-xl">ADD-ON</div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pr-20">
              <div>
                <div className="text-sm font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">{t('employerFeaturedListingLabel')}</div>
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">$49</span>
                  <span className="text-slate-600 dark:text-slate-400 mb-0.5">{t('perListing')}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{t('employerFeaturedListingDesc')}</p>
                <ul className="space-y-1">
                  {[
                    t('employerFeaturedListingBenefit1'),
                    t('employerFeaturedListingBenefit2'),
                    t('employerFeaturedListingBenefit3'),
                    t('employerFeaturedListingBenefit4'),
                  ].map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <span className="text-amber-500">✓</span> {benefit}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="shrink-0">
                <CheckoutButton
                  endpoint="/api/stripe/checkout/featured-listing"
                  label={t('employerFeaturedListingButton')}
                  loadingLabel="…"
                  className="font-semibold rounded-xl px-6 py-2.5 text-sm bg-amber-500 hover:bg-amber-600 text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trusted by ──────────────────────────────────────────── */}
      <section className="mt-20 pt-12 border-t border-slate-200 dark:border-slate-800">
        <p className="text-center text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-8">
          {t('trustedBy')}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8">
          {['Anthropic', 'Vercel', 'Stripe', 'Figma', 'Linear', 'Notion'].map((name) => (
            <div key={name} className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://logo.clearbit.com/${name.toLowerCase()}.com`}
                alt={name}
                className="w-6 h-6 rounded object-contain"
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
