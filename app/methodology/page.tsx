import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('methodologyPage')
  return {
    title: t('metaTitle'),
    description: t('metaDesc'),
  }
}

function Section({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{icon}</span>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
      </div>
      <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        {children}
      </div>
    </section>
  )
}

function Pill({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
      <span className="text-[13px] font-semibold text-slate-900 dark:text-white whitespace-nowrap">{label}</span>
      <span className="text-[13px] text-slate-500 dark:text-slate-400">{sub}</span>
    </div>
  )
}

export default async function MethodologyPage() {
  const t = await getTranslations('methodologyPage')

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">

      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#57C7E3' }}>{t('badge')}</p>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">{t('title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xl">{t('subtitle')}</p>
      </div>

      {/* 1. Match Score */}
      <Section icon="🎯" title={t('s1Title')}>
        <p>{t('s1Intro')}</p>
        <div className="space-y-2 mt-2">
          <Pill label={t('s1p1Label')} sub={t('s1p1Sub')} />
          <Pill label={t('s1p2Label')} sub={t('s1p2Sub')} />
          <Pill label={t('s1p3Label')} sub={t('s1p3Sub')} />
          <Pill label={t('s1p4Label')} sub={t('s1p4Sub')} />
          <Pill label={t('s1p5Label')} sub={t('s1p5Sub')} />
        </div>
        <p className="mt-3">{t('s1Outro')}</p>
      </Section>

      <hr className="border-slate-200 dark:border-slate-800 mb-10" />

      {/* 2. Cross-Border */}
      <Section icon="🌍" title={t('s2Title')}>
        <p>{t('s2Intro')}</p>
        <p>{t('s2Intro2')}</p>
        <div className="space-y-2 mt-2">
          <Pill label={t('s2p1Label')} sub={t('s2p1Sub')} />
          <Pill label={t('s2p2Label')} sub={t('s2p2Sub')} />
          <Pill label={t('s2p3Label')} sub={t('s2p3Sub')} />
          <Pill label={t('s2p4Label')} sub={t('s2p4Sub')} />
        </div>
        <p className="mt-3">{t('s2Outro')}</p>
      </Section>

      <hr className="border-slate-200 dark:border-slate-800 mb-10" />

      {/* 2b. Cross-Border Score */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">🏅</span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('s5Title')}</h2>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-6">{t('s5Intro')}</p>

        {/* Signal cards */}
        {(
          [
            { key: 'sig1', color: '#F0663A' },
            { key: 'sig2', color: '#57C7E3' },
            { key: 'sig3', color: '#a78bfa' },
            { key: 'sig4', color: '#34d399' },
          ] as const
        ).map(({ key, color }) => (
          <div
            key={key}
            className="mb-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                {t(`s5${key}Title` as Parameters<typeof t>[0])}
              </span>
              <span
                className="text-xs font-extrabold px-2.5 py-1 rounded-full text-white"
                style={{ background: color }}
              >
                {t(`s5${key}Points` as Parameters<typeof t>[0])}
              </span>
            </div>
            <div className="px-5 py-4 space-y-2.5">
              <p className="text-[13px] text-slate-600 dark:text-slate-400">
                {t(`s5${key}Desc` as Parameters<typeof t>[0])}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {t(`s5${key}Keywords` as Parameters<typeof t>[0])
                  .split(',')
                  .map((kw) => kw.trim())
                  .map((kw) => (
                    <span
                      key={kw}
                      className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    >
                      {kw}
                    </span>
                  ))}
              </div>
              <p className="text-[13px] italic text-slate-500 dark:text-slate-400 pt-1">
                {t(`s5${key}Example` as Parameters<typeof t>[0])}
              </p>
            </div>
          </div>
        ))}

        {/* Score thresholds */}
        <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div
            className="px-5 py-3 text-xs font-bold uppercase tracking-widest text-white"
            style={{ background: '#0D1526' }}
          >
            Score thresholds
          </div>
          {[
            { labelKey: 's5ThresholdHigh', subKey: 's5ThresholdHighSub', dot: '#34d399' },
            { labelKey: 's5ThresholdMed',  subKey: 's5ThresholdMedSub',  dot: '#57C7E3' },
            { labelKey: 's5ThresholdLow',  subKey: 's5ThresholdLowSub',  dot: '#94a3b8' },
          ].map(({ labelKey, subKey, dot }) => (
            <div key={labelKey} className="flex items-start gap-3 px-5 py-4 border-t border-slate-100 dark:border-slate-800">
              <span className="mt-1.5 h-2.5 w-2.5 rounded-full shrink-0" style={{ background: dot }} />
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {t(labelKey as Parameters<typeof t>[0])}
                </p>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {t(subKey as Parameters<typeof t>[0])}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mt-5">{t('s5Outro')}</p>
      </section>

      <hr className="border-slate-200 dark:border-slate-800 mb-10" />

      {/* 3. Job Database */}
      <Section icon="🗄️" title={t('s3Title')}>
        <p>{t('s3Intro')}</p>
        <div className="space-y-2 mt-2">
          <Pill label={t('s3p1Label')} sub={t('s3p1Sub')} />
          <Pill label={t('s3p2Label')} sub={t('s3p2Sub')} />
          <Pill label={t('s3p3Label')} sub={t('s3p3Sub')} />
          <Pill label={t('s3p4Label')} sub={t('s3p4Sub')} />
        </div>
        <p className="mt-3">{t('s3Outro')}</p>
      </Section>

      <hr className="border-slate-200 dark:border-slate-800 mb-10" />

      {/* 4. Numbers */}
      <Section icon="📊" title={t('s4Title')}>
        <p>{t('s4Intro')}</p>
        <div className="space-y-4 mt-4">
          {(['1','2','3'] as const).map((n) => (
            <div key={n} className="rounded-xl p-5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">
                {t(`s4stat${n}Label` as Parameters<typeof t>[0])}
              </div>
              <p className="text-[13px] text-slate-600 dark:text-slate-400">
                {t(`s4stat${n}Desc` as Parameters<typeof t>[0])}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Footer note */}
      <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[13px] text-slate-500 dark:text-slate-400">
        {t('footerNote')}{' '}
        <Link href="/contact" className="underline hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
          {t('contactLink')}
        </Link>{' '}
        {t('footerNoteEnd')}
      </div>
    </div>
  )
}
