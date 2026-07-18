'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { SUPPORTED_LOCALES, LOCALE_LABELS, LOCALE_COOKIE, type Locale } from '@/lib/i18n/config'

// Persists the choice to a cookie (same pattern as ThemeToggle's `theme`
// cookie) then refreshes so Server Components re-render with the new
// locale's messages — client components under NextIntlClientProvider pick
// up the new messages automatically since they're passed down from the
// (re-rendered) root layout.
export default function LanguageSwitcher() {
  const locale = useLocale() as Locale
  const t = useTranslations('nav')
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function selectLocale(next: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`
    setOpen(false)
    router.refresh()
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={t('language')}
        aria-expanded={open}
        className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors px-2 py-2 rounded-lg border border-slate-300 dark:border-slate-700"
      >
        <span className="uppercase font-medium">{locale}</span>
        <svg className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-card shadow-lg dark:shadow-black/40 p-1.5 z-50">
          {SUPPORTED_LOCALES.map((code) => (
            <button
              key={code}
              onClick={() => selectLocale(code)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                code === locale
                  ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-blue-400 font-medium'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {LOCALE_LABELS[code]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
