import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export default async function EmployerOnlyGate() {
  const t = await getTranslations('employerGate')
  return (
    <div className="max-w-xl mx-auto px-6 py-24 text-center">
      <div className="text-5xl mb-4">🔒</div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('title')}</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-6">{t('message')}</p>
      <Link href="/dashboard" className="btn-primary text-sm px-6 py-2.5">{t('backToDashboard')}</Link>
    </div>
  )
}
