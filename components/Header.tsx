'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { signOut } from '@/app/actions/auth'
import ThemeToggle from './ThemeToggle'
import LanguageSwitcher from './LanguageSwitcher'
import CountrySelector from './country/CountrySelector'

export default function Header({ userEmail, isAdmin }: { userEmail?: string | null; isAdmin?: boolean }) {
  const [open, setOpen] = useState(false)
  const t = useTranslations('nav')
  const tc = useTranslations('common')

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-background/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <img src="/logo.png" alt="JobConnect AI" height={40} className="object-contain" style={{ height: 40, width: 'auto' }} />
          <span className="text-slate-900 dark:text-white">{tc('brand')} <span className="text-primary dark:text-blue-400">{tc('brandSuffix')}</span></span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
          <Link href="/jobs" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t('browseJobs')}</Link>
          <Link href="/companies" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t('companies')}</Link>

          {/* AI Tools dropdown (hover) */}
          <div className="relative group">
            <button className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition-colors">
              <span className="text-orange-600 dark:text-accent">✦</span> {t('aiTools')}
              <svg className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {/* pt-2 bridges the gap so the menu stays open while moving the cursor */}
            <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 hidden group-hover:block">
              <div className="w-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-card shadow-lg dark:shadow-black/40 p-1.5">
                <Link href="/ai-tools/resume-builder" className="flex flex-col rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <span className="font-medium text-slate-900 dark:text-white">📄 {t('resumeBuilder')}</span>
                  <span className="text-xs text-slate-600 dark:text-slate-400">{t('resumeBuilderDesc')}</span>
                </Link>
                <Link href="/ai-tools/cover-letter" className="flex flex-col rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <span className="font-medium text-slate-900 dark:text-white">✉️ {t('coverLetter')}</span>
                  <span className="text-xs text-slate-600 dark:text-slate-400">{t('coverLetterDesc')}</span>
                </Link>
              </div>
            </div>
          </div>

          <Link href="/pricing" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t('pricing')}</Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />
          <CountrySelector />
          <ThemeToggle />
          {userEmail ? (
            <>
              <Link href="/dashboard" className="text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors px-4 py-2">
                {t('dashboard')}
              </Link>
              <Link href="/profile" className="text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors px-4 py-2">
                {t('profile')}
              </Link>
              {isAdmin && (
                <Link href="/admin/reviews" className="text-sm text-orange-700 dark:text-accent hover:text-orange-800 dark:hover:text-accent/80 transition-colors px-4 py-2">
                  🛡️ {t('admin')}
                </Link>
              )}
              <form action={signOut}>
                <button type="submit" className="btn-outline text-sm py-2 text-slate-700 dark:text-slate-300">
                  {t('signOut')}
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors px-4 py-2">
                {t('signIn')}
              </Link>
              <Link href="/register" className="btn-primary text-sm">
                {t('getStarted')}
              </Link>
            </>
          )}
        </div>

        <div className="md:hidden flex items-center gap-2">
          <LanguageSwitcher />
          <CountrySelector />
          <ThemeToggle />
          <button
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            onClick={() => setOpen(!open)}
            aria-label={open ? t('closeMenu') : t('openMenu')}
            aria-expanded={open}
          >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-white dark:bg-card border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex flex-col gap-4 text-sm">
          <Link href="/jobs" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white" onClick={() => setOpen(false)}>{t('browseJobs')}</Link>
          <Link href="/companies" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white" onClick={() => setOpen(false)}>{t('companies')}</Link>
          <Link href="/pricing" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white" onClick={() => setOpen(false)}>{t('pricing')}</Link>

          <div className="pt-2 mt-1 border-t border-slate-200 dark:border-slate-800">
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              <span className="text-orange-600 dark:text-accent">✦</span> {t('aiTools')}
            </span>
            <Link href="/ai-tools/resume-builder" className="block text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white mb-2" onClick={() => setOpen(false)}>📄 {t('resumeBuilder')}</Link>
            <Link href="/ai-tools/cover-letter" className="block text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white" onClick={() => setOpen(false)}>✉️ {t('coverLetter')}</Link>
          </div>
          {userEmail ? (
            <>
              <Link href="/dashboard" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white" onClick={() => setOpen(false)}>{t('dashboard')}</Link>
              <Link href="/profile" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white" onClick={() => setOpen(false)}>{t('profile')}</Link>
              {isAdmin && (
                <Link href="/admin/reviews" className="text-orange-700 dark:text-accent hover:text-orange-800 dark:hover:text-accent/80" onClick={() => setOpen(false)}>🛡️ {t('admin')}</Link>
              )}
              <form action={signOut}><button type="submit" className="text-left text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">{t('signOut')}</button></form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white" onClick={() => setOpen(false)}>{t('signIn')}</Link>
              <Link href="/register" className="btn-primary text-center" onClick={() => setOpen(false)}>{t('getStarted')}</Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
