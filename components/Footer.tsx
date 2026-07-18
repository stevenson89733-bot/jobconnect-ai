import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export default async function Footer() {
  const t = await getTranslations('footer')
  const tc = await getTranslations('common')
  const tn = await getTranslations('nav')

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-3">
              <span className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white text-xs font-black">J</span>
              <span className="text-slate-900 dark:text-white">{tc('brand')} <span className="text-primary dark:text-blue-400">{tc('brandSuffix')}</span></span>
            </Link>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{t('tagline')}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">{t('product')}</h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li><Link href="/jobs" className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors">{tn('browseJobs')}</Link></li>
              <li><Link href="/companies" className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors">{tn('companies')}</Link></li>
              <li><Link href="/pricing" className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors">{tn('pricing')}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">{t('forEmployers')}</h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li><Link href="/register?role=employer" className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors">{t('postAJob')}</Link></li>
              <li><Link href="/recruiter" className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors">{t('employerDashboard')}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">{t('company')}</h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li><Link href="/about" className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors">{t('about')}</Link></li>
              <li><Link href="/contact" className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors">{t('contact')}</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-200 dark:border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
          <p>{t('copyright', { year: new Date().getFullYear() })}</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-slate-700 dark:hover:text-slate-400">{t('privacy')}</Link>
            <Link href="/terms" className="hover:text-slate-700 dark:hover:text-slate-400">{t('terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
