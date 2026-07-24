'use client'
import { useState, useRef, useEffect, useMemo } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { COUNTRIES, countryFlag } from '@/lib/countries'
import { useCountry } from './CountryProvider'

// Visually mirrors LanguageSwitcher — same dropdown pattern — but fully
// independent state (country cookie, not the locale cookie). Selecting a
// country only changes displayed salary currency on job postings (derived
// from the country via getCountry(), see lib/countries.ts) — it never
// touches the interface language and never filters which jobs are shown.
export default function CountrySelector() {
  const { country, setCountry } = useCountry()
  const t = useTranslations('nav')
  const tc = useTranslations('countries')
  const locale = useLocale()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const current = COUNTRIES.find((c) => c.code === country) ?? COUNTRIES[0]

  // Sorted by each country's name in the current display language, not a
  // fixed English order — so the dropdown reads alphabetically regardless
  // of which of the 7 locales the user is browsing in.
  const sorted = useMemo(
    () => [...COUNTRIES].sort((a, b) => tc(a.code).localeCompare(tc(b.code), locale)),
    [tc, locale]
  )

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={t('country')}
        aria-expanded={open}
        className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors px-2 py-2 rounded-lg border border-slate-300 dark:border-slate-700"
      >
        <span>{countryFlag(current.code)}</span>
        <svg className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 max-h-80 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-card shadow-lg dark:shadow-black/40 p-1.5 z-50">
          {sorted.map((c) => (
            <button
              key={c.code}
              onClick={() => { setCountry(c.code); setOpen(false) }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                c.code === country
                  ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-blue-400 font-medium'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{countryFlag(c.code)}</span>
              <span className="flex-1">{tc(c.code)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
