'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Bookmark, Share2, Check, Sparkles, ChevronDown, ExternalLink } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import ApplyModal from '@/components/ApplyModal'
import { copyToClipboard } from '@/lib/clipboard'
import { companyInitials, clearbitLogoUrl } from '@/lib/companyDisplay'
import { JOB_TYPE_KEY, CATEGORY_KEY, WORK_TYPE_KEY } from '@/lib/i18n/jobLabels'
import Link from 'next/link'
import type { Job } from '@/app/jobs/JobsClient'
import ConvertedSalary from '@/components/jobs/ConvertedSalary'
import { getGeoBadge, getEmploymentBadge, GEO_BADGE_CONFIG, EMPLOYMENT_BADGE_CONFIG } from '@/lib/geoBadge'

const TYPE_VARIANT: Record<string, 'success' | 'accent' | 'primary' | 'default'> = {
  'Full-time': 'success',
  Contract: 'accent',
  'Part-time': 'primary',
  Internship: 'default',
}

const WORK_TYPE_DOT: Record<string, string> = {
  remote: 'bg-green-500 dark:bg-green-400',
  hybrid: 'bg-amber-500 dark:bg-amber-400',
  onsite: 'bg-slate-400 dark:bg-slate-500',
}
const WORK_TYPE_TEXT: Record<string, string> = {
  remote: 'text-green-700 dark:text-green-400',
  hybrid: 'text-amber-700 dark:text-amber-400',
  onsite: 'text-slate-600 dark:text-slate-400',
}

function localizedTimeAgo(dateStr: string, t: ReturnType<typeof useTranslations<'jobs'>>) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (days === 0) return t('today')
  if (days < 7) return t('daysAgo', { count: days })
  return t('weeksAgo', { count: Math.floor(days / 7) })
}

// Cross-border: icon-only button with native tooltip + dropdown signals on click.
// Amber dropped — unclear is neutral/informational, green = confirmed open.
const CB_ICON_COLOR: Record<'yes' | 'no' | 'unclear', string> = {
  yes: 'text-green-600 dark:text-green-400',
  unclear: 'text-slate-400 dark:text-slate-500',
  no: 'text-slate-400 dark:text-slate-500',
}

