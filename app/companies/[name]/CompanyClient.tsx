'use client'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import JobCard from '@/components/jobs/JobCard'
import { companyInitials } from '@/lib/companyDisplay'
import { useJobInteractions } from '@/lib/useJobInteractions'
import type { Job } from '@/app/jobs/JobsClient'
import ReviewsSection from './ReviewsSection'
import CompanySummarySection from './CompanySummarySection'
import type { OwnReview, PublicReview } from '@/lib/reviews'
import type { CompanyProfileSummary } from '@/lib/companyProfileSummary'

export default function CompanyClient({
  name,
  logoUrl,
  website,
  jobs,
  salaryInsights,
  reviews,
  canReview,
  ownReview,
  companySummary,
}: {
  name: string
  logoUrl: string | null
  website: string | null
  jobs: Job[]
  salaryInsights: { min: number; max: number; count: number } | null
  reviews: PublicReview[]
  canReview: boolean
  ownReview: OwnReview | null
  companySummary: CompanyProfileSummary | null
}) {
  const { appliedIds, savedIds, toggleSave } = useJobInteractions(`/companies/${encodeURIComponent(name)}`)
  const isHiring = jobs.length > 0
  const t = useTranslations('companyProfile')

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
        <Link href="/jobs" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t('jobsBreadcrumb')}</Link>
        <span>/</span>
        <span className="text-slate-700 dark:text-slate-300">{name}</span>
      </div>

      {/* ── Company Overview — only real, populated fields ──── */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <Avatar className="w-16 h-16 shrink-0">
            {logoUrl && <AvatarImage src={logoUrl} alt={name} />}
            <AvatarFallback className="text-xl">{companyInitials(name)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{name}</h1>
              {/* Real computed signal from actual open position count — not
                  a separate fabricated "hiring status" field. */}
              <Badge variant={isHiring ? 'success' : 'default'}>
                {isHiring ? `● ${t('activelyHiring')}` : t('notCurrentlyHiring')}
              </Badge>
            </div>
            {website && (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline break-all"
              >
                {website}
              </a>
            )}
          </div>
        </div>
      </div>

      <CompanySummarySection name={name} summary={companySummary} />

      {/* ── Salary Insights — factual aggregation of THIS company's real
          postings only, never market-wide data ─────────────── */}
      {salaryInsights && (
        <div className="card mb-6">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-1">{t('salaryInsights')}</h2>
          <p className="text-2xl font-bold text-orange-700 dark:text-accent mb-1">
            ${Math.round(salaryInsights.min / 1000)}k – ${Math.round(salaryInsights.max / 1000)}k
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {t('salaryInsightsNote', { count: salaryInsights.count, name })}
          </p>
        </div>
      )}

      {/* ── Open Positions — same JobCard, same Save/Share/Apply/Match% ── */}
      <div>
        <h2 className="font-semibold text-slate-900 dark:text-white mb-3">
          {jobs.length > 0 ? t('openPositionsCount', { count: jobs.length }) : t('openPositions')}
        </h2>

        {jobs.length === 0 ? (
          <div className="card text-center py-12 text-slate-600 dark:text-slate-400">
            <div className="text-3xl mb-2">📭</div>
            <p className="text-sm">{t('noOpenPositions', { name })}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isSaved={savedIds.has(job.id)}
                onToggleSave={toggleSave}
                alreadyApplied={appliedIds.has(job.id)}
              />
            ))}
          </div>
        )}
      </div>

      <ReviewsSection companyName={name} reviews={reviews} canReview={canReview} ownReview={ownReview} />
    </div>
  )
}
