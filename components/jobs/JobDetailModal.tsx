'use client'

import { useEffect, useRef } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { companyInitials, clearbitLogoUrl } from '@/lib/companyDisplay'
import ConvertedSalary from '@/components/jobs/ConvertedSalary'
import Link from 'next/link'
import { ExternalLink, X } from 'lucide-react'
import type { Job } from '@/app/jobs/JobsClient'
import ProLockButton from '@/components/ui/ProLockButton'

interface Props {
  job: Job
  isOpen?: boolean
  onClose: () => void
  alreadyApplied?: boolean
}

function formatDescription(text: string | null) {
  if (!text) return null
  return text.split(/\n+/).map((para, i) => (
    <p key={i} className="mb-3 last:mb-0 text-slate-700 text-sm leading-relaxed">{para}</p>
  ))
}

export default function JobDetailModal({ job, isOpen = true, onClose, alreadyApplied }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const sourceName = job.source
    ? job.source.charAt(0).toUpperCase() + job.source.slice(1)
    : 'external site'

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[85vh] flex flex-col sm:rounded-2xl rounded-none sm:max-h-[85vh] max-h-full">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>

        {/* Scrollable content */}
        <div className="overflow-y-auto p-6 flex flex-col gap-5">
          {/* Header — logo + company + title */}
          <div className="flex items-start gap-4 pr-8">
            <Avatar className="w-14 h-14 shrink-0 rounded-xl border border-slate-100">
              <AvatarImage
                src={job.company?.logo_url ?? clearbitLogoUrl(job.company_name) ?? undefined}
                alt={job.company_name}
              />
              <AvatarFallback className="rounded-xl text-base font-bold bg-slate-100 text-slate-600">
                {companyInitials(job.company_name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-500">{job.company_name}</p>
              <h2 className="text-xl font-bold text-[#10152A] leading-snug mt-0.5">{job.title}</h2>
            </div>
          </div>

          {/* Meta row — location, work type, job type */}
          <div className="flex flex-wrap gap-2 text-sm text-slate-600">
            {job.location && (
              <span className="flex items-center gap-1">
                <span>📍</span>
                <span>{job.location}</span>
              </span>
            )}
            {job.work_type && (
              <span className="flex items-center gap-1 border-l border-slate-200 pl-2">
                <span>💼</span>
                <span>{job.work_type}</span>
              </span>
            )}
            {job.job_type && (
              <span className="flex items-center gap-1 border-l border-slate-200 pl-2">
                <span>🕐</span>
                <span>{job.job_type}</span>
              </span>
            )}
          </div>

          {/* Salary */}
          <div className="text-sm font-semibold text-slate-700">
            {job.salary_label ? (
              <span className="flex items-center gap-1.5">
                <span>💰</span>
                <ConvertedSalary salaryMin={job.salary_min} salaryMax={job.salary_max} salaryLabel={job.salary_label} />
              </span>
            ) : (
              <span className="text-slate-400">💰 Salary undisclosed</span>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {job.cross_border_status === 'yes' && (
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-3 py-1 rounded-full">
                ✅ Cross-border Friendly
              </span>
            )}
            {job.cross_border_status === 'unclear' && (
              <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold px-3 py-1 rounded-full">
                ⚠ Cross-border Unclear
              </span>
            )}
            {job.is_featured && (
              <span className="inline-flex items-center gap-1.5 bg-[#57C7E3]/10 text-[#57C7E3] border border-[#57C7E3]/30 text-xs font-semibold px-3 py-1 rounded-full">
                ⭐ Featured
              </span>
            )}
            {job.matchScore != null && job.matchScore >= 40 && (
              <span className="inline-flex items-center gap-1.5 bg-[#57C7E3]/10 text-[#57C7E3] border border-[#57C7E3]/30 text-xs font-semibold px-3 py-1 rounded-full">
                ✦ {job.matchScore}% AI match
              </span>
            )}
            {job.source && (
              <span className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-500 border border-slate-200 text-xs px-3 py-1 rounded-full">
                Via {sourceName}
              </span>
            )}
          </div>

          {/* Description */}
          {job.description ? (
            <div className="border-t border-slate-100 pt-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Job Description</h3>
              <div className="prose-sm max-w-none">
                {formatDescription(job.description)}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">No description available.</p>
          )}
        </div>

        {/* Sticky action bar */}
        <div className="shrink-0 border-t border-slate-100 px-6 py-4 flex gap-3 flex-wrap">
          <ProLockButton label="Unlock with Pro" size="md" />
          {job.apply_url ? (
            <a
              href={`/api/redirect?job=${encodeURIComponent(job.id)}&source=${encodeURIComponent(job.source ?? 'direct')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors"
              style={{ background: '#F0663A' }}
            >
              Apply Now →
              <ExternalLink className="w-4 h-4" strokeWidth={2} />
            </a>
          ) : (
            <span className="flex-1 text-center text-sm text-gray-400 italic py-2.5">Application link not available</span>
          )}
          <Link
            href="/ai-tools/auto-apply"
            className="flex-1 inline-flex items-center justify-center gap-2 border-2 border-[#57C7E3] text-[#57C7E3] font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-[#57C7E3]/10 transition-colors"
          >
            ✦ Apply with AI
          </Link>
        </div>
      </div>
    </div>
  )
}
