import Link from 'next/link'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('partnersPage')
  return {
    title: `${t('title')} | JobConnect AI`,
    description: t('subtitle'),
  }
}

const PARTNERS = [
  {
    key: 'deel',
    name: 'Deel',
    logo: '🌍',
    href: 'https://www.deel.com/?ref=jobconnectai',
    accent: '#15d8a2',
  },
  {
    key: 'remote',
    name: 'Remote.com',
    logo: '🏢',
    href: 'https://remote.com/?ref=jobconnectai',
    accent: '#6b63ff',
  },
  {
    key: 'wise',
    name: 'Wise',
    logo: '💸',
    href: 'https://wise.com/invite/jobconnectai',
    accent: '#00b9ff',
  },
  {
    key: 'payoneer',
    name: 'Payoneer',
    logo: '💳',
    href: 'https://www.payoneer.com/ref/jobconnectai',
    accent: '#ff4800',
  },
] as const

export default async function PartnersPage() {
  const t = await getTranslations('partnersPage')

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="text-center mb-14">
        <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary dark:text-blue-400 mb-3">
          {t('badge')}
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
          {t('title')}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          {t('subtitle')}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-600 mt-3">
          {t('affiliateNote')}
        </p>
      </div>

      {/* Partner Cards */}
      <div className="grid sm:grid-cols-2 gap-6">
        {PARTNERS.map((partner) => (
          <div
            key={partner.key}
            className="bg-white dark:bg-card rounded-2xl border border-slate-200 dark:border-slate-700/50 p-7 flex flex-col gap-4 hover:shadow-lg dark:hover:shadow-slate-900/40 transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="text-4xl">{partner.logo}</div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{partner.name}</h2>
                <p className="text-xs font-medium" style={{ color: partner.accent }}>
                  {t(`${partner.key}Tagline`)}
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-1">
              {t(`${partner.key}Description`)}
            </p>
            <a
              href={partner.href}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: partner.accent }}
            >
              {t(`${partner.key}Cta`)}
            </a>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-16 text-center border-t border-slate-200 dark:border-slate-800 pt-12">
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">{t('browseJobsLabel')}</p>
        <Link href="/jobs" className="btn-primary px-8 py-3 text-sm">{t('browseJobs')}</Link>
      </div>
    </div>
  )
}
