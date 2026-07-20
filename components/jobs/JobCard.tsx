'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Bookmark, Share2, Check, Sparkles } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import ApplyModal from '@/components/ApplyModal'
import { copyToClipboard } from '@/lib/clipboard'
import { companyInitials } from '@/lib/companyDisplay'
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

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className={`card transition-shadow hover:shadow-lg dark:hover:shadow-black/20 ${
        job.is_featured ? 'border-primary/30 bg-primary/5' : ''
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Left: logo + info */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <Avatar className="w-12 h-12 shrink-0">
            {job.company?.logo_url && <AvatarImage src={job.company.logo_url} alt={job.company_name} />}
            <AvatarFallback>{companyInitials(job.company_name)}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <h2 className="font-semibold text-slate-900 dark:text-white">{job.title}</h2>
              {job.is_featured && <Badge variant="primary">{t('featured')}</Badge>}
              {job.matchPercent != null && (
                <Badge variant="success" className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" strokeWidth={2} /> {t('matchPercent', { percent: job.matchPercent })}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-2">
              <Link
                href={`/companies/${encodeURIComponent(job.company_name)}`}
                className="font-medium text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {job.company_name}
              </Link>
              {job.work_type && (
                <>
                  <span className="text-slate-400 dark:text-slate-600">·</span>
                  <span className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full inline-block ${WORK_TYPE_DOT[job.work_type] ?? WORK_TYPE_DOT.onsite}`} />
                    <span className={`text-xs font-medium ${WORK_TYPE_TEXT[job.work_type] ?? WORK_TYPE_TEXT.onsite}`}>{workTypeLabel}</span>
                  </span>
                </>
              )}
              {locationDetail && (
                <>
                  <span className="text-slate-400 dark:text-slate-600">·</span>
                  <span className="text-slate-600 dark:text-slate-400 text-xs">{locationDetail}</span>
                </>
              )}
              <span className="text-slate-400 dark:text-slate-600">·</span>
              <span className="text-slate-600 dark:text-slate-400 text-xs">{localizedTimeAgo(job.created_at, t)}</span>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-1">
              <Badge variant={TYPE_VARIANT[job.job_type] ?? 'default'}>{jobTypeLabel}</Badge>
              <Badge>{categoryLabel}</Badge>
              {job.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Right: salary + actions */}
        <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 flex-wrap">
          <span
            className={
              job.salary_label
                ? 'font-semibold text-orange-700 dark:text-accent text-sm whitespace-nowrap'
                : 'text-slate-400 dark:text-slate-600 text-xs whitespace-nowrap'
            }
          >
            {job.salary_label ? (
              <ConvertedSalary salaryMin={job.salary_min} salaryMax={job.salary_max} salaryLabel={job.salary_label} />
            ) : (
              t('salaryNotDisclosed')
            )}
          </span>

          <div className="flex items-center gap-1.5">
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

          <ApplyModal
            jobId={job.id}
            jobTitle={job.title}
            company={job.company_name}
            alreadyApplied={alreadyApplied}
          />
        </div>
      </div>

      {shareStatus === 'manual' && (
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/50">
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1.5">
            {t('shareBlocked')}
          </p>
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
