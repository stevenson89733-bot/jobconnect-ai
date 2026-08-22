import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import type { LandingMarket } from '@/lib/seo/landing-data'
import { SITE_URL } from '@/lib/seo'

export default function RemoteJobsLanding({ market: m }: { market: LandingMarket }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: m.h1,
    description: m.metaDescription,
    url: `${SITE_URL}/${m.slug}`,
    publisher: {
      '@type': 'Organization',
      name: 'JobConnect AI',
      url: SITE_URL,
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: `Remote Jobs in ${m.countryName}`, item: `${SITE_URL}/${m.slug}` },
      ],
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero ── */}
      <section className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
          <div className="inline-flex items-center gap-2 text-sm font-medium text-primary dark:text-blue-400 bg-primary/8 dark:bg-blue-500/15 px-3 py-1 rounded-full mb-6">
            <span>{m.flag}</span>
            <span>Remote Jobs in {m.countryName}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight mb-4">
            {m.h1}
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-3 font-medium">
            {m.heroTagline}
          </p>
          <p className="text-base text-slate-500 dark:text-slate-400 max-w-2xl mb-8 leading-relaxed">
            {m.heroBody}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href={m.ctaHref}
              className="btn-primary px-6 py-3 text-base font-semibold flex items-center gap-2"
            >
              {m.ctaText} <ArrowRight size={18} />
            </Link>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">{m.salaryRange}</span> typical salary range
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {m.topCities.split(' · ').map(city => (
              <span key={city} className="text-xs px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                📍 {city}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why section ── */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-10">
          {m.whyTitle}
        </h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {m.whyPoints.map(p => (
            <div key={p.heading} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <div className="text-3xl mb-3">{p.icon}</div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{p.heading}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── What's different ── */}
      <section className="bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-10">
            {m.diffTitle}
          </h2>
          <div className="space-y-6">
            {m.diffPoints.map((p, i) => (
              <div key={i} className="flex gap-4">
                <CheckCircle2 size={20} className="text-primary dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{p.heading}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our tools ── */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3">
          {m.toolsTitle}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
          Purpose-built features to help you land a job in {m.countryName} — no guesswork.
        </p>
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {m.tools.map((tool, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 dark:bg-blue-500/15 flex items-center justify-center text-primary dark:text-blue-400 font-bold text-sm mb-3">
                {i + 1}
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">{tool.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{tool.description}</p>
            </div>
          ))}
        </div>

        {/* Final CTA */}
        <div className="bg-gradient-to-r from-primary/10 to-violet-500/10 dark:from-blue-500/15 dark:to-violet-500/15 border border-primary/20 dark:border-blue-500/20 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Ready to find your remote job in {m.countryName}?
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
            Browse {m.flag} {m.countryName}-based remote roles filtered for international candidates.
          </p>
          <Link
            href={m.ctaHref}
            className="btn-primary px-8 py-3 text-base font-semibold inline-flex items-center gap-2"
          >
            {m.ctaText} <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── Internal links ── */}
      <section className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Also explore</p>
          <div className="flex flex-wrap gap-3">
            {[
              { label: '🇩🇪 Remote Jobs Germany', href: '/remote-jobs-germany' },
              { label: '🇫🇷 Remote Jobs France',  href: '/remote-jobs-france' },
              { label: '🇬🇧 Remote Jobs UK',       href: '/remote-jobs-uk' },
              { label: '🇺🇸 Remote Jobs USA',      href: '/remote-jobs-usa' },
              { label: '🇨🇦 Remote Jobs Canada',   href: '/remote-jobs-canada' },
            ].filter(l => !l.href.includes(m.slug)).map(l => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-primary/50 dark:hover:border-blue-500/50 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
