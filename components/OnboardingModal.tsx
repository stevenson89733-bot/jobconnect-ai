'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { completeOnboarding } from '@/app/actions/onboarding'

// ── Target countries for Step 1 ────────────────────────────────────────────
const TARGET_COUNTRIES: { code: string; flag: string; label: string }[] = [
  { code: 'US', flag: '🇺🇸', label: 'United States' },
  { code: 'GB', flag: '🇬🇧', label: 'United Kingdom' },
  { code: 'DE', flag: '🇩🇪', label: 'Germany' },
  { code: 'FR', flag: '🇫🇷', label: 'France' },
  { code: 'CA', flag: '🇨🇦', label: 'Canada' },
  { code: 'NL', flag: '🇳🇱', label: 'Netherlands' },
  { code: 'AU', flag: '🇦🇺', label: 'Australia' },
  { code: 'SG', flag: '🇸🇬', label: 'Singapore' },
  { code: 'CH', flag: '🇨🇭', label: 'Switzerland' },
  { code: 'SE', flag: '🇸🇪', label: 'Sweden' },
  { code: 'NO', flag: '🇳🇴', label: 'Norway' },
  { code: 'DK', flag: '🇩🇰', label: 'Denmark' },
  { code: 'IE', flag: '🇮🇪', label: 'Ireland' },
  { code: 'AT', flag: '🇦🇹', label: 'Austria' },
  { code: 'BE', flag: '🇧🇪', label: 'Belgium' },
  { code: 'ES', flag: '🇪🇸', label: 'Spain' },
  { code: 'PT', flag: '🇵🇹', label: 'Portugal' },
  { code: 'IT', flag: '🇮🇹', label: 'Italy' },
  { code: 'JP', flag: '🇯🇵', label: 'Japan' },
  { code: 'KR', flag: '🇰🇷', label: 'South Korea' },
  { code: 'BR', flag: '🇧🇷', label: 'Brazil' },
  { code: 'NZ', flag: '🇳🇿', label: 'New Zealand' },
  { code: 'FI', flag: '🇫🇮', label: 'Finland' },
  { code: 'LU', flag: '🇱🇺', label: 'Luxembourg' },
  { code: 'PL', flag: '🇵🇱', label: 'Poland' },
]

const JOB_CATEGORIES = [
  'Engineering',
  'Design',
  'Marketing',
  'Sales',
  'Finance',
  'Operations',
  'Other',
]

const MAX_COUNTRIES = 3

type Props = { defaultNext?: string }

