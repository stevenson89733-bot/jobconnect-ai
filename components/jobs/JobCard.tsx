'use client'
import { useEffect, useId, useRef, useState } from 'react'
import JobDetailModal from './JobDetailModal'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Bookmark, ExternalLink, ChevronDown } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import AiApplyModal from '@/components/jobs/AiApplyModal'
import { companyInitials, clearbitLogoUrl } from '@/lib/companyDisplay'
import { CATEGORY_KEY, JOB_TYPE_KEY } from '@/lib/i18n/jobLabels'
import Link from 'next/link'
import type { Job } from '@/app/jobs/JobsClient'
import ConvertedSalary from '@/components/jobs/ConvertedSalary'
import { getGeoBadge, getEmploymentBadge, GEO_BADGE_CONFIG, EMPLOYMENT_BADGE_CONFIG } from '@/lib/geoBadge'
import { matchScoreColor } from '@/lib/jobScoring'

// Only 'yes' and 'unclear' get a badge — 'no' and null are silent
// For 'yes': filled ✅ when confidence is 'high', outlined ◻ when 'medium', plain otherwise
const REMOTE_BADGE: Partial<Record<'yes' | 'no' | 'unclear', { label: string; className: string }>> = {
  yes:     { label: '✅ Cross-border Friendly', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  unclear: { label: '⚠ Unclear',               className: 'bg-amber-50 text-amber-700 border-amber-200' },
}

function getCrossBorderLabel(status: 'yes' | 'no' | 'unclear' | null, confidence?: 'low' | 'medium' | 'high' | null): string {
  if (status !== 'yes') return REMOTE_BADGE[status as 'unclear']?.label ?? ''
  if (confidence === 'high') return '✅ Cross-border Friendly'
  if (confidence === 'medium') return '◻ Cross-border Friendly'
  return '✅ Cross-border Friendly'
}

function getCrossBorderClass(status: 'yes' | 'no' | 'unclear' | null, confidence?: 'low' | 'medium' | 'high' | null): string {
  if (status !== 'yes') return REMOTE_BADGE[status as 'unclear']?.className ?? ''
  if (confidence === 'high') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (confidence === 'medium') return 'bg-amber-50 text-amber-700 border-amber-300'
  return 'bg-emerald-50 text-emerald-700 border-emerald-200'
}

const COUNTRY_FLAGS: [RegExp, string][] = [
  [/united states|usa|\bUS\b/i,        '🇺🇸'],
  [/united kingdom|\bUK\b|\bGB\b/i,    '🇬🇧'],
  [/germany|deutschland/i,             '🇩🇪'],
  [/france/i,                          '🇫🇷'],
  [/canada/i,                          '🇨🇦'],
  [/australia/i,                       '🇦🇺'],
  [/netherlands|nederland/i,           '🇳🇱'],
  [/worldwide|global|anywhere/i,       '🌍'],
]

function getFlag(location: string) {
  for (const [re, flag] of COUNTRY_FLAGS) {
    if (re.test(location)) return flag
  }
  return null
}

function timeAgo(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (days === 0) return 'today'
  if (days < 7) return `${days}d ago`
  return `${Math.floor(days / 7)}w ago`
}

const JOB_TYPE_COLOR: Record<string, string> = {
  'Full-time': 'bg-green-50 text-green-700 border-green-200',
  'Contract':  'bg-orange-50 text-orange-700 border-orange-200',
  'Part-time': 'bg-sky-50 text-sky-700 border-sky-200',
  'Internship': 'bg-purple-50 text-purple-700 border-purple-200',
}

export default function JobCard({
  job,
  isSaved,
  onToggleSave,
  alreadyApplied,
  onSelect,
  profileComplete,
}: {
  job: Job
  isSaved: boolean
  onToggleSave: (jobId: string) => void
  alreadyApplied: boolean
  onSelect?: (job: Job) => void
  profileComplete?: boolean
}) {
  const [signalsOpen, setSignalsOpen] = useState(false)
  // Tooltip explaining the "⚠ Unclear" cross-border badge (that badge only).
  // Hover/focus opens it on desktop; tap toggles it on touch screens; a tap
  // outside or Escape closes it.
  const [unclearTipOpen, setUnclearTipOpen] = useState(false)
  const unclearTipRef = useRef<HTMLSpanElement>(null)
  const unclearTipId = useId()
  // Last pointer used on the badge: a mouse click shouldn't toggle (hover
  // already handles it), a touch tap should.
  const unclearTipPointer = useRef<string>('mouse')
  useEffect(() => {
    if (!unclearTipOpen) return
    const close = (e: PointerEvent) => {
      if (!unclearTipRef.current?.contains(e.target as Node)) setUnclearTipOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [unclearTipOpen])
  const [showModal, setShowModal] = useState(false)
  const [matchOpen, setMatchOpen] = useState(false)
  const [matchData, setMatchData] = useState<{ strengths: string[]; gaps: string[] } | null>(null)
  const [matchLoading, setMatchLoading] = useState(false)
  const [referralNudge, setReferralNudge] = useState(false)
  const t = useTranslations('jobs')
  const tRef = useTranslations('referral')

  const showMatchSection = profileComplete && job.matchScore != null && job.matchScore >= 30

  async function handleMatchExpand() {
    if (matchData) { setMatchOpen(o => !o); return }
    setMatchOpen(true)
    setMatchLoading(true)
    try {
      const res = await fetch('/api/ai/match-explanation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: job.id, match_score: job.matchScore }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.strengths || data.gaps) {
          setMatchData({ strengths: data.strengths ?? [], gaps: data.gaps ?? [] })
          // Server returns true only on the user's very first AI Job Match.
          if (data.referralPrompt === true) setReferralNudge(true)
        } else {
          setMatchOpen(false)
        }
      } else {
        setMatchOpen(false)
      }
    } catch {
      setMatchOpen(false)
    } finally {
      setMatchLoading(false)
    }
  }

  const flag = getFlag(job.location)
  const locationClean = job.location.replace(/^remote\s*[·\-]?\s*/i, '').trim()
  const categoryKey = CATEGORY_KEY[job.category]
  const categoryLabel = categoryKey ? t(categoryKey) : job.category
  const jobTypeKey = JOB_TYPE_KEY[job.job_type]
  const jobTypeLabel = jobTypeKey ? t(jobTypeKey) : job.job_type

  const remoteBadge = job.cross_border_status && job.cross_border_status !== 'no'
    ? {
        label: getCrossBorderLabel(job.cross_border_status, job.cross_border_confidence),
        className: getCrossBorderClass(job.cross_border_status, job.cross_border_confidence),
      }
    : null
  const classBadge = getGeoBadge(job.geo_analysis)
  const empBadge = getEmploymentBadge(job.geo_analysis, classBadge)

  const borderAccent =
    job.cross_border_status === 'yes' ? '#22c55e' :
    job.cross_border_status === 'unclear' ? '#f97316' :
    job.is_featured ? '#57C7E3' : undefined

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => onSelect?.(job)}
      className={`bg-white dark:bg-card rounded-[12px] border shadow-sm hover:shadow-lg transition-all duration-200 p-4 flex flex-col gap-3 ${onSelect ? 'cursor-pointer' : ''} ${
        job.is_featured ? 'border-[#57C7E3]/40' : 'border-slate-200 dark:border-slate-700/50'
      }`}
      style={borderAccent ? { borderLeftWidth: 3, borderLeftColor: borderAccent } : undefined}
    >
      {/* Row 1 — Logo · Company · Sector | Remote badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="w-10 h-10 shrink-0 rounded-full border border-slate-100">
            <AvatarImage
              src={job.company?.logo_url ?? clearbitLogoUrl(job.company_name) ?? undefined}
              alt={job.company_name}
            />
            <AvatarFallback className="rounded-full text-sm font-semibold bg-slate-100 text-slate-600">
              {companyInitials(job.company_name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <button
              type="button"
              className="text-[13px] font-semibold text-slate-700 hover:text-[#57C7E3] transition-colors truncate block text-left"
              onClick={(e) => { e.stopPropagation(); setShowModal(true) }}
            >
              {job.company_name}
            </button>
            <span className="text-[12px] text-slate-400">{categoryLabel}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {job.is_featured && (
            <span className="text-[10px] font-semibold bg-[#57C7E3]/10 text-[#57C7E3] border border-[#57C7E3]/30 px-1.5 py-0.5 rounded-full whitespace-nowrap">
              ⭐ Featured
            </span>
          )}
          {remoteBadge && job.cross_border_status === 'unclear' && (
            <span ref={unclearTipRef} className="relative inline-flex">
              <button
                type="button"
                aria-label={`${remoteBadge.label}. ${t('crossBorderUnclearTooltip')}`}
                aria-describedby={unclearTipId}
                aria-expanded={unclearTipOpen}
                onPointerEnter={(e) => { if (e.pointerType === 'mouse') setUnclearTipOpen(true) }}
                onPointerLeave={(e) => { if (e.pointerType === 'mouse') setUnclearTipOpen(false) }}
                onPointerDown={(e) => { unclearTipPointer.current = e.pointerType }}
                onFocus={(e) => { if (e.currentTarget.matches(':focus-visible')) setUnclearTipOpen(true) }}
                onBlur={() => setUnclearTipOpen(false)}
                onKeyDown={(e) => { if (e.key === 'Escape') setUnclearTipOpen(false) }}
                onClick={(e) => {
                  e.stopPropagation()
                  // Touch tap or keyboard Enter/Space (detail 0) toggles; mouse uses hover.
                  if (e.detail === 0 || unclearTipPointer.current !== 'mouse') setUnclearTipOpen(o => !o)
                  if (Array.isArray(job.cross_border_signals) && (job.cross_border_signals as string[]).length) setSignalsOpen(o => !o)
                }}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap cursor-help ${remoteBadge.className}`}
              >
                {remoteBadge.label}
              </button>
              <span
                id={unclearTipId}
                role="tooltip"
                className={`absolute end-0 top-full mt-1.5 z-20 w-60 rounded-lg bg-slate-900 dark:bg-slate-800 px-3 py-2 text-[11px] leading-snug font-normal text-white shadow-lg whitespace-normal ${unclearTipOpen ? 'block' : 'hidden'}`}
              >
                {t('crossBorderUnclearTooltip')}
              </span>
            </span>
          )}
          {remoteBadge && job.cross_border_status !== 'unclear' && (
            <button
              type="button"
              title={job.cross_border_status === 'yes' ? t('crossBorderYes') : t('crossBorderNo')}
              onClick={(e) => { e.stopPropagation(); if (Array.isArray(job.cross_border_signals) && (job.cross_border_signals as string[]).length) setSignalsOpen(o => !o) }}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap ${remoteBadge.className} ${Array.isArray(job.cross_border_signals) && (job.cross_border_signals as string[]).length ? 'cursor-pointer' : 'cursor-default'}`}
            >
              {remoteBadge.label}
            </button>
          )}
        </div>
      </div>

      {/* Row 2 — Job title */}
      <h2
        className="font-bold text-[18px] leading-snug cursor-pointer hover:text-[#57C7E3] transition-colors"
        style={{ color: '#10152A' }}
        onClick={(e) => { e.stopPropagation(); setShowModal(true) }}
      >
        {job.title}
      </h2>

      {/* Row 3 — Match pill + job type */}
      <div className="flex items-center gap-2 flex-wrap">
        {job.matchScore != null && job.matchScore >= 30 && (() => {
          const mc = matchScoreColor(job.matchScore)
          return (
            <span className={`inline-flex items-center gap-1.5 ${mc.bg} ${mc.text} border ${mc.border} text-[12px] font-semibold px-3 py-1 rounded-full`}>
              ✦ {job.matchScore}% match
            </span>
          )
        })()}
        {job.job_type && (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap ${JOB_TYPE_COLOR[job.job_type] ?? 'bg-slate-50 text-slate-600 border-slate-200'}`}>
            {jobTypeLabel}
          </span>
        )}
        {showMatchSection && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleMatchExpand() }}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#57C7E3] hover:text-[#3ab5d1] transition-colors"
          >
            {t('matchExpandCta')}
            <ChevronDown className={`w-3 h-3 transition-transform ${matchOpen ? 'rotate-180' : ''}`} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* Match explanation — collapsible, only on user expand */}
      <AnimatePresence>
        {matchOpen && showMatchSection && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 space-y-2">
              {matchLoading ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                </div>
              ) : matchData && (
                <>
                  {matchData.strengths.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600 mb-1">{t('matchStrengths')}</p>
                      <ul className="space-y-1">
                        {matchData.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                            <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {matchData.gaps.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-orange-500 mb-1">{t('matchGaps')}</p>
                      <ul className="space-y-1">
                        {matchData.gaps.map((g, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                            <span className="text-orange-400 mt-0.5 shrink-0">⚠</span>
                            {g}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {referralNudge && (
                    <p className="pt-1 text-[11px] text-slate-600 dark:text-slate-400">
                      {tRef('nudge')}{' '}
                      <Link href="/candidate/referrals" className="font-semibold text-primary hover:underline">
                        {tRef('nudgeCta')}
                      </Link>
                    </p>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Row 4 — Salary · Flag · Location · Geo badges */}
      <div className="flex items-center gap-2 text-[13px] text-slate-500 flex-wrap">
        {job.salary_label ? (
          <span className="font-semibold text-slate-700">
            <ConvertedSalary salaryMin={job.salary_min} salaryMax={job.salary_max} salaryLabel={job.salary_label} />
          </span>
        ) : (
          <span className="text-slate-400 text-[12px]">Salary undisclosed</span>
        )}
        {(flag || locationClean) && <span className="text-slate-300">·</span>}
        {flag && <span>{flag}</span>}
        {locationClean && <span className="truncate max-w-[160px] text-[12px]">{locationClean}</span>}
        {classBadge && (() => {
          const cc = GEO_BADGE_CONFIG[classBadge]
          return (
            <>
              <span className="text-slate-300">·</span>
              <span title={cc.tooltip} className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap cursor-default ${cc.className}`}>
                {cc.label}
              </span>
              {empBadge && (() => {
                const ec = EMPLOYMENT_BADGE_CONFIG[empBadge]
                return (
                  <span title={ec.tooltip} className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap cursor-default">
                    {ec.label}
                  </span>
                )
              })()}
            </>
          )
        })()}
      </div>

      {/* Cross-border signals dropdown (legacy flat array) */}
      <AnimatePresence>
        {signalsOpen && Array.isArray(job.cross_border_signals) && !('positive' in (job.cross_border_signals as object)) && (job.cross_border_signals as string[]).length > 0 && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden bg-slate-50 border border-slate-200 rounded-lg p-2 space-y-1"
          >
            {(job.cross_border_signals as string[]).map((s, i) => (
              <li key={i} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                <span className="mt-1 w-1 h-1 rounded-full bg-slate-400 shrink-0 inline-block" />
                {s}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {/* Pourquoi tu matches — only for cross-border jobs with structured signals */}
      {(() => {
        if (!job.is_cross_border) return null
        if (!profileComplete) return null
        const s = job.cross_border_signals
        if (!s || Array.isArray(s) || (!s.positive?.length && !s.warnings?.length)) return null
        const positive = s.positive.slice(0, 3)
        const warnings = s.warnings.slice(0, 2)
        if (!positive.length && !warnings.length) return null
        return (
          <div className="pt-1">
            <p className="text-[12px] font-semibold mb-1.5" style={{ color: '#57C7E3' }}>Pourquoi tu matches</p>
            <div className="flex flex-wrap gap-1">
              {positive.map((label) => (
                <span key={label} className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: '#f97316' }}>
                  {label}
                </span>
              ))}
              {warnings.map((label) => (
                <span key={label} className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: '#F59E0B' }}>
                  ⚠ {label}
                </span>
              ))}
            </div>
          </div>
        )
      })()}

      {/* Row 5 — Apply · Save · Time */}
      <div className="flex items-center gap-2 pt-1" onClick={e => e.stopPropagation()}>
        {job.apply_url ? (
          <>
            <a
              href={`/api/redirect?job=${encodeURIComponent(job.id)}&source=${encodeURIComponent(job.source ?? 'direct')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#57C7E3] text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-[#3ab5d1] transition-colors"
            >
              Apply now
              <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
            </a>
            <AiApplyModal
              jobId={job.id}
              jobTitle={job.title}
              company={job.company_name}
              description={job.description}
              tags={job.tags}
              applyUrl={job.apply_url}
              alreadyApplied={alreadyApplied}
            />
          </>
        ) : (
          <AiApplyModal
            jobId={job.id}
            jobTitle={job.title}
            company={job.company_name}
            description={job.description}
            tags={job.tags}
            alreadyApplied={alreadyApplied}
          />
        )}

        <button
          type="button"
          aria-label={isSaved ? t('unsaveJob') : t('saveJob')}
          onClick={() => onToggleSave(job.id)}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <Bookmark
            className={`w-4 h-4 ${isSaved ? 'fill-current text-[#57C7E3]' : 'text-slate-400'}`}
            strokeWidth={1.75}
          />
        </button>

        <span className="ml-auto text-[12px] text-slate-400">{timeAgo(job.created_at)}</span>
      </div>

      <JobDetailModal job={job} isOpen={showModal} onClose={() => setShowModal(false)} />
    </motion.div>
  )
}
