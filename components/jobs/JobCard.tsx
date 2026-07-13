'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bookmark, Share2, Check, Sparkles } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import ApplyModal from '@/components/ApplyModal'
import { copyToClipboard } from '@/lib/clipboard'
import type { Job } from '@/app/jobs/JobsClient'

const TYPE_VARIANT: Record<string, 'success' | 'accent' | 'primary' | 'default'> = {
  'Full-time': 'success',
  Contract: 'accent',
  'Part-time': 'primary',
  Internship: 'default',
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return '1d ago'
  if (days < 7) return `${days}d ago`
  if (days < 14) return '1w ago'
  return `${Math.floor(days / 7)}w ago`
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || name[0]?.toUpperCase() || '?'
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

  // Derived directly from the job's own real location text — never
  // inferred from company name or industry.
  const isRemote = /^remote/i.test(job.location)
  const locationDetail = job.location.replace(/^remote\s*·?\s*/i, '').trim()

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
            <AvatarFallback>{initials(job.company_name)}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <h3 className="font-semibold text-slate-900 dark:text-white">{job.title}</h3>
              {job.is_featured && <Badge variant="primary">⭐ Featured</Badge>}
              {job.matchPercent != null && (
                <Badge variant="success" className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" strokeWidth={2} /> {job.matchPercent}% Match
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-2">
              <span className="font-medium text-slate-700 dark:text-slate-300">{job.company_name}</span>
              {isRemote && (
                <>
                  <span className="text-slate-400 dark:text-slate-600">·</span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400 inline-block" />
                    <span className="text-green-600 dark:text-green-400 text-xs font-medium">Remote</span>
                  </span>
                </>
              )}
              {locationDetail && (
                <>
                  <span className="text-slate-400 dark:text-slate-600">·</span>
                  <span className="text-slate-600 dark:text-slate-500 text-xs">{locationDetail}</span>
                </>
              )}
              <span className="text-slate-400 dark:text-slate-600">·</span>
              <span className="text-slate-600 dark:text-slate-500 text-xs">{timeAgo(job.created_at)}</span>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-1">
              <Badge variant={TYPE_VARIANT[job.job_type] ?? 'default'}>{job.job_type}</Badge>
              <Badge>{job.category}</Badge>
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
            {job.salary_label || 'Salary not disclosed'}
          </span>

          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              aria-label={isSaved ? 'Unsave job' : 'Save job'}
              onClick={() => onToggleSave(job.id)}
              className="!px-2"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current text-primary' : ''}`} strokeWidth={1.75} />
            </Button>
            <Button variant="ghost" size="sm" aria-label="Share job" onClick={handleShare} className="!px-2">
              {shareStatus === 'copied' ? <Check className="w-4 h-4 text-green-600 dark:text-green-400" /> : <Share2 className="w-4 h-4" strokeWidth={1.75} />}
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
            Your browser blocked automatic copying — select the link below and press Cmd/Ctrl+C.
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
