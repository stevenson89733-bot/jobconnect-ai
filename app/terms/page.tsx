import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export const metadata: Metadata = {
  title: 'Terms of Service | JobConnect AI',
  description: 'Terms of Service for JobConnect AI platform',
}

export default async function TermsPage() {
  const t = await getTranslations('termsPage')

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">{t('title')}</h1>
        <p className="text-slate-400 mb-12">{t('lastUpdated')}</p>

        <div className="space-y-8 text-slate-300">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">{t('s1Title')}</h2>
            <p>{t('s1Text')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">{t('s2Title')}</h2>
            <p>{t('s2Text')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">{t('s3Title')}</h2>
            <div className="space-y-3">
              {[
                { name: 's3FreeName', desc: 's3FreeText' },
                { name: 's3ProName', desc: 's3ProText' },
                { name: 's3EliteName', desc: 's3EliteText' },
              ].map(({ name, desc }) => (
                <div key={name} className="bg-slate-900/50 border border-slate-800 p-4 rounded-lg">
                  <h3 className="font-semibold text-slate-200 mb-2">{t(name as any)}</h3>
                  <p className="text-sm text-slate-400">{t(desc as any)}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">{t('s4Title')}</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              {['s4Item1','s4Item2','s4Item3','s4Item4','s4Item5'].map(k => (
                <li key={k}>{t(k as any)}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">{t('s5Title')}</h2>
            <p><strong className="text-white">{t('s5Text')}</strong></p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">{t('s6Title')}</h2>
            <p className="mb-3">{t('s6Intro')}</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              {['s6Item1','s6Item2','s6Item3','s6Item4','s6Item5','s6Item6'].map(k => (
                <li key={k}>{t(k as any)}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">{t('s7Title')}</h2>
            <p>{t('s7Text')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">{t('s8Title')}</h2>
            <p>{t('s8Text')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">{t('s9Title')}</h2>
            <p><strong className="text-white">{t('s9Text')}</strong></p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">{t('s10Title')}</h2>
            <p>{t('s10Text')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">{t('s11Title')}</h2>
            <p>{t('s11Text')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">{t('s12Title')}</h2>
            <p>{t('s12Text')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">{t('s13Title')}</h2>
            <p className="mb-3">{t('s13Text')}</p>
            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-lg">
              <p className="font-semibold text-slate-200">JobConnect AI</p>
              <p className="text-slate-400">Email: <a href="mailto:contact@jobconnect-ai.com" className="text-blue-400 hover:text-blue-300">contact@jobconnect-ai.com</a></p>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
