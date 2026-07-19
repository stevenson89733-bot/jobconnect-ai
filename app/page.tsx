import Link from 'next/link'
import { unstable_cache } from 'next/cache'
import { getTranslations } from 'next-intl/server'
import { createPublicClient } from '@/lib/supabase/public'
import { JOB_TYPE_KEY } from '@/lib/i18n/jobLabels'
import { companyInitials } from '@/lib/companyDisplay'
import { Badge } from '@/components/ui/badge'
import HeroSearch from '@/components/HeroSearch'
import FadeIn from '@/components/dashboard/FadeIn'
import FAQAccordion from '@/components/landing/FAQAccordion'

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

  const AI_FEATURES = [
    { icon: '📄', title: t('feature1Title'), desc: t('feature1Desc'), href: '/ai-tools/resume-builder' },
    { icon: '✉️', title: t('feature2Title'), desc: t('feature2Desc'), href: '/ai-tools/cover-letter' },
    { icon: '🧭', title: t('feature3Title'), desc: t('feature3Desc'), href: '/candidate/career-coach' },
    { icon: '🎯', title: t('feature4Title'), desc: t('feature4Desc'), href: '/candidate/analytics' },
  ]

  const JOURNEY_STEPS = [
    { step: '01', icon: '🧭', title: t('step1Title'), desc: t('step1Desc') },
    { step: '02', icon: '📄', title: t('step2Title'), desc: t('step2Desc') },
    { step: '03', icon: '✉️', title: t('step3Title'), desc: t('step3Desc') },
    { step: '04', icon: '📨', title: t('step4Title'), desc: t('step4Desc') },
  ]

  const FAQ_ITEMS = [
    { q: t('faqQ1'), a: t('faqA1') },
    { q: t('faqQ2'), a: t('faqA2') },
    { q: t('faqQ3'), a: t('faqA3') },
    { q: t('faqQ4'), a: t('faqA4') },
    { q: t('faqQ5'), a: t('faqA5') },
  ]

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute top-[100px] right-[-100px] w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-card/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-full px-4 py-1.5 text-sm text-slate-600 dark:text-slate-400 mb-8">
            <span className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400 animate-pulse" />
            <span>{t('heroBadge')}</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight mb-6">
            {t('heroTitle1')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
              {t('heroTitleHighlight')}
            </span>
          </h1>

          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t('heroSubtitle')}
          </p>

          <HeroSearch />
        </div>
      </section>

      {/* AI Search explainer */}
      <FadeIn>
        <section className="max-w-5xl mx-auto px-6 pb-20">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-gradient-to-br from-primary/5 via-white to-white dark:from-primary/10 dark:via-card dark:to-card p-8 md:p-10 text-center">
            <span className="badge bg-primary/10 dark:bg-primary/20 text-blue-700 dark:text-blue-400 mb-4 inline-flex">
              {t('aiSearchBadge')}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">{t('aiSearchTitle')}</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">{t('aiSearchSubtitle')}</p>
          </div>
        </section>
      </FadeIn>

      {/* Trusted by — every company name comes from a real active posting today */}
      <FadeIn>
        <section className="border-y border-slate-200 dark:border-slate-800 py-8">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-sm text-slate-600 dark:text-slate-400 mb-6 uppercase tracking-widest">{t('trustedBy')}</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
              {trustedCompanies.map((name) => (
                <div key={name} className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300 transition-colors">
                  <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold">
                    {companyInitials(name)}
                  </span>
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
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('featuredJobsTitle')}</h2>
              <p className="text-slate-600 dark:text-slate-400 mt-1">{t('featuredJobsSubtitle')}</p>
            </div>
            <Link href="/jobs" className="btn-outline text-sm hidden sm:flex">{t('viewAllJobs')}</Link>
          </div>

          {featuredJobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 py-16 text-center">
              <div className="text-4xl mb-3">✦</div>
              <p className="font-medium text-slate-700 dark:text-slate-300">{t('noFeaturedJobs')}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 mb-5">{t('noFeaturedJobsDesc')}</p>
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
                      <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-700 dark:text-slate-300">
                        {companyInitials(job.company_name)}
                      </div>
                      <Badge variant="success">{jobTypeLabel}</Badge>
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors mb-1">{job.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{job.company_name}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">{job.location}</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {job.tags?.slice(0, 3).map((tag) => (
                        <Badge key={tag}>{tag}</Badge>
                      ))}
                    </div>
                    {job.salary_label && (
                      <p className="text-sm font-semibold text-orange-700 dark:text-accent">{job.salary_label}</p>
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

      {/* AI Features — only capabilities that exist and work today */}
      <FadeIn>
        <section className="bg-slate-50 dark:bg-card border-y border-slate-200 dark:border-slate-800 py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">{t('aiFeaturesTitle')}</h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">{t('aiFeaturesSubtitle')}</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {AI_FEATURES.map((f, i) => (
                <FadeIn key={f.title} delay={i * 0.05}>
                  <Link
                    href={f.href}
                    className="card h-full flex flex-col hover:border-primary/50 hover:-translate-y-0.5 hover:shadow-lg dark:hover:shadow-black/20 transition-all group"
                  >
                    <div className="text-3xl mb-3">{f.icon}</div>
                    <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors mb-1.5">{f.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                  </Link>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      </FadeIn>

      {/* Career Journey — the real tool flow: Coach → Resume → Cover Letter → Apply */}
      <FadeIn>
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">{t('howItWorksTitle')}</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">{t('howItWorksSubtitle')}</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {JOURNEY_STEPS.map((item, i) => (
              <FadeIn key={item.step} delay={i * 0.05} className="relative text-center md:text-left">
                <div className="text-5xl mb-4">{item.icon}</div>
                <div className="text-xs font-mono text-primary dark:text-blue-400 mb-2">{item.step}</div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                {i < JOURNEY_STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-7 left-[calc(100%-0.5rem)] w-6 h-px bg-slate-300 dark:bg-slate-700" />
                )}
              </FadeIn>
            ))}
          </div>
        </section>
      </FadeIn>

      {/* Testimonials — deliberately a placeholder, not fabricated quotes.
          Real user base is tiny right now (3 profiles as of the last audit),
          so this section is honestly marked "coming soon" rather than
          inventing names/quotes/photos. Revisit once real candidates or
          employers have given permission to be featured. */}
      <FadeIn>
        <section className="bg-slate-50 dark:bg-card border-y border-slate-200 dark:border-slate-800 py-20">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">{t('testimonialsTitle')}</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto mb-12">{t('testimonialsSubtitle')}</p>
            <div className="grid sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
              {[0, 1, 2].map((i) => (
                <div key={i} className="card border-dashed flex flex-col items-center justify-center py-10 text-slate-400 dark:text-slate-600">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 mb-4" />
                  <div className="w-3/4 h-2.5 rounded bg-slate-100 dark:bg-slate-800 mb-2" />
                  <div className="w-1/2 h-2.5 rounded bg-slate-100 dark:bg-slate-800 mb-4" />
                  <p className="text-xs">{t('testimonialsPlaceholder')}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeIn>

      {/* Pricing teaser — real numbers, mirrors /pricing exactly */}
      <FadeIn>
        <section className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">{t('pricingTeaserTitle')}</h2>
            <p className="text-slate-600 dark:text-slate-400">{t('pricingTeaserSubtitle')}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card flex flex-col">
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">{t('pricingFreeLabel')}</div>
              <div className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">$0</div>
              <p className="text-slate-600 dark:text-slate-400 text-sm flex-1">{t('pricingFreeDesc')}</p>
            </div>
            <div className="card border-primary/50 bg-gradient-to-br from-primary/5 to-white dark:to-card flex flex-col relative overflow-hidden">
              <div className="text-sm font-semibold text-primary dark:text-blue-400 uppercase tracking-wider mb-1">{t('pricingPremiumLabel')}</div>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">$19</span>
                <span className="text-slate-600 dark:text-slate-400 mb-1">{t('pricingPremiumPeriod')}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm flex-1">{t('pricingPremiumDesc')}</p>
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
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-12">{t('faqTitle')}</h2>
          <FAQAccordion items={FAQ_ITEMS} />
        </section>
      </FadeIn>

      {/* CTA */}
      <FadeIn>
        <section className="max-w-7xl mx-auto px-6 py-24 text-center">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">{t('ctaTitle')}</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">{t('ctaSubtitle')}</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/register?role=candidate" className="btn-primary text-base px-8 py-3">{t('ctaCandidate')}</Link>
            <Link href="/register?role=employer" className="btn-outline text-base px-8 py-3">{t('ctaEmployer')}</Link>
          </div>
        </section>
      </FadeIn>
    </>
  )
}
