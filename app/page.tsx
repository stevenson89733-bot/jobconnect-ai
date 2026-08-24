import type { Metadata } from 'next'
import Link from 'next/link'
import { unstable_cache } from 'next/cache'
import { getTranslations } from 'next-intl/server'
import { createPublicClient } from '@/lib/supabase/public'
import { JOB_TYPE_KEY } from '@/lib/i18n/jobLabels'
import CompanyLogo from '@/components/jobs/CompanyLogo'
import { absoluteUrl } from '@/lib/seo'
import { Badge } from '@/components/ui/badge'
import HeroSearch from '@/components/HeroSearch'
import FadeIn from '@/components/dashboard/FadeIn'
import FAQAccordion from '@/components/landing/FAQAccordion'
import HowItWorks from '@/components/landing/HowItWorks'
import { AnimatedCTA } from '@/components/landing/AnimatedCTA'
import { CountUpStat } from '@/components/landing/CountUpStat'
import HeroNetwork from '@/components/landing/HeroNetwork'

export const metadata: Metadata = {
  title: 'JobConnect AI — The career copilot for the cross-border generation',
  description: 'One AI copilot to rewrite your resume, rehearse your interview, and find your next remote role — grounded in your real profile, in 11 languages, across 63 countries.',
  alternates: { canonical: absoluteUrl('/') },
  openGraph: {
    title: 'JobConnect AI — The career copilot for the cross-border generation',
    description: 'One AI copilot to rewrite your resume, rehearse your interview, and find your next remote role — grounded in your real profile, in 11 languages, across 63 countries.',
    url: absoluteUrl('/'),
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JobConnect AI — The career copilot for the cross-border generation',
    description: 'One AI copilot to rewrite your resume, rehearse your interview, and find your next remote role.',
  },
}

// Minimal, real-data-only structured data — name/url/description mirror the
// metadata above exactly. No aggregateRating/review/fabricated fields.
function OrganizationJsonLd() {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'JobConnect AI',
    url: absoluteUrl('/'),
    description: 'AI-powered remote job platform connecting cross-border candidates with real, verified remote opportunities.',
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />
}

