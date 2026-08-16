'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Bookmark, Share2, Check, Sparkles, ChevronDown } from 'lucide-react'
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

const TYPE_VARIANT: Record<string, 'success' | 'accent' | 'primary' | 'default'> = {
  'Full-time': 'success',
  Contract: 'accent',
  'Part-time': 'primary',
  Internship: 'default',
}

// Distinct color per work type — Remote keeps the pre-existing green dot
// styling; Hybrid/On-site get their own colors to stay visually distinct.
const WORK_TYPE_DOT: Record<string, string> = {
  remote: 'bg-green-500 dark:bg-green-400',
  hybrid: 'bg-amber-500 dark:bg-amber-400',
  onsite: 'bg-slate-500 dark:bg-slate-400',
}
const WORK_TYPE_TEXT: Record<string, string> = {
  remote: 'text-green-700 dark:text-green-400',
  hybrid: 'text-amber-700 dark:text-amber-400',
  onsite: 'text-slate-700 dark:text-slate-400',
}

// Same day/week thresholds as lib/timeAgo.ts's 'compact' style, but using
// the `jobs` namespace's translated strings — kept local to this component
// rather than changing lib/timeAgo.ts's signature, since its other call
// sites (recruiter dashboard, application status) are still English-only
// in this lot.
function localizedTimeAgo(dateStr: string, t: ReturnType<typeof useTranslations<'jobs'>>) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (days === 0) return t('today')
  if (days < 7) return t('daysAgo', { count: days })
  return t('weeksAgo', { count: Math.floor(days / 7) })
}

const CB_CONFIG = {
  yes: {
    label: (t: ReturnType<typeof useTranslations<'jobs'>>) => t('crossBorderYes'),
    badgeClass: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800',
  },
  // Neutral slate — amber read as a warning which misled candidates into
  // thinking the listing was problematic. "Unclear" is informational only.
  unclear: {
    label: (t: ReturnType<typeof useTranslations<'jobs'>>) => t('crossBorderUnclear'),
    badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700',
  },
  no: {
    label: (t: ReturnType<typeof useTranslations<'jobs'>>) => t('crossBorderNo'),
    badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700',
  },
} as const

const MAX_VISIBLE_TAGS = 4

