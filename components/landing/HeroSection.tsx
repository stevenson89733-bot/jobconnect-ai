'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function MatchCard({ company, role, score, flag, salary }: {
  company: string; role: string; score: number; flag: string; salary: string
}) {
  const r = 22
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  return (
    <div className="bg-white/8 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-4 backdrop-blur-sm"
         style={{ background: 'rgba(255,255,255,0.06)' }}>
      <div className="relative shrink-0 w-14 h-14">
        <svg width="56" height="56" viewBox="0 0 56 56">
          <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
          <circle cx="28" cy="28" r={r} fill="none" stroke="#57C7E3" strokeWidth="4"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            transform="rotate(-90 28 28)" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[11px] font-extrabold text-white">
          {score}%
        </span>
      </div>
      <div className="min-w-0">
        <div className="text-[11px] text-slate-400 truncate">{flag} {company}</div>
        <div className="text-[13px] font-semibold text-white leading-snug truncate">{role}</div>
        <div className="text-[11px] text-slate-400 mt-0.5">{salary}</div>
      </div>
    </div>
  )
}

export default function HeroSection() {
  const t = useTranslations('hero')
  const router = useRouter()
  const [jobQuery, setJobQuery] = useState('')
  const [location, setLocation] = useState('')
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  const toggleFilter = (key: string) => {
    setActiveFilters(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (jobQuery) params.set('q', jobQuery)
    if (location) params.set('location', location)
    if (activeFilters.includes('remote')) params.set('work_type', 'Remote')
    if (activeFilters.includes('visa')) params.set('visa', '1')
    if (activeFilters.includes('ai')) params.set('ai_match', '1')
    if (activeFilters.includes('logistics')) params.set('category', 'Logistics')
    if (activeFilters.includes('supplychain')) params.set('category', 'Supply Chain')
    if (activeFilters.includes('tech')) params.set('category', 'Engineering')
    router.push(`/jobs?${params.toString()}`)
  }

  const filters = [
    { key: 'remote',      label: t('filter_remote') },
    { key: 'visa',        label: t('filter_visa') },
    { key: 'interview',   label: t('filter_interview') },
    { key: 'ai',          label: t('filter_ai') },
    { key: 'logistics',   label: '#Logistics' },
    { key: 'supplychain', label: '#SupplyChain' },
    { key: 'tech',        label: '#Tech' },
  ]

  return (
    <section style={{ background: 'linear-gradient(135deg, #0F1623 0%, #1a2a4a 60%, #0F1623 100%)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-16">

        {/* Headline */}
        <div className="text-center mb-10">
          <h1 className="font-bold text-white leading-tight tracking-tight mb-4"
              style={{ fontSize: 'clamp(2.6rem, 5.5vw, 4.5rem)' }}>
            {t('headline_1')}{' '}
            <span style={{
              background: 'linear-gradient(90deg, #57C7E3 0%, #F0663A 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              {t('headline_2')}
            </span>
            <br />
            {t('headline_3')}
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto" style={{ fontSize: '17px', lineHeight: '1.7' }}>
            {t('subline')}
          </p>
        </div>

        {/* Search box */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 mb-5 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              value={jobQuery}
              onChange={e => setJobQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder={t('input_job')}
              className="flex-1 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#57C7E3]/60 transition-colors"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            />
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder={t('input_location')}
              className="flex-1 sm:max-w-[220px] border border-white/15 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#57C7E3]/60 transition-colors"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Link
              href="/ai-tools/resume-builder"
              className="inline-flex items-center justify-center gap-2 border border-white/20 text-white text-sm font-semibold rounded-xl px-4 py-2.5 hover:bg-white/10 transition-colors whitespace-nowrap"
            >
              📄 {t('upload_cv')}
            </Link>
            <button
              onClick={handleSearch}
              className="flex-1 inline-flex items-center justify-center gap-2 text-white font-bold rounded-xl px-6 py-2.5 text-sm transition-all hover:brightness-110 hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #2E5CF6 0%, #F0663A 100%)' }}
            >
              ✦ {t('run_ai_match')}
            </button>
          </div>
        </div>

        {/* Quick filters */}
        <div className="flex flex-wrap items-center gap-2 justify-center mb-10">
          <span className="text-[12px] text-slate-500 mr-1">{t('filter_label')}</span>
          {filters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => toggleFilter(key)}
              className={`text-[12px] font-semibold px-3 py-1 rounded-full border transition-all ${
                activeFilters.includes(key)
                  ? 'bg-[#57C7E3] border-[#57C7E3] text-white'
                  : 'border-white/20 text-slate-400 hover:border-[#57C7E3]/60 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Match Score Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
          <MatchCard company="Stripe" role="Backend Engineer" score={94} flag="🇺🇸" salary="$120k – $160k" />
          <MatchCard company="Figma" role="Product Designer" score={87} flag="🇩🇪" salary="€90k – €120k" />
          <MatchCard company="Shopify" role="Growth Manager" score={81} flag="🇨🇦" salary="$95k – $130k" />
        </div>

        {/* Stat row */}
        <div className="w-full border-t border-slate-800/80 pt-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">10k+</div>
            <div className="text-xs sm:text-sm text-slate-400 mt-1">{t('stat_roles')}</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">63</div>
            <div className="text-xs sm:text-sm text-slate-400 mt-1">{t('stat_countries')}</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">11</div>
            <div className="text-xs sm:text-sm text-slate-400 mt-1">{t('stat_languages')}</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#57C7E3]">{t('stat_direct')}</div>
            <div className="text-xs sm:text-sm text-slate-400 mt-1">{t('stat_direct_sub')}</div>
          </div>
        </div>
      </div>
    </section>
  )
}
