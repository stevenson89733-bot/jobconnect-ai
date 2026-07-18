import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import HeroSearch from '@/components/HeroSearch'

// Static demo/marketing content (not real DB-backed jobs) — company names,
// job titles, and skill tags are left untranslated, same reasoning as not
// translating AI-generated resumes: these read as domain content, not UI
// chrome, and tech skill keywords are conventionally kept in English across
// locales. The job "type" badge below IS translated via the `jobs` namespace
// since that's a real shared UI label (Full-time/Contract).
const TRUSTED_COMPANIES = [
  { name: 'Anthropic', logo: '🤖' },
  { name: 'Vercel', logo: '▲' },
  { name: 'Linear', logo: '◆' },
  { name: 'Stripe', logo: 'S' },
  { name: 'Notion', logo: 'N' },
  { name: 'Figma', logo: 'F' },
]

const FEATURED_JOBS = [
  { title: 'Senior AI Engineer', company: 'Anthropic', location: 'Remote · USA', salary: '$180k–$240k', type: 'typeFullTime', tags: ['Python', 'ML', 'LLMs'] },
  { title: 'Staff Frontend Engineer', company: 'Vercel', location: 'Remote · Worldwide', salary: '$160k–$200k', type: 'typeFullTime', tags: ['React', 'Next.js', 'TypeScript'] },
  { title: 'Product Designer', company: 'Figma', location: 'Remote · US/EU', salary: '$140k–$180k', type: 'typeFullTime', tags: ['Figma', 'Design Systems', 'UX'] },
  { title: 'Backend Engineer', company: 'Linear', location: 'Remote · Worldwide', salary: '$150k–$190k', type: 'typeFullTime', tags: ['TypeScript', 'PostgreSQL', 'Go'] },
  { title: 'Growth Engineer', company: 'Stripe', location: 'Remote · USA', salary: '$155k–$195k', type: 'typeFullTime', tags: ['SQL', 'Python', 'A/B Testing'] },
  { title: 'DevRel Engineer', company: 'Notion', location: 'Remote · Worldwide', salary: '$130k–$160k', type: 'typeContract', tags: ['APIs', 'Developer Docs', 'Community'] },
] as const

export default async function Home() {
  const t = await getTranslations('home')
  const tj = await getTranslations('jobs')

  const HIGHLIGHTS = [
    { icon: '🌍', title: t('highlight1Title'), desc: t('highlight1Desc') },
    { icon: '✦', title: t('highlight2Title'), desc: t('highlight2Desc') },
    { icon: '🔒', title: t('highlight3Title'), desc: t('highlight3Desc') },
  ]

  const HOW_IT_WORKS = [
    { step: '01', icon: '📝', title: t('step1Title'), desc: t('step1Desc') },
    { step: '02', icon: '✦', title: t('step2Title'), desc: t('step2Desc') },
    { step: '03', icon: '📨', title: t('step3Title'), desc: t('step3Desc') },
  ]

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Gradient blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute top-[100px] right-[-100px] w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white dark:bg-card border border-slate-200 dark:border-slate-700 rounded-full px-4 py-1.5 text-sm text-slate-600 dark:text-slate-400 mb-8">
            <span className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400 animate-pulse" />
            <span>{t('heroBadge')}</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight mb-6">
            {t('heroTitle1')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
              {t('heroTitleHighlight')}
            </span>
            <br />
            {t('heroTitle2')}
          </h1>

          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t('heroSubtitle')}
          </p>

          {/* Search bar — live filtering via /jobs?q= */}
          <HeroSearch />
        </div>
      </section>

      {/* Trusted by */}
      <section className="border-y border-slate-200 dark:border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm text-slate-600 dark:text-slate-400 mb-6 uppercase tracking-widest">{t('trustedBy')}</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
            {TRUSTED_COMPANIES.map((c) => (
              <div key={c.name} className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300 transition-colors">
                <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-bold">{c.logo}</span>
                <span className="font-semibold text-sm">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {HIGHLIGHTS.map((h) => (
            <div key={h.title} className="card text-center">
              <div className="text-3xl mb-2">{h.icon}</div>
              <div className="font-semibold text-slate-900 dark:text-white mb-1">{h.title}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">{h.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('featuredJobsTitle')}</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">{t('featuredJobsSubtitle')}</p>
          </div>
          <Link href="/jobs" className="btn-outline text-sm hidden sm:flex">{t('viewAllJobs')}</Link>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {FEATURED_JOBS.map((job) => (
            <Link key={job.title + job.company} href="/jobs" className="card hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all group cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-lg font-bold text-slate-700 dark:text-slate-300">
                  {job.company[0]}
                </div>
                <span className={`badge ${job.type === 'typeFullTime' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400'}`}>
                  {tj(job.type)}
                </span>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors mb-1">{job.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{job.company}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">{job.location}</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {job.tags.map((tag) => (
                  <span key={tag} className="badge bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-400">{tag}</span>
                ))}
              </div>
              <p className="text-sm font-semibold text-orange-700 dark:text-accent">{job.salary}</p>
            </Link>
          ))}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link href="/jobs" className="btn-outline">{t('viewAllJobs')}</Link>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 dark:bg-card border-y border-slate-200 dark:border-slate-800 py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">{t('howItWorksTitle')}</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-14 max-w-xl mx-auto">{t('howItWorksSubtitle')}</p>
          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="relative">
                <div className="text-6xl mb-4">{item.icon}</div>
                <div className="text-xs font-mono text-primary dark:text-blue-400 mb-2">{item.step}</div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">{t('ctaTitle')}</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">{t('ctaSubtitle')}</p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link href="/register?role=candidate" className="btn-primary text-base px-8 py-3">{t('ctaCandidate')}</Link>
          <Link href="/register?role=employer" className="btn-outline text-base px-8 py-3">{t('ctaEmployer')}</Link>
        </div>
      </section>
    </>
  )
}
