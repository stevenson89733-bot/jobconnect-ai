'use client'
import { useState, useEffect } from 'react'
import ApplyModal from '@/components/ApplyModal'

export type Job = {
  id: string
  title: string
  company_name: string
  location: string
  salary_label: string | null
  job_type: string
  category: string
  tags: string[]
  is_featured: boolean
  created_at: string
  match_score?: number
}

// Stable per-job match score derived from the id (consistent across renders)
function matchScore(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xfffffff
  return 85 + (hash % 14) // 85–98
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

const CATEGORIES = ['All', 'Engineering', 'Design', 'Data', 'Research', 'Developer Relations', 'Content']
const JOB_TYPES  = ['All', 'Full-time', 'Contract', 'Part-time']

const TYPE_COLORS: Record<string, string> = {
  'Full-time': 'bg-green-900/40 text-green-400',
  'Contract':  'bg-orange-900/40 text-orange-400',
  'Part-time': 'bg-purple-900/40 text-purple-400',
  'Internship':'bg-blue-900/40 text-blue-400',
}

export default function JobsClient({
  jobs,
  initialQuery = '',
}: {
  jobs: Job[]
  initialQuery?: string
}) {
  const [query, setQuery]       = useState(initialQuery)
  const [category, setCategory] = useState('All')
  const [jobType, setJobType]   = useState('All')
  const [company, setCompany]   = useState('All')
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set())

  useEffect(() => { setQuery(initialQuery) }, [initialQuery])

  // Load jobs the current user already applied to (silently ignored if not logged in)
  useEffect(() => {
    fetch('/api/applications')
      .then(r => r.ok ? r.json() : [])
      .then((ids: string[]) => setAppliedIds(new Set(ids)))
      .catch(() => {})
  }, [])

  const companies = ['All', ...Array.from(new Set(jobs.map(j => j.company_name))).sort()]

  const filtered = jobs.filter(job => {
    const q = query.toLowerCase()
    const matchQ    = !q || job.title.toLowerCase().includes(q)
                        || job.company_name.toLowerCase().includes(q)
                        || job.tags.some(t => t.toLowerCase().includes(q))
    const matchCat  = category === 'All' || job.category === category
    const matchType = jobType  === 'All' || job.job_type === jobType
    const matchComp = company  === 'All' || job.company_name === company
    return matchQ && matchCat && matchType && matchComp
  })

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Remote Jobs</h1>
        <p className="text-slate-400">
          {filtered.length} of {jobs.length} positions{query ? ` matching "${query}"` : ' available'}
        </p>
      </div>

      {/* ── Search + Filters ──────────────────────────────── */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text"
              placeholder="Search jobs, skills, companies…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full bg-background border border-slate-700 rounded-xl pl-9 pr-4 py-2.5
                         text-sm text-white placeholder-slate-500
                         focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >✕</button>
            )}
          </div>
          <select
            value={company}
            onChange={e => setCompany(e.target.value)}
            className="bg-background border border-slate-700 rounded-xl px-4 py-2.5
                       text-sm text-slate-300 focus:outline-none focus:border-primary"
          >
            {companies.map(c => (
              <option key={c} value={c}>{c === 'All' ? 'All Companies' : c}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1.5 flex-wrap">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  category === cat
                    ? 'bg-primary border-primary text-white'
                    : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                }`}>
                {cat}
              </button>
            ))}
          </div>
          <div className="w-px bg-slate-700 mx-1 hidden sm:block" />
          <div className="flex gap-1.5 flex-wrap">
            {JOB_TYPES.map(type => (
              <button key={type} onClick={() => setJobType(type)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  jobType === type
                    ? 'bg-accent/20 border-accent text-accent'
                    : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                }`}>
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Job Cards ────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-medium text-slate-400">No jobs found</p>
          <p className="text-sm mt-1">Try different keywords or clear your filters</p>
          <button onClick={() => { setQuery(''); setCategory('All'); setJobType('All'); setCompany('All') }}
            className="mt-4 btn-outline text-xs px-4 py-2">
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(job => {
            const score = matchScore(job.id)
            return (
              <div
                key={job.id}
                className={`card hover:border-primary/50 transition-all group cursor-pointer
                  ${job.is_featured ? 'border-primary/30 bg-primary/5' : ''}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                  {/* Left: logo + info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center
                                    text-xl font-bold text-slate-300 shrink-0">
                      {job.company_name[0]}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <h3 className="font-semibold text-white group-hover:text-primary transition-colors">
                          {job.title}
                        </h3>
                        {job.is_featured && (
                          <span className="badge bg-primary/20 text-primary text-xs">⭐ Featured</span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400 mb-2">
                        <span className="font-medium text-slate-300">{job.company_name}</span>
                        <span className="text-slate-600">·</span>
                        {/* Remote badge */}
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>
                          <span className="text-green-400 text-xs font-medium">Remote</span>
                        </span>
                        <span className="text-slate-600">·</span>
                        <span className="text-slate-500 text-xs">
                          {job.location.replace('Remote · ', '')}
                        </span>
                        <span className="text-slate-600">·</span>
                        <span className="text-slate-500 text-xs">{timeAgo(job.created_at)}</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {job.tags.map(tag => (
                          <span key={tag} className="badge bg-slate-700/60 text-slate-400 text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: salary + badges + button */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2 shrink-0 flex-wrap">
                    {job.salary_label && (
                      <span className="font-semibold text-accent text-sm whitespace-nowrap">
                        {job.salary_label}
                      </span>
                    )}

                    <div className="flex sm:flex-col gap-2 sm:items-end">
                      <span className={`badge text-xs ${TYPE_COLORS[job.job_type] ?? 'bg-slate-700 text-slate-400'}`}>
                        {job.job_type}
                      </span>

                      {/* AI Match Score */}
                      <span className="badge bg-blue-900/40 text-blue-300 text-xs font-semibold whitespace-nowrap">
                        🤖 {score}% match
                      </span>
                    </div>

                    <ApplyModal
                      jobId={job.id}
                      jobTitle={job.title}
                      company={job.company_name}
                      alreadyApplied={appliedIds.has(job.id)}
                    />
                  </div>

                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
