import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">{title}</h2>
      <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{children}</div>
    </div>
  )
}

export default async function Companies() {
  const t = await getTranslations('forCompaniesPage')
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">{t('title')}</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">{t('subtitle')}</p>
      </div>

      <div className="card space-y-2">
        <Section title={t('postJobsTitle')}>
          <p>{t('postJobsText')}</p>
        </Section>

        <Section title={t('privacyTitle')}>
          <p>{t('privacyText')}</p>
        </Section>

        <Section title={t('whereWeAreTitle')}>
          <p>{t('whereWeAreText')}</p>
        </Section>

        <div className="pt-2">
          <Link
            href="/register?role=employer"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-blue-600 transition-colors"
          >
            {t('postAJob')}
          </Link>
        </div>
      </div>
    </div>
  )
}
