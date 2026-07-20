'use client'
import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { COUNTRIES } from '@/lib/countries'
import { useCountry } from './CountryProvider'

// Visually mirrors LanguageSwitcher — same dropdown pattern — but fully
// independent state (country cookie, not the locale cookie). Selecting a
// country only changes displayed salary currency on job postings; it never
// filters which jobs are shown.
export default function CountrySelector() {
  const { country, setCountry } = useCountry()
  const t = useTranslations('nav')
  const tc = useTranslations('countries')
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

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={t('country')}
        aria-expanded={open}
        className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors px-2 py-2 rounded-lg border border-slate-300 dark:border-slate-700"
      >
        <span>{current.flag}</span>
        <svg className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 max-h-80 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-card shadow-lg dark:shadow-black/40 p-1.5 z-50">
          {COUNTRIES.map((c) => (
            <button
              key={c.code}
              onClick={() => { setCountry(c.code); setOpen(false) }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                c.code === country
                  ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-blue-400 font-medium'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{c.flag}</span>
              <span className="flex-1">{tc(c.code)}</span>
              <span className="text-xs text-slate-500 dark:text-slate-500">{c.currency}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
