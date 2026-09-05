'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Bookmark, ExternalLink } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import AiApplyModal from '@/components/jobs/AiApplyModal'
import { companyInitials, clearbitLogoUrl } from '@/lib/companyDisplay'
import { CATEGORY_KEY, JOB_TYPE_KEY } from '@/lib/i18n/jobLabels'
import Link from 'next/link'
import type { Job } from '@/app/jobs/JobsClient'
import ConvertedSalary from '@/components/jobs/ConvertedSalary'
import { getGeoBadge, getEmploymentBadge, GEO_BADGE_CONFIG, EMPLOYMENT_BADGE_CONFIG } from '@/lib/geoBadge'

const REMOTE_BADGE: Record<'yes' | 'no' | 'unclear', { label: string; className: string }> = {
  yes:    { label: '✓ Likely',   className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  unclear: { label: '⚠ Unclear', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  no:     { label: '✗ Unlikely', className: 'bg-red-50 text-red-600 border-red-200' },
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
}: {
  job: Job
  isSaved: boolean
  onToggleSave: (jobId: string) => void
  alreadyApplied: boolean
}) {
  const [signalsOpen, setSignalsOpen] = useState(false)
  const t = useTranslations('jobs')

  const flag = getFlag(job.location)
  const locationClean = job.location.replace(/^remote\s*[·\-]?\s*/i, '').trim()
  const categoryKey = CATEGORY_KEY[job.category]
  const categoryLabel = categoryKey ? t(categoryKey) : job.category
  const jobTypeKey = JOB_TYPE_KEY[job.job_type]
  const jobTypeLabel = jobTypeKey ? t(jobTypeKey) : job.job_type

  const remoteBadge = job.cross_border_status ? REMOTE_BADGE[job.cross_border_status] : null
  const classBadge = getGeoBadge(job.geo_analysis)
  const empBadge = getEmploymentBadge(job.geo_analysis, classBadge)

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col gap-3 ${
        job.is_featured ? 'border-[#57C7E3]/40' : 'border-slate-200'
      }`}
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
            <Link
              href={`/companies/${encodeURIComponent(job.company_name)}`}
              className="text-[13px] font-semibold text-slate-700 hover:text-[#57C7E3] transition-colors truncate block"
              onClick={(e) => e.stopPropagation()}
            >
              {job.company_name}
            </Link>
            <span className="text-[12px] text-slate-400">{categoryLabel}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {job.is_featured && (
            <span className="text-[10px] font-semibold bg-[#57C7E3]/10 text-[#57C7E3] border border-[#57C7E3]/30 px-1.5 py-0.5 rounded-full whitespace-nowrap">
              ⭐ Featured
            </span>
          )}
          {remoteBadge && (
            <button
              type="button"
              title={job.cross_border_status === 'yes' ? t('crossBorderYes') : job.cross_border_status === 'unclear' ? t('crossBorderUnclear') : t('crossBorderNo')}
              onClick={(e) => { e.stopPropagation(); if (job.cross_border_signals?.length) setSignalsOpen(o => !o) }}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap ${remoteBadge.className} ${job.cross_border_signals?.length ? 'cursor-pointer' : 'cursor-default'}`}
            >
              {remoteBadge.label}
            </button>
          )}
        </div>
      </div>

      {/* Row 2 — Job title */}
      <h2 className="font-bold text-[18px] leading-snug" style={{ color: '#10152A' }}>
        {job.title}
      </h2>

      {/* Row 3 — Match pill + job type */}
      <div className="flex items-center gap-2 flex-wrap">
        {job.matchScore != null && job.matchScore >= 40 && (
          <span className="inline-flex items-center gap-1.5 bg-[#57C7E3]/10 text-[#57C7E3] border border-[#57C7E3]/30 text-[12px] font-semibold px-3 py-1 rounded-full">
            ✦ {job.matchScore}% match · AI ranked
          </span>
        )}
        {job.job_type && (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap ${JOB_TYPE_COLOR[job.job_type] ?? 'bg-slate-50 text-slate-600 border-slate-200'}`}>
            {jobTypeLabel}
          </span>
        )}
      </div>

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

      {/* Cross-border signals dropdown */}
      <AnimatePresence>
        {signalsOpen && job.cross_border_signals && job.cross_border_signals.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden bg-slate-50 border border-slate-200 rounded-lg p-2 space-y-1"
          >
            {job.cross_border_signals.map((s, i) => (
              <li key={i} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                <span className="mt-1 w-1 h-1 rounded-full bg-slate-400 shrink-0 inline-block" />
                {s}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {/* Row 5 — Apply · Save · Time */}
      <div className="flex items-center gap-2 pt-1">
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
              alreadyApplied={alreadyApplied}
            />
          </>
        ) : (
          <AiApplyModal
            jobId={job.id}
            jobTitle={job.title}
            company={job.company_name}
            description={job.description}
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
    </motion.div>
  )
}