function CrossBorderIcon({
  status,
  signals,
  open,
  onToggle,
  t,
}: {
  status: 'yes' | 'no' | 'unclear'
  signals: string[] | null
  open: boolean
  onToggle: () => void
  t: ReturnType<typeof useTranslations<'jobs'>>
}) {
  const hasSignals = signals && signals.length > 0
  const label = status === 'yes' ? t('crossBorderYes') : status === 'unclear' ? t('crossBorderUnclear') : t('crossBorderNo')
  return (
    <span className="relative inline-flex flex-col items-start">
      <button
        type="button"
        title={label}
        aria-label={label}
        aria-expanded={open}
        onClick={(e) => { e.stopPropagation(); if (hasSignals) onToggle() }}
        className={`inline-flex items-center gap-0.5 text-[13px] leading-none ${CB_ICON_COLOR[status]} ${hasSignals ? 'cursor-pointer' : 'cursor-default'}`}
      >
        🌍
        {hasSignals && (
          <ChevronDown className={`w-2.5 h-2.5 transition-transform ${open ? 'rotate-180' : ''}`} strokeWidth={2.5} />
        )}
      </button>
      <AnimatePresence>
        {open && hasSignals && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full left-0 z-20 mt-1 w-52 overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-2 space-y-1"
            onClick={(e) => e.stopPropagation()}
          >
            {signals!.map((s, i) => (
              <li key={i} className="text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                <span className="mt-1 shrink-0 w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-500 inline-block" />
                {s}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </span>
  )
}

const MAX_VISIBLE_TAGS = 3

export default function JobCard({
  job,
  isSaved,
  onToggleSave,
  alreadyApplied,
}: {
  job: Job
  isSaved: boolean
  onToggleSave: (jobId: string) => void
  alreadyApplied: boolean
}) {
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'manual'>('idle')
  const [shareUrl, setShareUrl] = useState('')
  const [signalsOpen, setSignalsOpen] = useState(false)
  const t = useTranslations('jobs')

  const locationDetail = job.location.replace(/^remote\s*·?\s*/i, '').trim()
  const workTypeKey = WORK_TYPE_KEY[job.work_type]
  const workTypeLabel = workTypeKey ? t(workTypeKey) : job.work_type
  const jobTypeKey = JOB_TYPE_KEY[job.job_type]
  const jobTypeLabel = jobTypeKey ? t(jobTypeKey) : job.job_type
  const categoryKey = CATEGORY_KEY[job.category]
  const categoryLabel = categoryKey ? t(categoryKey) : job.category

  const visibleTags = job.tags.slice(0, MAX_VISIBLE_TAGS)
  const extraTagCount = job.tags.length - MAX_VISIBLE_TAGS

  async function handleShare() {
    const url = `${window.location.origin}/jobs?job=${job.id}`
    const res = await copyToClipboard(url)
    if (res.ok) {
      setShareStatus('copied')
      setTimeout(() => setShareStatus('idle'), 2000)
    } else {
      setShareUrl(url)
      setShareStatus('manual')
    }
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className={`bg-white dark:bg-slate-800/70 rounded-xl border shadow-sm hover:shadow-md dark:hover:shadow-black/25 transition-shadow px-4 py-3 ${
        job.is_featured
          ? 'border-primary/25 bg-primarySoft/40 dark:bg-primary/5 dark:border-primary/20'
          : 'border-slate-200/80 dark:border-slate-700/40'
      }`}
    >
      {/* ── Line 1: logo · title · salary · badges · save/share ── */}
      <div className="flex items-center gap-2.5 min-w-0">
        <Avatar className="w-9 h-9 shrink-0 rounded-lg">
          <AvatarImage
            src={job.company?.logo_url ?? clearbitLogoUrl(job.company_name) ?? undefined}
            alt={job.company_name}
          />
          <AvatarFallback className="rounded-lg text-xs">{companyInitials(job.company_name)}</AvatarFallback>
        </Avatar>

        <h2 className="font-bold text-[15px] text-slate-900 dark:text-white leading-snug flex-1 min-w-0">
          {job.title}
        </h2>

        {job.is_featured && (
          <Badge variant="primary" className="shrink-0">{t('featured')}</Badge>
        )}
        {job.matchScore != null && job.matchScore >= 40 && (
          <span className="relative group shrink-0">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold cursor-default select-none whitespace-nowrap ${
              job.matchScore >= 80
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-800/50'
                : job.matchScore >= 60
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-800/50'
                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800/50'
            }`}>
              <Sparkles className="w-2.5 h-2.5" strokeWidth={2} />
              {job.matchScore >= 80 ? 'Excellent' : job.matchScore >= 60 ? 'Good match' : 'Partial'} · {job.matchScore}%
            </span>
            {job.matchDetails && job.matchDetails.length > 0 && (
              <span className="pointer-events-none absolute bottom-full left-0 z-30 mb-2 w-44 hidden group-hover:block bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-2.5 space-y-1.5">
                {job.matchDetails.map((d, i) => (
                  <span key={i} className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                    <span className={`shrink-0 ${d.matched ? 'text-green-500 dark:text-green-400' : 'text-slate-300 dark:text-slate-600'}`}>
                      {d.matched ? '✓' : '·'}
                    </span>
                    {d.label}
                  </span>
                ))}
              </span>
            )}
          </span>
        )}

        {/* Salary — most important trust signal, anchored right on line 1 */}
        {job.salary_label ? (
          <span className="shrink-0 inline-flex items-center bg-primarySoft dark:bg-primary/15 text-primary dark:text-blue-400 font-bold text-[11px] px-2 py-0.5 rounded-md whitespace-nowrap">
            <ConvertedSalary salaryMin={job.salary_min} salaryMax={job.salary_max} salaryLabel={job.salary_label} />
          </span>
        ) : (
          <span className="shrink-0 text-[11px] text-slate-400 dark:text-slate-600 whitespace-nowrap">{t('salaryNotDisclosed')}</span>
        )}

        {/* Save + Share */}
        <div className="flex items-center shrink-0 -mr-1">
          <Button
            variant="ghost"
            size="sm"
            aria-label={isSaved ? t('unsaveJob') : t('saveJob')}
            onClick={() => onToggleSave(job.id)}
            className="!px-1.5 !py-1 h-auto min-h-[44px] md:min-h-0"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current text-primary' : 'text-slate-400'}`} strokeWidth={1.75} />
          </Button>
          <Button variant="ghost" size="sm" aria-label={t('shareJob')} onClick={handleShare} className="!px-1.5 !py-1 h-auto min-h-[44px] md:min-h-0">
            {shareStatus === 'copied'
              ? <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
              : <Share2 className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.75} />}
          </Button>
        </div>
      </div>

      {/* ── Line 2: company · meta · badges · tags · cross-border · apply ── */}
      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 mt-1.5 min-w-0">
        <Link
          href={`/companies/${encodeURIComponent(job.company_name)}`}
          className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors whitespace-nowrap"
          onClick={(e) => e.stopPropagation()}
        >
          {job.company_name}
        </Link>

        {job.work_type && (
          <>
            <span className="text-slate-300 dark:text-slate-600 text-[10px]">·</span>
            <span className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${WORK_TYPE_DOT[job.work_type] ?? WORK_TYPE_DOT.onsite}`} />
              <span className={`text-[11px] font-medium whitespace-nowrap ${WORK_TYPE_TEXT[job.work_type] ?? WORK_TYPE_TEXT.onsite}`}>{workTypeLabel}</span>
            </span>
          </>
        )}

        {locationDetail && (
          <>
            <span className="text-slate-300 dark:text-slate-600 text-[10px]">·</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap max-w-[120px] truncate">{locationDetail}</span>
          </>
        )}

        <span className="text-slate-300 dark:text-slate-600 text-[10px]">·</span>
        <span className="text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap">{localizedTimeAgo(job.created_at, t)}</span>

        {/* Contract type + category */}
        <Badge variant={TYPE_VARIANT[job.job_type] ?? 'default'} className="shrink-0">{jobTypeLabel}</Badge>
        <Badge className="shrink-0">{categoryLabel}</Badge>

        {/* Tags inline */}
        {visibleTags.map((tag) => (
          <Badge key={tag} className="shrink-0">{tag}</Badge>
        ))}
        {extraTagCount > 0 && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium text-slate-400 dark:text-slate-500 border border-dashed border-slate-300 dark:border-slate-600 whitespace-nowrap">
            +{extraTagCount}
          </span>
        )}

        {/* Cross-border: icon only, tooltip + dropdown */}
        {job.cross_border_status != null && (
          <CrossBorderIcon
            status={job.cross_border_status}
            signals={job.cross_border_signals}
            open={signalsOpen}
            onToggle={() => setSignalsOpen((o) => !o)}
            t={t}
          />
        )}

        {/* Source badge — only for aggregated listings */}
        {job.source && job.source !== 'direct' && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600/50 whitespace-nowrap shrink-0">
            {job.source === 'remotive' ? 'Remotive'
              : job.source === 'wwr' ? 'WWR'
              : job.source === 'arbeitnow' ? 'Arbeitnow'
              : job.source === 'adzuna_gb' ? 'Adzuna UK'
              : job.source === 'adzuna_au' ? 'Adzuna AU'
              : job.source === 'adzuna_fr' ? 'Adzuna FR'
              : job.source === 'adzuna_de' ? 'Adzuna DE'
              : job.source === 'adzuna_ca' ? 'Adzuna CA'
              : job.source === 'adzuna_nl' ? 'Adzuna NL'
              : job.source}
          </span>
        )}

        {/* Geo-compliance badges — only shown when confidence_score >= 0.7 */}
        {(() => {
          const classBadge = getGeoBadge(job.geo_analysis)
          const empBadge = getEmploymentBadge(job.geo_analysis, classBadge)
          if (!classBadge) return null
          const cc = GEO_BADGE_CONFIG[classBadge]
          return (
            <>
              <span title={cc.tooltip} className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap shrink-0 cursor-default ${cc.className}`}>
                {cc.label}
              </span>
              {empBadge && (() => {
                const ec = EMPLOYMENT_BADGE_CONFIG[empBadge]
                return (
                  <span title={ec.tooltip} className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-800/50 whitespace-nowrap shrink-0 cursor-default">
                    {ec.label}
                  </span>
                )
              })()}
            </>
          )
        })()}

        {/* Apply — pushed to end */}
        <span className="ml-auto shrink-0">
          {job.apply_url ? (
            <a
              href={`/api/redirect?job=${encodeURIComponent(job.id)}&source=${encodeURIComponent(job.source ?? 'direct')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 bg-primary text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors min-h-[44px] md:min-h-0"
            >
              {t('applyNow')}
              <ExternalLink className="w-3 h-3" strokeWidth={2} />
            </a>
          ) : (
            <ApplyModal
              jobId={job.id}
              jobTitle={job.title}
              company={job.company_name}
              alreadyApplied={alreadyApplied}
            />
          )}
        </span>
      </div>

      {shareStatus === 'manual' && (
        <div className="mt-2.5 pt-2.5 border-t border-slate-200 dark:border-slate-700/50">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">{t('shareBlocked')}</p>
          <input
            readOnly
            value={shareUrl}
            onFocus={(e) => e.currentTarget.select()}
            ref={(el) => el?.focus()}
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white"
          />
        </div>
      )}
    </motion.div>
  )
}
