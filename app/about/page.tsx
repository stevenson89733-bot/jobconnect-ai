import { getTranslations } from 'next-intl/server'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">{title}</h2>
      <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{children}</div>
    </div>
  )
}

export default async function About() {
  const t = await getTranslations('aboutPage')
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">{t('title')}</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">{t('subtitle')}</p>
      </div>

      <div className="card space-y-2">
        <Section title={t('missionTitle')}>
          <p>{t('missionText')}</p>
        </Section>

        <Section title={t('whatWeDoTitle')}>
          <p>{t('whatWeDoText')}</p>
        </Section>

        <Section title={t('whereWeAreTitle')}>
          <p>{t('whereWeAreText')}</p>
        </Section>

        <Section title={t('whoTitle')}>
          <p>{t('whoText')}</p>
        </Section>

        <Section title={t('getInTouchTitle')}>
          <p>{t('getInTouchText')}</p>
        </Section>
      </div>
    </div>
  )
}
