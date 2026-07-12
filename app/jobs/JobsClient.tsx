'use client'
import { useState, useEffect, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import JobCard from '@/components/jobs/JobCard'
import JobCardSkeleton from '@/components/jobs/JobCardSkeleton'
import type { SortOption } from './page'

export type Job = {
  id: string
  title: string
  company_name: string
  location: string
  salary_label: string | null
  salary_min: number | null
  job_type: string
  category: string
  tags: string[]
  description: string | null
  is_featured: boolean
  created_at: string
  company: { logo_url: string | null } | null
}

const CATEGORIES = ['All', 'Engineering', 'Design', 'Data', 'Research', 'Developer Relations', 'Content']
const JOB_TYPES = ['All', 'Full-time', 'Contract', 'Part-time']
const SORTS: { id: SortOption; label: string }[] = [
  { id: 'relevance', label: 'Relevance' },
  { id: 'date', label: 'Newest' },
  { id: 'salary', label: 'Salary' },
]

export default function JobsClient({
  jobs,
  initialQuery = '',
  initialRemote = false,
  initialJobType = 'All',
  initialCategory = 'All',
  initialSort = 'relevance',
  page = 1,
  totalPages = 1,
  total,
}: {
  jobs: Job[]
  initialQuery?: string
  initialRemote?: boolean
  initialJobType?: string
  initialCategory?: string
  initialSort?: SortOption
  page?: number
  totalPages?: number
  total?: number
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const [query, setQuery] = useState(initialQuery)
  const [remote, setRemote] = useState(initialRemote)
  const [jobType, setJobType] = useState(initialJobType)
  const [category, setCategory] = useState(initialCategory)
  const [sort, setSort] = useState<SortOption>(initialSort)

  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set())
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch('/api/applications')
      .then((r) => (r.ok ? r.json() : []))
      .then((ids: string[]) => setAppliedIds(new Set(ids)))
      .catch(() => {})
    fetch('/api/saved-jobs')
      .then((r) => (r.ok ? r.json() : []))
      .then((ids: string[]) => setSavedIds(new Set(ids)))
      .catch(() => {})
  }, [])

  function navigate(next: { q?: string; remote?: boolean; type?: string; category?: string; sort?: SortOption; page?: number }) {
    const params = new URLSearchParams()
    const q = next.q ?? query
    const r = next.remote ?? remote
    const t = next.type ?? jobType
    const c = next.category ?? category
    const s = next.sort ?? sort
    const p = next.page ?? 1 // any filter change resets to page 1; explicit page nav passes its own value

    if (q) params.set('q', q)
    if (r) params.set('remote', '1')
    if (t !== 'All') params.set('type', t)
    if (c !== 'All') params.set('category', c)
    if (s !== 'relevance') params.set('sort', s)
    if (p > 1) params.set('page', String(p))

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  async function handleToggleSave(jobId: string) {
    const wasSaved = savedIds.has(jobId)
    // Optimistic update — reverted below only if the request actually fails.
    setSavedIds((prev) => {
      const next = new Set(prev)
      wasSaved ? next.delete(jobId) : next.add(jobId)
      return next
    })
    try {
      const res = wasSaved
        ? await fetch(`/api/saved-jobs?job_id=${jobId}`, { method: 'DELETE' })
        : await fetch('/api/saved-jobs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ job_id: jobId }),
          })
      if (res.status === 401) {
        router.push('/login?redirectTo=/jobs')
        return
      }
      if (!res.ok && res.status !== 409) throw new Error('failed')
    } catch {
      setSavedIds((prev) => {
        const next = new Set(prev)
        wasSaved ? next.add(jobId) : next.delete(jobId)
        return next
      })
    }
  }

  function clearAll() {
    setQuery('')
    setRemote(false)
    setJobType('All')
    setCategory('All')
    navigate({ q: '', remote: false, type: 'All', category: 'All', page: 1 })
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Remote Jobs</h1>
        <p className="text-slate-600 dark:text-slate-400">
          {total ?? jobs.length} position{(total ?? jobs.length) === 1 ? '' : 's'}
          {query ? ` matching "${query}"` : ''}
        </p>
      </div>

      {/* ── Search + Filters ──────────────────────────────── */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search jobs, companies…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && navigate({ q: query, page: 1 })}
              className="w-full bg-white dark:bg-background border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2.5
                         text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500
                         focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            {query && (
              <button
                onClick={() => { setQuery(''); navigate({ q: '', page: 1 }) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              >
                ✕
              </button>
            )}
          </div>
          <button
            onClick={() => navigate({ q: query, page: 1 })}
            className="btn-primary text-sm px-5 py-2.5 shrink-0"
          >
            Search
          </button>
          <button
            onClick={() => { const next = !remote; setRemote(next); navigate({ remote: next, page: 1 }) }}
            className={`text-xs px-4 py-2.5 rounded-xl border transition-colors shrink-0 ${
              remote
                ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-800/50 text-green-700 dark:text-green-400'
                : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600'
            }`}
          >
            🌍 Remote only
          </button>
          <select
            value={sort}
            onChange={(e) => { const s = e.target.value as SortOption; setSort(s); navigate({ sort: s, page: 1 }) }}
            className="bg-white dark:bg-background border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5
                       text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-primary shrink-0"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>Sort: {s.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1.5 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => { setCategory(cat); navigate({ category: cat, page: 1 }) }}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  category === cat
                    ? 'bg-primary border-primary text-white'
                    : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />
          <div className="flex gap-1.5 flex-wrap">
            {JOB_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => { setJobType(type); navigate({ type, page: 1 }) }}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  jobType === type
                    ? 'bg-accent/10 dark:bg-accent/20 border-accent text-orange-700 dark:text-accent'
                    : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-slate-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Job Cards ────────────────────────────────────── */}
      {isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 text-slate-600 dark:text-slate-500">
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-medium text-slate-700 dark:text-slate-400">No jobs found</p>
          <p className="text-sm mt-1">Try different keywords or clear your filters</p>
          <button onClick={clearAll} className="mt-4 btn-outline text-xs px-4 py-2">
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isSaved={savedIds.has(job.id)}
              onToggleSave={handleToggleSave}
              alreadyApplied={appliedIds.has(job.id)}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && !isPending && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            disabled={page <= 1}
            onClick={() => navigate({ page: page - 1 })}
            className={`btn-outline text-sm px-4 py-2 ${page <= 1 ? 'pointer-events-none opacity-40' : ''}`}
          >
            ← Previous
          </button>
          <span className="text-sm text-slate-600 dark:text-slate-400">Page {page} of {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => navigate({ page: page + 1 })}
            className={`btn-outline text-sm px-4 py-2 ${page >= totalPages ? 'pointer-events-none opacity-40' : ''}`}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
