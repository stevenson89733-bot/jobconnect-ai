import { getTranslations } from 'next-intl/server'
import { Globe2, Languages, DollarSign, BarChart2 } from 'lucide-react'

const FEATURES = [
  { id: 'crossBorder', Icon: Globe2 },
  { id: 'language',    Icon: Languages },
  { id: 'salary',      Icon: DollarSign },
  { id: 'ats',         Icon: BarChart2 },
] as const

type FeatureId = typeof FEATURES[number]['id']

const TITLE_KEY: Record<FeatureId, string> = {
  crossBorder: 'featureCrossBorderTitle',
  language:    'featureLanguageTitle',
  salary:      'featureSalaryTitle',
  ats:         'featureAtsTitle',
}

const BODY_KEY: Record<FeatureId, string> = {
  crossBorder: 'featureCrossBorderBody',
  language:    'featureLanguageBody',
  salary:      'featureSalaryBody',
  ats:         'featureAtsBody',
}

export default async function HowItWorks() {
  const t = await getTranslations('home')

  return (
    <section id="how-it-works" className="bg-slate-50 dark:bg-card border-y border-slate-200 dark:border-slate-800 py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
            {t('howItWorksTitle')}
          </h2>
          <p className="text-body dark:text-slate-400 max-w-xl mx-auto">
            {t('howItWorksSubtitle')}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(({ id, Icon }) => (
            <div
              key={id}
              className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primarySoft dark:bg-primary/20 text-primary dark:text-blue-400 mb-4">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-[15.5px] text-slate-900 dark:text-white mb-1.5">
                {t(TITLE_KEY[id] as Parameters<typeof t>[0])}
              </h3>
              <p className="text-sm text-body dark:text-slate-400 leading-relaxed">
                {t(BODY_KEY[id] as Parameters<typeof t>[0])}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
