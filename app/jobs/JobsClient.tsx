'use client'
import { useState, useEffect, useRef, useTransition, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import JobCard from '@/components/jobs/JobCard'
import JobCardSkeleton from '@/components/jobs/JobCardSkeleton'
import { useJobInteractions } from '@/lib/useJobInteractions'
import { CATEGORY_KEY, JOB_TYPE_KEY, WORK_TYPE_KEY } from '@/lib/i18n/jobLabels'
import type { SortOption } from './page'

export type Job = {
  id: string
  title: string
  company_name: string
  location: string
  work_type: string
  salary_label: string | null
  salary_min: number | null
  salary_max: number | null
  job_type: string
  category: string
  tags: string[]
  description: string | null
  is_featured: boolean
  created_at: string
  company: { logo_url: string | null } | null
  // Real overlap between the signed-in candidate's real profile skills and
  // this job's real tags (lib/jobMatching.ts) — null whenever there's
  // nothing genuine to show (logged out, no skills, or zero overlap), never
  // a fabricated default.
  matchPercent: number | null
}

// Values stay in English — these are the real filter values sent to the API
// and used in URL params, matching the DB's job_type/category columns.
// Display labels are resolved via the `jobs` namespace below.
const CATEGORIES = ['All', 'Engineering', 'Design', 'Data', 'Research', 'Developer Relations', 'Content']
const JOB_TYPES = ['All', 'Full-time', 'Contract', 'Part-time']
const WORK_TYPES = ['All', 'remote', 'hybrid', 'onsite']
const SORT_IDS: SortOption[] = ['relevance', 'date', 'salary']

export default function JobsClient({
  jobs,
  initialQuery = '',
  initialWorkType = 'All',
  initialJobType = 'All',
  initialCategory = 'All',
  initialSort = 'relevance',
  totalPages = 1,
  total,
}: {
  jobs: Job[]
  initialQuery?: string
  initialWorkType?: string
  initialJobType?: string
  initialCategory?: string
  initialSort?: SortOption
  totalPages?: number
  total?: number
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const t = useTranslations('jobs')

  function categoryLabel(cat: string) {
    if (cat === 'All') return t('categoryAll')
    return CATEGORY_KEY[cat] ? t(CATEGORY_KEY[cat]) : cat
  }
  function jobTypeLabel(type: string) {
    if (type === 'All') return t('typeAll')
    return JOB_TYPE_KEY[type] ? t(JOB_TYPE_KEY[type]) : type
  }
  function workTypeLabel(wt: string) {
    if (wt === 'All') return t('workTypeAll')
    return WORK_TYPE_KEY[wt] ? t(WORK_TYPE_KEY[wt]) : wt
  }
  function sortLabel(id: SortOption) {
    return id === 'relevance' ? t('sortRelevance') : id === 'date' ? t('sortNewest') : t('sortSalary')
  }

  const [query, setQuery] = useState(initialQuery)
  const [workType, setWorkType] = useState(initialWorkType)
  const [jobType, setJobType] = useState(initialJobType)
  const [category, setCategory] = useState(initialCategory)
  const [sort, setSort] = useState<SortOption>(initialSort)

  // Infinite scroll state — the server always renders page 1 (via the
  // `jobs` prop); this accumulates pages 2+ fetched client-side from
  // /api/jobs with the exact same filters, never mixing an unfiltered
  // loaded set with a newly-filtered one.
  const [allJobs, setAllJobs] = useState<Job[]>(jobs)
  const [nextPage, setNextPage] = useState(2)
  const [hasMore, setHasMore] = useState(totalPages > 1)
  const [loadingMore, setLoadingMore] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const { appliedIds, savedIds, toggleSave } = useJobInteractions('/jobs')

  // A fresh server render (new `jobs` prop) means the filters changed —
  // reset the accumulated infinite-scroll list to exactly that new page 1
  // rather than appending onto the stale, differently-filtered set.
  useEffect(() => {
    setAllJobs(jobs)
    setNextPage(2)
    setHasMore(totalPages > 1)
  }, [jobs, totalPages])

  function navigate(next: { q?: string; workType?: string; type?: string; category?: string; sort?: SortOption }) {
    const params = new URLSearchParams()
    const q = next.q ?? query
    const w = next.workType ?? workType
    const t = next.type ?? jobType
    const c = next.category ?? category
    const s = next.sort ?? sort

    if (q) params.set('q', q)
    if (w !== 'All') params.set('workType', w)
    if (t !== 'All') params.set('type', t)
    if (c !== 'All') params.set('category', c)
    if (s !== 'relevance') params.set('sort', s)

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const params = new URLSearchParams()
      if (query) params.set('q', query)
      if (workType !== 'All') params.set('workType', workType)
      if (jobType !== 'All') params.set('type', jobType)
      if (category !== 'All') params.set('category', category)
      if (sort !== 'relevance') params.set('sort', sort)
      params.set('page', String(nextPage))

      const res = await fetch(`/api/jobs?${params.toString()}`)
      if (!res.ok) throw new Error('failed')
      const data = await res.json()
      setAllJobs((prev) => [...prev, ...(data.jobs ?? [])])
      setNextPage((p) => p + 1)
      setHasMore(nextPage < (data.totalPages ?? 1))
    } catch {
      // Leave hasMore as-is — the sentinel will simply retry on next
      // intersection (e.g. user scrolls again) rather than getting stuck.
    } finally {
      setLoadingMore(false)
    }
  }, [loadingMore, hasMore, query, workType, jobType, category, sort, nextPage])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore()
      },
      { rootMargin: '400px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore])

  function clearAll() {
    setQuery('')
    setWorkType('All')
    setJobType('All')
    setCategory('All')
    navigate({ q: '', workType: 'All', type: 'All', category: 'All' })
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{t('title')}</h1>
        <p className="text-slate-600 dark:text-slate-400">
          {t('positionCount', { count: total ?? jobs.length })}
          {query ? t('matchingQuery', { query }) : ''}
        </p>
      </div>

      {/* ── Search + Filters ──────────────────────────────── */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && navigate({ q: query })}
              className="w-full bg-white dark:bg-background border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2.5
                         text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500
                         focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            {query && (
              <button
                onClick={() => { setQuery(''); navigate({ q: '' }) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                ✕
              </button>
            )}
          </div>
          <button
            onClick={() => navigate({ q: query })}
            className="btn-primary text-sm px-5 py-2.5 shrink-0"
          >
            {t('search')}
          </button>
          <label htmlFor="job-sort" className="sr-only">{t('sortJobsBy')}</label>
          <select
            id="job-sort"
            value={sort}
            onChange={(e) => { const s = e.target.value as SortOption; setSort(s); navigate({ sort: s }) }}
            className="bg-white dark:bg-background border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5
                       text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-primary shrink-0"
          >
            {SORT_IDS.map((id) => (
              <option key={id} value={id}>{t('sortLabel', { label: sortLabel(id) })}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1.5 flex-wrap">
            {WORK_TYPES.map((wt) => (
              <button
                key={wt}
                onClick={() => { setWorkType(wt); navigate({ workType: wt }) }}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  workType === wt
                    ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-800/50 text-green-700 dark:text-green-400'
                    : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-slate-300'
                }`}
              >
                {workTypeLabel(wt)}
              </button>
            ))}
          </div>
          <div className="w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />
          <div className="flex gap-1.5 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => { setCategory(cat); navigate({ category: cat }) }}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  category === cat
                    ? 'bg-primary border-primary text-white'
                    : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-slate-300'
                }`}
              >
                {categoryLabel(cat)}
              </button>
            ))}
          </div>
          <div className="w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />
          <div className="flex gap-1.5 flex-wrap">
            {JOB_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => { setJobType(type); navigate({ type }) }}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  jobType === type
                    ? 'bg-accent/10 dark:bg-accent/20 border-accent text-orange-700 dark:text-orange-400'
                    : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-slate-300'
                }`}
              >
                {jobTypeLabel(type)}
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
      ) : allJobs.length === 0 ? (
        <div className="text-center py-20 text-slate-600 dark:text-slate-400">
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-medium text-slate-700 dark:text-slate-400">{t('noJobsFound')}</p>
          <p className="text-sm mt-1">{t('tryDifferentKeywords')}</p>
          <button onClick={clearAll} className="mt-4 btn-outline text-xs px-4 py-2">
            {t('clearAllFilters')}
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {allJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isSaved={savedIds.has(job.id)}
                onToggleSave={toggleSave}
                alreadyApplied={appliedIds.has(job.id)}
              />
            ))}
          </div>

          {loadingMore && (
            <div className="space-y-3 mt-3">
              {Array.from({ length: 3 }).map((_, i) => <JobCardSkeleton key={i} />)}
            </div>
          )}

          {/* Sentinel — IntersectionObserver triggers loadMore() when this
              scrolls near the viewport. Invisible, not a UI element. */}
          {hasMore && <div ref={sentinelRef} className="h-1" />}

          {!hasMore && (
            <p className="text-center text-sm text-slate-600 dark:text-slate-400 py-8">
              {t('reachedEnd', { count: total ?? allJobs.length })}
            </p>
          )}
        </>
      )}
    </div>
  )
}