export default function OnboardingModal({ defaultNext = '/candidate' }: Props) {
  const [step, setStep]                   = useState(1)
  const [countries, setCountries]         = useState<string[]>([])
  const [jobCategory, setJobCategory]     = useState('')
  const [countryOpen, setCountryOpen]     = useState(false)
  const [categoryOpen, setCategoryOpen]   = useState(false)
  const [isPending, startTransition]      = useTransition()
  const router                            = useRouter()

  function toggleCountry(code: string) {
    setCountries(prev =>
      prev.includes(code)
        ? prev.filter(c => c !== code)
        : prev.length < MAX_COUNTRIES ? [...prev, code] : prev
    )
  }

  function submitComplete(nextPath: string) {
    const fd = new FormData()
    countries.forEach(c => fd.append('target_countries', c))
    if (jobCategory) fd.set('job_category', jobCategory)
    fd.set('next', nextPath)
    startTransition(() => { completeOnboarding(fd) })
  }

  const selectedCountryLabels = countries.map(
    c => TARGET_COUNTRIES.find(t => t.code === c)
  ).filter(Boolean)

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
         style={{ background: 'rgba(16,21,42,0.85)', backdropFilter: 'blur(6px)' }}>
      <div className="bg-white dark:bg-[#161b2e] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
           style={{ border: '1px solid rgba(87,199,227,0.2)' }}>

        {/* Progress bar */}
        <div className="h-1 bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${(step / 3) * 100}%`, background: '#57C7E3' }}
          />
        </div>

        {/* Step header */}
        <div className="px-8 pt-7 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#57C7E3' }}>
              Step {step} of 3
            </span>
          </div>

          {/* ── Step 1: Target country ── */}
          {step === 1 && (
            <>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                What&apos;s your target country?
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                Pick up to {MAX_COUNTRIES} countries where you want to work. We&apos;ll show you the most relevant jobs.
              </p>

              {/* Multi-select dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCountryOpen(o => !o)}
                  className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300 hover:border-[#57C7E3] transition-colors"
                >
                  <span className="truncate">
                    {countries.length === 0
                      ? 'Select countries…'
                      : selectedCountryLabels.map(c => `${c!.flag} ${c!.label}`).join(', ')}
                  </span>
                  <svg className={`w-4 h-4 shrink-0 transition-transform ${countryOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {countryOpen && (
                  <div className="absolute z-20 mt-1 w-full max-h-60 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl py-1.5">
                    {TARGET_COUNTRIES.map(c => {
                      const selected = countries.includes(c.code)
                      const maxed = !selected && countries.length >= MAX_COUNTRIES
                      return (
                        <button
                          key={c.code}
                          type="button"
                          disabled={maxed}
                          onClick={() => toggleCountry(c.code)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                            selected
                              ? 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300'
                              : maxed
                              ? 'opacity-40 cursor-not-allowed text-slate-500 dark:text-slate-500'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span className="text-base">{c.flag}</span>
                          <span className="flex-1 text-start">{c.label}</span>
                          {selected && (
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {countries.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedCountryLabels.map(c => (
                    <span
                      key={c!.code}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
                      style={{ background: 'rgba(87,199,227,0.12)', color: '#57C7E3', border: '1px solid rgba(87,199,227,0.3)' }}
                    >
                      {c!.flag} {c!.label}
                      <button type="button" onClick={() => toggleCountry(c!.code)} className="opacity-70 hover:opacity-100 ml-0.5">×</button>
                    </span>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── Step 2: Job category ── */}
          {step === 2 && (
            <>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                What&apos;s your job category?
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                This helps us rank the most relevant roles for your profile.
              </p>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCategoryOpen(o => !o)}
                  className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300 hover:border-[#57C7E3] transition-colors"
                >
                  <span>{jobCategory || 'Select a category…'}</span>
                  <svg className={`w-4 h-4 shrink-0 transition-transform ${categoryOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {categoryOpen && (
                  <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl py-1.5">
                    {JOB_CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => { setJobCategory(cat); setCategoryOpen(false) }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                          jobCategory === cat
                            ? 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {cat}
                        {jobCategory === cat && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── Step 3: CV or profile ── */}
          {step === 3 && (
            <>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                Upload your CV or fill your profile
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                A complete profile unlocks your AI Match Score and personalised job rankings.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => submitComplete('/profile?upload=1')}
                  className="flex flex-col items-center gap-2.5 p-5 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-[#57C7E3] dark:hover:border-[#57C7E3] transition-all group text-center"
                >
                  <span className="text-3xl">📄</span>
                  <div>
                    <div className="font-semibold text-[13px] text-slate-900 dark:text-white group-hover:text-[#57C7E3] transition-colors">Upload CV</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">PDF, Word or plain text</div>
                  </div>
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => submitComplete('/profile')}
                  className="flex flex-col items-center gap-2.5 p-5 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-[#57C7E3] dark:hover:border-[#57C7E3] transition-all group text-center"
                >
                  <span className="text-3xl">✏️</span>
                  <div>
                    <div className="font-semibold text-[13px] text-slate-900 dark:text-white group-hover:text-[#57C7E3] transition-colors">Fill manually</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Step-by-step form</div>
                  </div>
                </button>
              </div>

              <button
                type="button"
                disabled={isPending}
                onClick={() => submitComplete('/candidate?registered=1')}
                className="w-full text-center text-[13px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors py-2"
              >
                Skip for now → Go to dashboard
              </button>
            </>
          )}
        </div>

        {/* Footer actions */}
        {step < 3 && (
          <div className="px-8 pb-7 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(s => Math.max(1, s - 1))}
              className={`text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors ${step === 1 ? 'invisible' : ''}`}
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setStep(s => s + 1)}
              disabled={step === 1 ? countries.length === 0 : !jobCategory}
              className="flex items-center gap-2 font-semibold text-white rounded-full px-7 py-2.5 text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: '#57C7E3' }}
            >
              {step === 2 ? 'Next →' : 'Next →'}
            </button>
          </div>
        )}

        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl"
               style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(2px)' }}>
            <svg className="animate-spin w-8 h-8" style={{ color: '#57C7E3' }} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
        )}
      </div>

      {/* Dots */}
      <div className="absolute bottom-8 flex gap-2">
        {[1, 2, 3].map(s => (
          <div
            key={s}
            className="w-2 h-2 rounded-full transition-all"
            style={{ background: s === step ? '#57C7E3' : 'rgba(255,255,255,0.3)', transform: s === step ? 'scale(1.3)' : 'scale(1)' }}
          />
        ))}
      </div>
    </div>
  )
}
