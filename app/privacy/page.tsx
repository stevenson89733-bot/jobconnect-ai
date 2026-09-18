import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export const metadata: Metadata = {
  title: 'Privacy Policy | JobConnect AI',
  description: 'GDPR-compliant privacy policy - how we handle your data',
}

export default async function PrivacyPage() {
  const t = await getTranslations('privacyPage')

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
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-200 mb-2">{t('s2SubPersonal')}</h3>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  {['s2Item1','s2Item2','s2Item3','s2Item4','s2Item5'].map(k => (
                    <li key={k}>{t(k as any)}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-200 mb-2">{t('s2SubAuto')}</h3>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  {['s2Item6','s2Item7','s2Item8'].map(k => (
                    <li key={k}>{t(k as any)}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">{t('s3Title')}</h2>
            <p className="mb-4">{t('s3Intro')}</p>
            <div className="space-y-3">
              {[
                { name: 'Supabase', desc: 'Cloud database and authentication. Stores user accounts, profiles, and application data.' },
                { name: 'Resend', desc: 'Email service provider. Sends transactional emails (password resets, notifications).' },
                { name: 'Crisp Chat', desc: 'Customer support platform. Enables live chat and communication with our support team.' },
                { name: 'Meta Pixel', desc: 'Analytics and advertising. Tracks user interactions to improve our service and measure marketing campaigns.' },
                { name: 'Stripe', desc: 'Payment processor. Handles subscription payments securely without storing card details on our servers.' },
              ].map(({ name, desc }) => (
                <div key={name} className="bg-slate-900/50 border border-slate-800 p-4 rounded-lg">
                  <h3 className="font-semibold text-slate-200 mb-1">{name}</h3>
                  <p className="text-sm text-slate-400">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">{t('s4Title')}</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              {['s4Item1','s4Item2','s4Item3','s4Item4','s4Item5','s4Item6'].map(k => (
                <li key={k}>{t(k as any)}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">{t('s5Title')}</h2>
            <p className="mb-4">{t('s5Intro')}</p>
            <div className="space-y-2">
              {[
                { title: 's5r1Title', text: 's5r1Text' },
                { title: 's5r2Title', text: 's5r2Text' },
                { title: 's5r3Title', text: 's5r3Text' },
                { title: 's5r4Title', text: 's5r4Text' },
                { title: 's5r5Title', text: 's5r5Text' },
              ].map(({ title, text }) => (
                <div key={title} className="bg-slate-900/50 border border-slate-800 p-3 rounded">
                  <h3 className="font-semibold text-slate-200">{t(title as any)}</h3>
                  <p className="text-sm text-slate-400">{t(text as any)}</p>
                </div>
              ))}
            </div>
            <p className="mt-4">{t('s5Contact')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">{t('s6Title')}</h2>
            <p>{t('s6Text')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">{t('s7Title')}</h2>
            <p><strong className="text-white">{t('s7Text')}</strong></p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">{t('s8Title')}</h2>
            <p>{t('s8Text')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">{t('s9Title')}</h2>
            <p>{t('s9Text')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">{t('s10Title')}</h2>
            <p className="mb-3">{t('s10Text')}</p>
            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-lg">
              <p className="font-semibold text-slate-200">JobConnect AI</p>
              <p className="text-slate-400">Email: <a href="mailto:contact@jobconnect-ai.com" className="text-blue-400 hover:text-blue-300">contact@jobconnect-ai.com</a></p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">{t('s11Title')}</h2>
            <p>{t('s11Text')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">{t('s12Title')}</h2>
            <p>{t('s12Text')}</p>
          </section>
        </div>
      </div>
    </main>
  )
}