function CrossBorderBadge({
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
  const cfg = CB_CONFIG[status]
  const hasSignals = signals && signals.length > 0
  return (
    <span className="inline-flex flex-col items-start gap-0.5">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); if (hasSignals) onToggle() }}
        className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${cfg.badgeClass} ${hasSignals ? 'cursor-pointer' : 'cursor-default'}`}
        aria-expanded={open}
      >
        🌍 {cfg.label(t)}
        {hasSignals && (
          <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} strokeWidth={2.5} />
        )}
      </button>
      <AnimatePresence>
        {open && hasSignals && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="overflow-hidden mt-0.5 ml-1 space-y-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            {signals!.map((s, i) => (
              <li key={i} className="text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-1">
                <span className="mt-0.5 shrink-0 w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 inline-block" />
                {s}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </span>
  )
}

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

  // Real structured field set by the employer at posting time — no longer
  // inferred from location text.
  const locationDetail = job.location.replace(/^remote\s*·?\s*/i, '').trim()
  const workTypeKey = WORK_TYPE_KEY[job.work_type]
  const workTypeLabel = workTypeKey ? t(workTypeKey) : job.work_type

  const jobTypeKey = JOB_TYPE_KEY[job.job_type]
  const jobTypeLabel = jobTypeKey ? t(jobTypeKey) : job.job_type
  const categoryKey = CATEGORY_KEY[job.category]
  const categoryLabel = categoryKey ? t(categoryKey) : job.category

  async function handleShare() {
    const url = `${window.location.origin}/jobs?job=${job.id}`
    const res = await copyToClipboard(url)
    if (res.ok) {
      setShareStatus('copied')
      setTimeout(() => setShareStatus('idle'), 2000)
    } else {
      // Both copy tiers failed — same manual select-and-copy fallback as
      // the Cover Letter's Copy button, not a fragile window.prompt().
      setShareUrl(url)
      setShareStatus('manual')
    }
  }

  const visibleTags = job.tags.slice(0, MAX_VISIBLE_TAGS)
  const extraTagCount = job.tags.length - MAX_VISIBLE_TAGS

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className={`card transition-shadow hover:shadow-md dark:hover:shadow-black/30 ${
        job.is_featured ? 'border-primary/30 bg-primary/5' : ''
      }`}
    >
      {/* ── Top row: logo + title block + save/share ── */}
      <div className="flex items-start gap-3">
        <Avatar className="w-12 h-12 shrink-0 rounded-xl">
          <AvatarImage
            src={job.company?.logo_url ?? clearbitLogoUrl(job.company_name) ?? undefined}
            alt={job.company_name}
          />
          <AvatarFallback className="rounded-xl">{companyInitials(job.company_name)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          {/* Title — larger + bolder for stronger visual hierarchy */}
          <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">{job.title}</h2>
            {job.is_featured && <Badge variant="primary">{t('featured')}</Badge>}
            {job.matchPercent != null && (
              <Badge variant="success" className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" strokeWidth={2} /> {t('matchPercent', { percent: job.matchPercent })}
              </Badge>
            )}
          </div>

          {/* Company + work type + location + time */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Link
              href={`/companies/${encodeURIComponent(job.company_name)}`}
              className="font-semibold text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {job.company_name}
            </Link>
            {job.work_type && (
              <>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <span className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full inline-block shrink-0 ${WORK_TYPE_DOT[job.work_type] ?? WORK_TYPE_DOT.onsite}`} />
                  <span className={`font-medium ${WORK_TYPE_TEXT[job.work_type] ?? WORK_TYPE_TEXT.onsite}`}>{workTypeLabel}</span>
                </span>
              </>
            )}
            {locationDetail && (
              <>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <span>{locationDetail}</span>
              </>
            )}
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span>{localizedTimeAgo(job.created_at, t)}</span>
          </div>
        </div>

        {/* Save + share — top-right, compact */}
        <div className="flex items-center gap-0.5 shrink-0 -mt-0.5">
          <Button
            variant="ghost"
            size="sm"
            aria-label={isSaved ? t('unsaveJob') : t('saveJob')}
            onClick={() => onToggleSave(job.id)}
            className="!px-2"
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current text-primary' : ''}`} strokeWidth={1.75} />
          </Button>
          <Button variant="ghost" size="sm" aria-label={t('shareJob')} onClick={handleShare} className="!px-2">
            {shareStatus === 'copied' ? <Check className="w-4 h-4 text-green-700 dark:text-green-400" /> : <Share2 className="w-4 h-4" strokeWidth={1.75} />}
          </Button>
        </div>
      </div>

      {/* ── Salary chip + type/category/cross-border badges ── */}
      <div className="flex flex-wrap items-center gap-1.5 mt-3">
        {job.salary_label ? (
          <span className="inline-flex items-center gap-1 bg-primarySoft dark:bg-primary/15 text-primary dark:text-blue-400 font-bold text-xs px-2.5 py-1 rounded-md whitespace-nowrap">
            <ConvertedSalary salaryMin={job.salary_min} salaryMax={job.salary_max} salaryLabel={job.salary_label} />
          </span>
        ) : (
          <span className="text-slate-400 dark:text-slate-600 text-xs">{t('salaryNotDisclosed')}</span>
        )}
        <Badge variant={TYPE_VARIANT[job.job_type] ?? 'default'}>{jobTypeLabel}</Badge>
        <Badge>{categoryLabel}</Badge>
        {job.cross_border_status != null && (
          <CrossBorderBadge
            status={job.cross_border_status}
            signals={job.cross_border_signals}
            open={signalsOpen}
            onToggle={() => setSignalsOpen((o) => !o)}
            t={t}
          />
        )}
      </div>

      {/* ── Tags: max 4 visible + overflow pill ── */}
      {job.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {visibleTags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
          {extraTagCount > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-slate-400 dark:text-slate-500 border border-dashed border-slate-300 dark:border-slate-600">
              +{extraTagCount}
            </span>
          )}
        </div>
      )}

      {/* ── Footer: divider + Apply ── */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-end">
        <ApplyModal
          jobId={job.id}
          jobTitle={job.title}
          company={job.company_name}
          alreadyApplied={alreadyApplied}
        />
      </div>

      {shareStatus === 'manual' && (
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/50">
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1.5">{t('shareBlocked')}</p>
          <input
            readOnly
            value={shareUrl}
            onFocus={(e) => e.currentTarget.select()}
            ref={(el) => el?.focus()}
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white"
          />
        </div>
      )}
    </motion.div>
  )
}
