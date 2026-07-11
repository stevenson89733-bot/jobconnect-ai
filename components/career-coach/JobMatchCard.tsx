import Link from 'next/link'
import SkillTag from './SkillTag'
import type { MatchedJob } from '@/lib/jobMatching'

// Real job data only — pulled directly from the jobs table (see
// lib/jobMatching.ts). Never populated from the LLM response.
export default function JobMatchCard({ job }: { job: MatchedJob }) {
  return (
    <Link
      href="/jobs"
      className="rounded-lg border border-slate-200 dark:border-slate-700/50 p-4 hover:border-primary/50 transition-colors block"
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="font-semibold text-sm text-slate-900 dark:text-white">{job.title}</h3>
        {job.salary_label && (
          <span className="text-xs font-semibold text-orange-700 dark:text-accent whitespace-nowrap">{job.salary_label}</span>
        )}
      </div>
      <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">{job.company_name} · {job.location}</p>
      <div className="flex flex-wrap gap-1.5">
        {job.matchedTags.map((tag) => <SkillTag key={tag} label={tag} variant="primary" />)}
      </div>
    </Link>
  )
}
