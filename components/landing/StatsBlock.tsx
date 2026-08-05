import { getTranslations } from 'next-intl/server'

export default async function StatsBlock() {
  const t = await getTranslations('home')

  return (
    <section className="bg-slate-50 dark:bg-card border-y border-slate-200 dark:border-slate-800 py-20">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="font-display text-3xl font-bold text-slate-900 dark:text-white mb-12">
          {t('platformInNumbersTitle')}
        </h2>

        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div>
            <dd className="text-4xl font-extrabold text-primary dark:text-blue-400">11</dd>
            <dt className="mt-1 text-sm text-body dark:text-slate-400">{t('statLanguagesLabel')}</dt>
          </div>
          <div>
            <dd className="text-4xl font-extrabold text-primary dark:text-blue-400">63</dd>
            <dt className="mt-1 text-sm text-body dark:text-slate-400">{t('statCountriesLabel')}</dt>
          </div>
          <div>
            <dd className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
              {t('platformStatAiScored')}
            </dd>
          </div>
          <div>
            <dd className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
              {t('platformStatCrossBorder')}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