// Real active jobs — used to derive both "Featured Jobs" (is_featured rows,
// never padded with invented listings) and "Trusted by" (every distinct
// real company name with an active posting today, never a hardcoded list
// that could drift from the DB). Cached like /jobs (same 'jobs' tag,
// invalidated by POST /api/jobs) since this is public, non-personalized data.
const getHomeJobs = unstable_cache(
  async () => {
    const supabase = createPublicClient()
    const { data } = await supabase
      .from('jobs')
      .select('id, title, company_name, location, work_type, salary_label, job_type, tags, is_featured, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    return normalizeJobsResult(data)
  },
  ['home-jobs'],
  { revalidate: 60, tags: ['jobs'] }
)

type HomeJob = {
  id: string
  title: string
  company_name: string
  location: string
  work_type: string
  salary_label: string | null
  job_type: string
  tags: string[]
  is_featured: boolean
}

function normalizeJobsResult(data: HomeJob[] | null) {
  const jobs = data ?? []
  return {
    featuredJobs: jobs.filter((j) => j.is_featured).slice(0, 6),
    trustedCompanies: [...new Set(jobs.map((j) => j.company_name))],
  }
}

export default async function Home() {
  const t = await getTranslations('home')
  const tj = await getTranslations('jobs')

  const { featuredJobs, trustedCompanies } = await getHomeJobs()

  const FAQ_ITEMS = [
    { q: t('faqQ1'), a: t('faqA1') },
    { q: t('faqQ2'), a: t('faqA2') },
    { q: t('faqQ3'), a: t('faqA3') },
    { q: t('faqQ4'), a: t('faqA4') },
    { q: t('faqQ5'), a: t('faqA5') },
  ]

  return (
    <>
      <OrganizationJsonLd />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <HeroNetwork />
          {/* Subtle center glow for legibility behind heading text */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[380px] bg-primarySoft/50 dark:bg-primary/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-card/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-full px-4 py-1.5 text-sm text-body dark:text-slate-400 mb-8">
            <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
            <span>{t('heroBadge')}</span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight mb-6">
            {t('heroTitle')}
          </h1>

          <p className="text-lg md:text-xl text-body dark:text-slate-400 max-w-2xl mx-auto mb-9 leading-relaxed">
            {t('heroSubtitle')}
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <AnimatedCTA href="/jobs" className="inline-flex items-center gap-2 bg-primary hover:bg-primaryDark text-white font-bold rounded-full px-7 py-3.5 text-[15px] shadow-lg shadow-primary/25 transition-colors">
              {t('heroCtaTalk')}
            </AnimatedCTA>
          </div>

          {/* Product screenshot mockup — AI copilot in action */}
          <FadeIn>
            <div className="max-w-2xl mx-auto mb-14">
              <div className="rounded-[20px] overflow-hidden shadow-[0_24px_64px_-20px_rgba(15,23,42,.22)] border border-slate-200 dark:border-slate-700/50">
                {/* Window chrome */}
                <div className="bg-slate-100 dark:bg-slate-800 px-5 py-3 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700/50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mx-auto font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-mint inline-block mr-1.5 animate-pulse" />
                    {t('chatLabel')}
                  </span>
                </div>
                {/* Two-panel UI */}
                <div className="bg-white dark:bg-card grid grid-cols-5 divide-x divide-slate-100 dark:divide-slate-700/50 text-xs">
                  {/* Left: chat */}
                  <div className="col-span-2 p-4 space-y-3 text-start">
                    <div className="self-end bg-primary/10 dark:bg-primary/20 rounded-xl rounded-tl-none px-3 py-2 text-slate-700 dark:text-slate-300">
                      {t('chatUser1')}
                    </div>
                    <div className="flex gap-2 items-start">
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white text-[8px] font-bold shrink-0 mt-0.5">AI</div>
                      <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl rounded-tl-none px-3 py-2 text-slate-600 dark:text-slate-400 flex-1">
                        {t.rich('chatBot1', {
                          link: (chunks) => (
                            <Link href="/ai-tools/resume-builder" className="text-primary dark:text-blue-400 font-bold hover:underline">{chunks}</Link>
                          ),
                        })}
                      </div>
                    </div>
                    <div className="self-end bg-primary/10 dark:bg-primary/20 rounded-xl rounded-tl-none px-3 py-2 text-slate-700 dark:text-slate-300">
                      {t('chatUser2')}
                    </div>
                    <div className="flex gap-2 items-start">
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white text-[8px] font-bold shrink-0 mt-0.5">AI</div>
                      <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl rounded-tl-none px-3 py-2 text-slate-600 dark:text-slate-400 flex-1">
                        {t.rich('chatBot2', {
                          b: (chunks) => <b>{chunks}</b>,
                          link: (chunks) => (
                            <Link href="/jobs" className="text-primary dark:text-blue-400 font-bold hover:underline">{chunks}</Link>
                          ),
                        })}
                      </div>
                    </div>
                  </div>
                  {/* Right: resume preview panel */}
                  <div className="col-span-3 p-4 bg-slate-50 dark:bg-slate-800/40 space-y-2.5 text-start">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Résumé — Optimisé IA</span>
                      <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full">ATS 87/100</span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">Amara D.</div>
                      <div className="text-[11px] text-primary dark:text-blue-400 font-medium">Senior Product Manager</div>
                      <div className="border-t border-slate-100 dark:border-slate-700 pt-2 space-y-1">
                        <div className="text-[11px] text-slate-600 dark:text-slate-400">✦ Led cross-functional team of 12, shipped payments for 50M users</div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400">✦ Increased conversion 34% via A/B-tested checkout redesign</div>
                      </div>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {['Product Strategy', 'Roadmapping', 'OKRs', 'A/B Testing'].map((s) => (
                          <span key={s} className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[9px] px-1.5 py-0.5 rounded">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Keyword match</div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '87%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Real, functional job search — kept from the previous hero, not
              removed by the redesign, just repositioned below the copilot demo. */}
          <HeroSearch />
        </div>
      </section>

      {/* Stats — every number real (see lib/countries.ts for 63, lib/i18n/config.ts for 11) */}
      <FadeIn>
        <div className="flex flex-wrap justify-center gap-12 md:gap-20 px-6 py-10 pb-16">
          <div className="text-center">
            <b className="font-display block text-5xl font-black text-slate-900 dark:text-white"><CountUpStat value={11} /></b>
            <span className="text-xs uppercase tracking-widest text-body dark:text-slate-400 mt-1 block">{t('statLanguagesLabel')}</span>
          </div>
          <div className="text-center">
            <b className="font-display block text-5xl font-black text-slate-900 dark:text-white"><CountUpStat value={63} /></b>
            <span className="text-xs uppercase tracking-widest text-body dark:text-slate-400 mt-1 block">{t('statCountriesLabel')}</span>
          </div>
          <div className="text-center">
            <b className="font-display block text-5xl font-black text-slate-900 dark:text-white"><CountUpStat value={8} /></b>
            <span className="text-xs uppercase tracking-widest text-body dark:text-slate-400 mt-1 block">{t('statToolsLabel')}</span>
          </div>
          <div className="text-center">
            <b className="font-display block text-5xl font-black text-slate-900 dark:text-white">0</b>
            <span className="text-xs uppercase tracking-widest text-body dark:text-slate-400 mt-1 block">{t('statHonestyLabel')}</span>
          </div>
        </div>
      </FadeIn>

      {/* AI Search explainer */}
      <FadeIn>
        <section className="max-w-5xl mx-auto px-6 pb-20">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-gradient-to-br from-primarySoft via-white to-white dark:from-primary/10 dark:via-card dark:to-card p-8 md:p-10 text-center">
            <span className="badge bg-primarySoft dark:bg-primary/20 text-primary dark:text-blue-400 mb-4 inline-flex">
              {t('aiSearchBadge')}
            </span>
            <h2 className="text-2xl md:font-display text-3xl font-bold text-slate-900 dark:text-white mb-2">{t('aiSearchTitle')}</h2>
            <p className="text-body dark:text-slate-400 max-w-xl mx-auto">{t('aiSearchSubtitle')}</p>
          </div>
        </section>
      </FadeIn>

      {/* Trusted by — every company name comes from a real active posting today */}
      <FadeIn>
        <section className="border-y border-slate-200 dark:border-slate-800 py-8">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-sm text-body dark:text-slate-400 mb-6 uppercase tracking-widest">{t('trustedBy')}</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
              {trustedCompanies.map((name) => (
                <div key={name} className="flex items-center gap-2 text-body dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300 transition-colors">
                  <CompanyLogo companyName={name} size="sm" shape="rounded-lg" />
                  <span className="font-semibold text-sm">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeIn>

      {/* Featured Jobs — real jobs.is_featured rows only */}
      <FadeIn>
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-display text-3xl font-bold text-slate-900 dark:text-white">{t('featuredJobsTitle')}</h2>
              <p className="text-body dark:text-slate-400 mt-1">{t('featuredJobsSubtitle')}</p>
            </div>
            <Link href="/jobs" className="btn-outline text-sm hidden sm:flex">{t('viewAllJobs')}</Link>
          </div>

          {featuredJobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 py-16 text-center">
              <div className="text-4xl mb-3">✦</div>
              <p className="font-medium text-slate-700 dark:text-slate-300">{t('noFeaturedJobs')}</p>
              <p className="text-sm text-body dark:text-slate-400 mt-1 mb-5">{t('noFeaturedJobsDesc')}</p>
              <Link href="/jobs" className="btn-outline text-sm">{t('viewAllJobs')}</Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {featuredJobs.map((job) => {
                const jobTypeKey = JOB_TYPE_KEY[job.job_type]
                const jobTypeLabel = jobTypeKey ? tj(jobTypeKey) : job.job_type
                return (
                  <Link
                    key={job.id}
                    href="/jobs"
                    className="card hover:border-primary/50 hover:-translate-y-0.5 hover:shadow-lg dark:hover:shadow-black/20 transition-all group cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                        <CompanyLogo companyName={job.company_name} shape="rounded-lg" />
                      <Badge variant="success">{jobTypeLabel}</Badge>
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors mb-1">{job.title}</h3>
                    <p className="text-sm text-body dark:text-slate-400 mb-1">{job.company_name}</p>
                    <p className="text-xs text-body dark:text-slate-400 mb-4">{job.location}</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {job.tags?.slice(0, 3).map((tag) => (
                        <Badge key={tag}>{tag}</Badge>
                      ))}
                    </div>
                    {job.salary_label && (
                      <p className="text-sm font-semibold text-accent">{job.salary_label}</p>
                    )}
                  </Link>
                )
              })}
            </div>
          )}

          <div className="mt-6 text-center sm:hidden">
            <Link href="/jobs" className="btn-outline">{t('viewAllJobs')}</Link>
          </div>
        </section>
      </FadeIn>

      <HowItWorks />

      {/* Built for professionals in — country flags quick-links */}
      <FadeIn>
        <section className="max-w-5xl mx-auto px-6 py-16">
          <p className="text-center text-xs font-semibold text-body dark:text-slate-400 uppercase tracking-widest mb-8">
            Built for cross-border professionals in
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { flag: '🇺🇸', label: 'USA', href: '/remote-jobs-usa' },
              { flag: '🇬🇧', label: 'UK', href: '/remote-jobs-uk' },
              { flag: '🇩🇪', label: 'Germany', href: '/remote-jobs-germany' },
              { flag: '🇫🇷', label: 'France', href: '/remote-jobs-france' },
              { flag: '🇨🇦', label: 'Canada', href: '/remote-jobs-canada' },
            ].map(({ flag, label, href }) => (
              <Link
                key={label}
                href={href}
                className="flex flex-col items-center gap-2 group px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-primary/50 dark:hover:border-blue-500/50 hover:shadow-md transition-all"
              >
                <span className="text-4xl">{flag}</span>
                <span className="text-xs font-semibold text-body dark:text-slate-400 group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">{label}</span>
              </Link>
            ))}
          </div>
        </section>
      </FadeIn>

      {/* Pricing teaser — real numbers, mirrors /pricing exactly */}
      <FadeIn>
        <section className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-slate-900 dark:text-white mb-3">{t('pricingTeaserTitle')}</h2>
            <p className="text-body dark:text-slate-400">{t('pricingTeaserSubtitle')}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card flex flex-col">
              <div className="text-sm font-semibold text-body dark:text-slate-400 uppercase tracking-wider mb-1">{t('pricingFreeLabel')}</div>
              <div className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">$0</div>
              <p className="text-body dark:text-slate-400 text-sm flex-1">{t('pricingFreeDesc')}</p>
            </div>
            <div className="card border-primary/50 bg-gradient-to-br from-primarySoft to-white dark:to-card flex flex-col relative overflow-hidden">
              <div className="text-sm font-semibold text-primary dark:text-blue-400 uppercase tracking-wider mb-1">{t('pricingPremiumLabel')}</div>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">$19</span>
                <span className="text-body dark:text-slate-400 mb-1">{t('pricingPremiumPeriod')}</span>
              </div>
              <p className="text-body dark:text-slate-400 text-sm flex-1">{t('pricingPremiumDesc')}</p>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link href="/pricing" className="btn-outline text-sm">{t('pricingCta')}</Link>
          </div>
        </section>
      </FadeIn>

      {/* FAQ */}
      <FadeIn>
        <section className="max-w-7xl mx-auto px-6 py-20">
          <h2 className="font-display text-3xl font-bold text-slate-900 dark:text-white text-center mb-12">{t('faqTitle')}</h2>
          <FAQAccordion items={FAQ_ITEMS} />
        </section>
      </FadeIn>

      {/* Closing — mission statement (not a fabricated testimonial, see the
          honest placeholder above) + real dual CTA. */}
      <FadeIn>
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary to-primaryDark rounded-[26px] px-8 md:px-14 py-14 text-center text-white">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-5">{t('ctaTitle')}</h2>
            <p className="text-lg md:text-xl italic leading-relaxed max-w-2xl mx-auto mb-9 text-white/90">
              {t('missionQuote')}
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Link href="/register?role=candidate" className="inline-flex items-center gap-2 bg-white text-primaryDark font-bold rounded-full px-7 py-3.5 text-[15px] hover:bg-slate-100 transition-colors">
                {t('ctaCandidate')}
              </Link>
              <Link href="/register?role=employer" className="inline-flex items-center gap-2 border border-white/40 text-white font-bold rounded-full px-7 py-3.5 text-[15px] hover:bg-white/10 transition-colors">
                {t('ctaEmployer')}
              </Link>
            </div>
          </div>
        </section>
      </FadeIn>
    </>
  )
}
