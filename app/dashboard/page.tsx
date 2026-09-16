import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

const RECOMMENDED_TOOLS = [
  { name: 'Deel', emoji: '🌍', desc: 'Global payroll in 150+ countries', href: 'https://www.deel.com/?ref=jobconnectai', color: '#15d8a2' },
  { name: 'Remote.com', emoji: '🏢', desc: 'Hire or get hired across borders', href: 'https://remote.com/?ref=jobconnectai', color: '#6b63ff' },
  { name: 'Wise', emoji: '💸', desc: 'Real-rate international transfers', href: 'https://wise.com/invite/jobconnectai', color: '#00b9ff' },
  { name: 'Payoneer', emoji: '💳', desc: 'Receive pay in 200+ countries', href: 'https://www.payoneer.com/ref/jobconnectai', color: '#ff4800' },
]

// Pilot page for the light/dark theme system: every hard-coded dark color is
// paired as "light default + dark: variant". Other pages are not yet converted.
export default async function Dashboard() {
  const t = await getTranslations('dashboardHub')
  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">{t('title')}</h1>
        <p className="text-slate-600 dark:text-slate-400">{t('subtitle')}</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-6 max-w-xl mx-auto mb-16">
        <Link
          href="/candidate"
          className="bg-white dark:bg-card rounded-xl border border-slate-200 dark:border-slate-700/50 p-6 hover:border-primary/50 transition-all group text-start"
        >
          <div className="text-4xl mb-3">👤</div>
          <h2 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors mb-1">{t('candidateDashboard')}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">{t('candidateDashboardDesc')}</p>
        </Link>
        <Link
          href="/recruiter"
          className="bg-white dark:bg-card rounded-xl border border-slate-200 dark:border-slate-700/50 p-6 hover:border-accent/50 transition-all group text-start"
        >
          <div className="text-4xl mb-3">🏢</div>
          <h2 className="font-semibold text-slate-900 dark:text-white group-hover:text-accent transition-colors mb-1">{t('employerDashboard')}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">{t('employerDashboardDesc')}</p>
        </Link>
      </div>

      {/* Recommended Tools widget */}
      <div className="max-w-2xl mx-auto bg-white dark:bg-card rounded-2xl border border-slate-200 dark:border-slate-700/50 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white text-sm">Recommended Tools</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">For international professionals</p>
          </div>
          <Link href="/partners" className="text-xs text-primary dark:text-blue-400 hover:underline">View all →</Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {RECOMMENDED_TOOLS.map((tool) => (
            <a
              key={tool.name}
              href={tool.href}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
            >
              <span className="text-2xl shrink-0">{tool.emoji}</span>
              <div className="min-w-0">
                <div className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-primary dark:group-hover:text-blue-400 transition-colors truncate">{tool.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{tool.desc}</div>
              </div>
            </a>
          ))}
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-600 mt-4 text-center">Affiliate links — we may earn a commission at no cost to you</p>
      </div>
    </div>
  )
}
