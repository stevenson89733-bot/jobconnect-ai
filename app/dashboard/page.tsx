import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

// Pilot page for the light/dark theme system: every hard-coded dark color is
// paired as "light default + dark: variant". Other pages are not yet converted.
export default async function Dashboard() {
  const t = await getTranslations('dashboardHub')
  return (
    <div className="max-w-7xl mx-auto px-6 py-20 text-center">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">{t('title')}</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-10">{t('subtitle')}</p>
      <div className="grid sm:grid-cols-2 gap-6 max-w-xl mx-auto">
        <Link
          href="/candidate"
          className="bg-white dark:bg-card rounded-xl border border-slate-200 dark:border-slate-700/50 p-6 hover:border-primary/50 transition-all group text-left"
        >
          <div className="text-4xl mb-3">👤</div>
          <h2 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors mb-1">{t('candidateDashboard')}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">{t('candidateDashboardDesc')}</p>
        </Link>
        <Link
          href="/recruiter"
          className="bg-white dark:bg-card rounded-xl border border-slate-200 dark:border-slate-700/50 p-6 hover:border-accent/50 transition-all group text-left"
        >
          <div className="text-4xl mb-3">🏢</div>
          <h2 className="font-semibold text-slate-900 dark:text-white group-hover:text-accent transition-colors mb-1">{t('employerDashboard')}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">{t('employerDashboardDesc')}</p>
        </Link>
      </div>
    </div>
  )
}
