import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

type IconProps = { size?: number; color?: string }

function FacebookIcon({ size = 24, color = '#1877F2' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.791-4.697 4.533-4.697 1.313 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.884v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
    </svg>
  )
}

function InstagramIcon({ size = 24, color = '#E4405F' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
    </svg>
  )
}

function RedditIcon({ size = 24, color = '#FF4500' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
    </svg>
  )
}

function LinkedInIcon({ size = 24, color = '#0A66C2' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  )
}

const SOCIAL_LINKS = [
  { name: 'Facebook', url: 'https://www.facebook.com/profile.php?id=61592905349788', Icon: FacebookIcon },
  { name: 'Instagram', url: 'https://www.instagram.com/jobc_onnectai/', Icon: InstagramIcon },
  { name: 'Reddit', url: 'https://www.reddit.com/user/jobconnectai/', Icon: RedditIcon },
  { name: 'LinkedIn', url: 'https://www.linkedin.com/company/jobconnect-ai/', Icon: LinkedInIcon },
]

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
        <div className="border-t border-slate-200 dark:border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400">
          <p>{t('copyright', { year: new Date().getFullYear() })}</p>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {SOCIAL_LINKS.map(({ name, url, Icon }) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-transform hover:scale-110"
                >
                  <Icon size={24} />
                </a>
              ))}
            </div>
            <div className="flex gap-4">
              <Link href="/privacy" className="hover:text-slate-700 dark:hover:text-slate-400">{t('privacy')}</Link>
              <Link href="/terms" className="hover:text-slate-700 dark:hover:text-slate-400">{t('terms')}</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
