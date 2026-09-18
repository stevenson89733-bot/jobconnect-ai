import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export const metadata: Metadata = {
  title: 'Refund Policy | JobConnect AI',
  description: 'Refund and cancellation policy for JobConnect AI subscriptions',
}

export default async function RefundPage() {
  const t = await getTranslations('refundPage')

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">{t('title')}</h1>
        <p className="text-slate-400 mb-12">{t('lastUpdated')}</p>

        <div className="space-y-8 text-slate-300">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">{t('s1Title')}</h2>
            <p className="mb-4">{t('s1Text')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">{t('s2Title')}</h2>
            <p className="mb-4">{t('s2Text1')}</p>
            <p>
              {t('s2Text2').split('contact@jobconnect-ai.com').map((part, i, arr) =>
                i < arr.length - 1 ? (
                  <span key={i}>
                    {part}
                    <a href="mailto:contact@jobconnect-ai.com" className="text-blue-400 hover:text-blue-300 underline">
                      contact@jobconnect-ai.com
                    </a>
                  </span>
                ) : part
              )}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">{t('s3Title')}</h2>
            <p>{t('s3Text')}</p>
            <div className="mt-4 p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
              <p className="font-semibold text-slate-200">Email:</p>
              <a href="mailto:contact@jobconnect-ai.com" className="text-blue-400 hover:text-blue-300 underline">
                contact@jobconnect-ai.com
              </a>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
