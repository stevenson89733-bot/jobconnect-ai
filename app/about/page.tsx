import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About | JobConnect AI',
  description: 'Connecting global talent with companies that hire across borders. Built solo from Ho Chi Minh City, Vietnam.',
}

export default async function AboutPage() {
  const t = await getTranslations('aboutPage')

  return (
    <main className="min-h-screen bg-white dark:bg-background">
      {/* Hero */}
      <section className="bg-[#10152A] py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-4">
            {t('heroTitle')}
          </h1>
          <p className="text-slate-400 text-base max-w-xl mx-auto">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-[#0e1322] border-b border-slate-800 py-8 px-6">
        <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: t('stat1Value'), label: t('stat1Label') },
            { value: t('stat2Value'), label: t('stat2Label') },
            { value: t('stat3Value'), label: t('stat3Label') },
            { value: t('stat4Value'), label: t('stat4Label') },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-extrabold text-[#57C7E3]">{value}</p>
              <p className="text-sm text-slate-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-6 py-14 space-y-14">

        {/* Story */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{t('storyTitle')}</h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{t('storyText')}</p>
        </section>

        {/* Values */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{t('valuesTitle')}</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: '🔍', title: t('value1Title'), text: t('value1Text') },
              { icon: '🔒', title: t('value2Title'), text: t('value2Text') },
              { icon: '🌐', title: t('value3Title'), text: t('value3Text') },
            ].map(({ icon, title, text }) => (
              <div key={title} className="card p-5">
                <div className="text-2xl mb-3">{icon}</div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="card p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{t('teamTitle')}</h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-3">{t('teamText')}</p>
          <a href={`mailto:${t('teamContact')}`} className="text-[#57C7E3] hover:underline text-sm">
            {t('teamContact')}
          </a>
        </section>

        {/* CTA */}
        <section className="text-center py-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('ctaTitle')}</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{t('ctaText')}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#57C7E3] text-[#10152A] font-semibold hover:bg-[#3fb8d4] transition-colors"
            >
              {t('ctaButton')}
            </Link>
            <Link
              href="/faq"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {t('faqLinkText')}
            </Link>
          </div>
        </section>

      </div>
    </main>
  )
}
