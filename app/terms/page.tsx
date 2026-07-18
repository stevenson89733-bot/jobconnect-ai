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

export default async function TermsOfService() {
  const t = await getTranslations('legal.terms')

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">{t('title')}</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">{t('lastUpdated')}</p>
      </div>

      <div className="mb-8 p-4 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-800/50 text-sm text-yellow-800 dark:text-yellow-400">
        <strong>{t('draftNoticeLead')}</strong> {t('draftNoticeBody')}
      </div>

      <div className="card space-y-2">
        <Section title={t('acceptanceTitle')}>
          <p>{t('acceptanceBody')}</p>
        </Section>

        <Section title={t('descriptionTitle')}>
          <p>{t('descriptionBody')}</p>
        </Section>

        <Section title={t('accountsTitle')}>
          <p>{t('accountsBody')}</p>
        </Section>

        <Section title={t('candidateFeaturesTitle')}>
          <p>{t('candidateFeaturesBody')}</p>
        </Section>

        <Section title={t('employerFeaturesTitle')}>
          <p>{t('employerFeaturesBody')}</p>
        </Section>

        <Section title={t('premiumTitle')}>
          <p>{t('premiumBody')}</p>
        </Section>

        <Section title={t('aiContentTitle')}>
          <p>{t('aiContentBody')}</p>
        </Section>

        <Section title={t('acceptableUseTitle')}>
          <p>{t('acceptableUseBody')}</p>
        </Section>

        <Section title={t('yourContentTitle')}>
          <p>{t('yourContentBody')}</p>
        </Section>

        <Section title={t('terminationTitle')}>
          <p>{t('terminationBody')}</p>
        </Section>

        <Section title={t('disclaimersTitle')}>
          <p>{t('disclaimersBody')}</p>
        </Section>

        <Section title={t('governingLawTitle')}>
          <p className="italic text-slate-600 dark:text-slate-400">
            {t('governingLawBody')}
          </p>
        </Section>

        <Section title={t('changesTitle')}>
          <p>{t('changesBody')}</p>
        </Section>

        <Section title={t('contactTitle')}>
          <p>
            {t.rich('contactBody', {
              contactPage: (chunks) => <Link href="/contact" className="text-primary dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 underline underline-offset-2">{chunks}</Link>,
            })}
          </p>
        </Section>
      </div>
    </div>
  )
}
