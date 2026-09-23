'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { signOut } from '@/app/actions/auth'
import ThemeToggle from './ThemeToggle'
import LanguageSwitcher from './LanguageSwitcher'
import CountrySelector from './country/CountrySelector'
import NotificationBell from './notifications/NotificationBell'

export default function Header({ userEmail, isAdmin }: { userEmail?: string | null; isAdmin?: boolean }) {
  const [open, setOpen] = useState(false)
  const t = useTranslations('nav')
  const tc = useTranslations('common')

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-background/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
        <Link href="/" className="logo-link" style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0, overflow: 'visible' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-full-cropped.png" alt="JobConnect AI" style={{ height: 44, width: 'auto', display: 'block', objectFit: 'contain' }} />
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
          {/* Browse Jobs mega-menu */}
          <div className="relative group">
            <Link href="/jobs" className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1">
              {t('browseJobs')}
              <svg className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </Link>
            {/* pt-3 bridges hover gap; left-0 anchors from trigger so no column clips off-screen */}
            <div className="absolute left-0 top-full pt-3 hidden group-hover:block z-50">
              <div className="grid grid-cols-3 gap-8 p-6 bg-white border border-gray-100 shadow-2xl rounded-2xl min-w-[620px]">
                {/* Column 1 — Job Categories */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3">Job Categories</p>
                  {[
                    ['Engineering',        'Engineering'],
                    ['Marketing',          'Marketing'],
                    ['Design',             'Design'],
                    ['Sales',              'Sales'],
                    ['Finance & Accounting','Finance'],
                    ['Data Science',       'Data'],
                    ['HR & Recruiting',    'HR'],
                  ].map(([label, value]) => (
                    <Link key={value} href={`/jobs?category=${encodeURIComponent(value)}`} className="block text-sm text-slate-700 hover:text-[#57C7E3] py-1 transition-colors">
                      {label}
                    </Link>
                  ))}
                  <Link href="/jobs" className="block text-sm text-[#57C7E3] font-medium mt-2 hover:underline">All categories →</Link>
                </div>
                {/* Column 2 — Job Locations */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3">Job Locations</p>
                  {[
                    ['🇺🇸 USA',          'US'],
                    ['🇫🇷 France',       'FR'],
                    ['🇩🇪 Germany',      'DE'],
                    ['🇬🇧 UK',           'GB'],
                    ['🇨🇦 Canada',       'CA'],
                    ['🌍 Global Remote', 'worldwide'],
                  ].map(([label, value]) => (
                    <Link key={value} href={`/jobs?country=${value}`} className="block text-sm text-slate-700 hover:text-[#57C7E3] py-1 transition-colors">
                      {label}
                    </Link>
                  ))}
                  <Link href="/jobs" className="block text-sm text-[#57C7E3] font-medium mt-2 hover:underline">All locations →</Link>
                </div>
                {/* Column 3 — Job Types */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3">Job Types</p>
                  {[
                    ['Remote Full-time', 'Full-time'],
                    ['Remote Part-time', 'Part-time'],
                    ['Contract',        'Contract'],
                    ['Freelance',       'Contract'],
                  ].map(([label, value]) => (
                    <Link key={label} href={`/jobs?type=${encodeURIComponent(value)}`} className="block text-sm text-slate-700 hover:text-[#57C7E3] py-1 transition-colors">
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
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
                <Link href="/ai-tools/interview-prep" className="flex flex-col rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <span className="font-medium text-slate-900 dark:text-white">🎤 {t('interviewPrep')}</span>
                  <span className="text-xs text-slate-600 dark:text-slate-400">{t('interviewPrepDesc')}</span>
                </Link>
                <Link href="/ai-tools/linkedin-optimizer" className="flex flex-col rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <span className="font-medium text-slate-900 dark:text-white">🔗 {t('linkedinOptimizer')}</span>
                  <span className="text-xs text-slate-600 dark:text-slate-400">{t('linkedinOptimizerDesc')}</span>
                </Link>
                <Link href="/ai-tools/skill-gap" className="flex flex-col rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <span className="font-medium text-slate-900 dark:text-white">🧭 {t('skillGap')}</span>
                  <span className="text-xs text-slate-600 dark:text-slate-400">{t('skillGapDesc')}</span>
                </Link>
                <Link href="/ai-tools/cv-builder" className="flex flex-col rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <span className="font-medium text-slate-900 dark:text-white">📋 {t('cvBuilder')}</span>
                  <span className="text-xs text-slate-600 dark:text-slate-400">{t('cvBuilderDesc')}</span>
                </Link>
                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                <Link href="/auto-apply" className="flex flex-col rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <span className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                    🤖 Auto-Apply
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">Pro Feature</span>
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-400">AI applies to remote jobs for you daily</span>
                </Link>
              </div>
            </div>
          </div>

          {/* ✦ Pro Features dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition-colors">
              <span className="text-[#F0663A]">✦</span> Pro
              <svg className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="absolute left-0 top-full pt-3 hidden group-hover:block z-50">
              <div className="grid grid-cols-2 gap-8 p-6 bg-white border border-gray-100 shadow-2xl rounded-2xl min-w-[520px]">
                {/* Column 1 — Elite (Candidates) */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">⭐ Elite — Candidates</p>
                  <a href="/pricing" className="flex items-start gap-2 py-2 group/item">
                    <span className="text-lg leading-none mt-0.5">🤖</span>
                    <span>
                      <span className="block text-sm font-medium text-slate-800 group-hover/item:text-[#F0663A] transition-colors">Auto-Apply</span>
                      <span className="block text-xs text-gray-400">Apply to 100+ jobs automatically</span>
                    </span>
                  </a>
                  <a href="/pricing" className="flex items-start gap-2 py-2 group/item">
                    <span className="text-lg leading-none mt-0.5">✨</span>
                    <span>
                      <span className="block text-sm font-medium text-slate-800 group-hover/item:text-[#F0663A] transition-colors">AI Job Match</span>
                      <span className="block text-xs text-gray-400">AI-ranked jobs tailored to you</span>
                    </span>
                  </a>
                  <a href="/pricing" className="flex items-start gap-2 py-2 group/item">
                    <span className="text-lg leading-none mt-0.5">🔔</span>
                    <span>
                      <span className="block text-sm font-medium text-slate-800 group-hover/item:text-[#F0663A] transition-colors">Interview Alerts</span>
                      <span className="block text-xs text-gray-400">Never miss a callback</span>
                    </span>
                  </a>
                </div>
                {/* Column 2 — Pro (Employers) */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">🏢 Pro — Employers</p>
                  <a href="/pricing" className="flex items-start gap-2 py-2 group/item">
                    <span className="text-lg leading-none mt-0.5">📅</span>
                    <span>
                      <span className="block text-sm font-medium text-slate-800 group-hover/item:text-[#F0663A] transition-colors">Meeting Calendar</span>
                      <span className="block text-xs text-gray-400">Booking link for candidates</span>
                    </span>
                  </a>
                  <a href="/pricing" className="flex items-start gap-2 py-2 group/item">
                    <span className="text-lg leading-none mt-0.5">🔗</span>
                    <span>
                      <span className="block text-sm font-medium text-slate-800 group-hover/item:text-[#F0663A] transition-colors">Interview Scheduling Link</span>
                      <span className="block text-xs text-gray-400">Share smart link with applicants</span>
                    </span>
                  </a>
                  <a href="/pricing" className="flex items-start gap-2 py-2 group/item">
                    <span className="text-lg leading-none mt-0.5">📊</span>
                    <span>
                      <span className="block text-sm font-medium text-slate-800 group-hover/item:text-[#F0663A] transition-colors">Talent Analytics</span>
                      <span className="block text-xs text-gray-400">Track pipeline & conversions</span>
                    </span>
                  </a>
                  <a href="/pricing" className="flex items-start gap-2 py-2 group/item">
                    <span className="text-lg leading-none mt-0.5">⚡</span>
                    <span>
                      <span className="block text-sm font-medium text-slate-800 group-hover/item:text-[#F0663A] transition-colors">Priority Listing</span>
                      <span className="block text-xs text-gray-400">Top placement in search results</span>
                    </span>
                  </a>
                </div>
                {/* CTA footer */}
                <div className="col-span-2 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-400">Elite from <strong className="text-slate-700">$39.99/mo</strong> · Pro from <strong className="text-slate-700">$19.99/mo</strong></span>
                  <a href="/pricing" className="inline-flex items-center gap-1.5 bg-[#F0663A] text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-[#d4522a] transition-colors">
                    🔒 See Plans →
                  </a>
                </div>
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
              <NotificationBell />
              <Link href="/dashboard" className="text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors px-4 py-2">
                {t('dashboard')}
              </Link>
              <Link href="/profile" className="text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors px-4 py-2">
                {t('profile')}
              </Link>
              {isAdmin && (
                <Link href="/admin" className="text-sm text-orange-700 dark:text-accent hover:text-orange-800 dark:hover:text-accent/80 transition-colors px-4 py-2">
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
            className="p-2.5 -mr-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
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
          <Link href="/pricing" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white" onClick={() => setOpen(false)}>{t('pricing')}</Link>

          <div className="pt-2 mt-1 border-t border-slate-200 dark:border-slate-800">
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              <span className="text-orange-600 dark:text-accent">✦</span> {t('aiTools')}
            </span>
            <Link href="/ai-tools/resume-builder" className="block text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white mb-2" onClick={() => setOpen(false)}>📄 {t('resumeBuilder')}</Link>
            <Link href="/ai-tools/cover-letter" className="block text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white mb-2" onClick={() => setOpen(false)}>✉️ {t('coverLetter')}</Link>
            <Link href="/ai-tools/interview-prep" className="block text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white mb-2" onClick={() => setOpen(false)}>🎤 {t('interviewPrep')}</Link>
            <Link href="/ai-tools/linkedin-optimizer" className="block text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white mb-2" onClick={() => setOpen(false)}>🔗 {t('linkedinOptimizer')}</Link>
            <Link href="/ai-tools/skill-gap" className="block text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white mb-2" onClick={() => setOpen(false)}>🧭 {t('skillGap')}</Link>
            <Link href="/ai-tools/cv-builder" className="block text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white mb-2" onClick={() => setOpen(false)}>📋 {t('cvBuilder')}</Link>
            <Link href="/auto-apply" className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white" onClick={() => setOpen(false)}>
              🤖 Auto-Apply
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">Pro Feature</span>
            </Link>
          </div>
          {userEmail ? (
            <>
              <Link href="/dashboard" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white" onClick={() => setOpen(false)}>{t('dashboard')}</Link>
              <Link href="/profile" className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white" onClick={() => setOpen(false)}>{t('profile')}</Link>
              {isAdmin && (
                <Link href="/admin" className="text-orange-700 dark:text-accent hover:text-orange-800 dark:hover:text-accent/80" onClick={() => setOpen(false)}>🛡️ {t('admin')}</Link>
              )}
              <form action={signOut}><button type="submit" className="text-start text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">{t('signOut')}</button></form>
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
