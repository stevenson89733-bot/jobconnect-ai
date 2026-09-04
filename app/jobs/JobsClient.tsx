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
  // Real GPT-4o-mini classification (lib/ai/crossBorder.ts) of whether this
  // remote posting is genuinely open worldwide. All 3 statuses render a badge
  // with distinct colours; null = not yet classified (non-remote or pre-migration).
  cross_border_status: 'yes' | 'no' | 'unclear' | null
  // Candidate-facing signals explaining the classification — 2-3 short strings.
  cross_border_signals: string[] | null
  // GPT-4o-mini geo-compliance classification — null when not yet analyzed.
  geo_analysis: {
    classification: 'true_anywhere' | 'regional_remote' | 'local_remote_only'
    has_tax_restriction: boolean
    eor_contractor_friendly: boolean
    employment_type: 'EOR' | 'Contractor' | 'Local Contract' | 'Unknown'
    confidence_score: number
    notes: string
  } | null
  created_at: string
  apply_url: string | null
  source: string | null
  matchScore: number | null
  matchDetails: Array<{ label: string; matched: boolean }> | null
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
  initialCrossBorder = false,
  initialCountry = '',
  initialTrueRemote = false,
  totalPages = 1,
  total,
}: {
  jobs: Job[]
  initialQuery?: string
  initialWorkType?: string
  initialJobType?: string
  initialCategory?: string
  initialSort?: SortOption
  initialCrossBorder?: boolean
  initialCountry?: string
  initialTrueRemote?: boolean
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
  const [crossBorder, setCrossBorder] = useState(initialCrossBorder)
  const [country, setCountry] = useState(initialCountry)
  const [trueRemote, setTrueRemote] = useState(initialTrueRemote)

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

  function navigate(next: { q?: string; workType?: string; type?: string; category?: string; sort?: SortOption; crossBorder?: boolean; country?: string; trueRemote?: boolean }) {
    const params = new URLSearchParams()
    const q = next.q ?? query
    const w = next.workType ?? workType
    const t = next.type ?? jobType
    const c = next.category ?? category
    const s = next.sort ?? sort
    const cb = next.crossBorder ?? crossBorder
    const cn = next.country !== undefined ? next.country : country
    const tr = next.trueRemote ?? trueRemote

    if (q) params.set('q', q)
    if (w !== 'All') params.set('workType', w)
    if (t !== 'All') params.set('type', t)
    if (c !== 'All') params.set('category', c)
    if (s !== 'relevance') params.set('sort', s)
    if (cb) params.set('crossBorder', '1')
    if (cn) params.set('country', cn)
    if (tr) params.set('trueRemote', '1')

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
      if (crossBorder) params.set('crossBorder', '1')
      if (country) params.set('country', country)
      if (trueRemote) params.set('trueRemote', '1')
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
  }, [loadingMore, hasMore, query, workType, jobType, category, sort, crossBorder, country, trueRemote, nextPage])

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
    setCrossBorder(false)
    setCountry('')
    setTrueRemote(false)
    navigate({ q: '', workType: 'All', type: 'All', category: 'All', crossBorder: false, country: '', trueRemote: false })
  }

  const COUNTRY_CHIPS = [
    { flag: '🌍', label: 'All',  value: '' },
    { flag: '🇺🇸', label: 'US',   value: 'USA' },
    { flag: '🇬🇧', label: 'UK',   value: 'UK' },
    { flag: '🇩🇪', label: 'DE',   value: 'Germany' },
    { flag: '🇫🇷', label: 'FR',   value: 'France' },
    { flag: '🇨🇦', label: 'CA',   value: 'Canada' },
  ]

  const SORT_LABELS: Record<SortOption, string> = {
    relevance: 'Match Score',
    date: t('sortNewest'),
    salary: t('sortSalary'),
  }

  return (
    <div className="min-h-screen" style={{ background: '#F7F9FD' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Hero Section ──────────────────────────────── */}
        <div className="rounded-2xl mb-6 overflow-hidden" style={{ background: '#10152A' }}>
          <div className="px-6 sm:px-10 py-10">
            <p className="text-[12px] font-semibold tracking-widest uppercase text-[#57C7E3] mb-3">
              Remote Jobs · AI Matched
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-1">
              Find work that travels with you.
            </h1>
            <p className="italic text-[#57C7E3] text-base mb-2">
              For the borderless professional.
            </p>
            <p className="text-slate-400 text-sm mb-6 max-w-lg">
              AI-matched remote roles from companies that understand how the world works.
            </p>

            {/* Live counter */}
            <div className="flex items-center gap-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#57C7E3] animate-pulse shrink-0" />
              <span className="text-[13px] text-slate-300 font-medium">
                {(total ?? allJobs.length).toLocaleString()} fresh matches today
              </span>
            </div>

            {/* AI Copilot search bar */}
            <div className="relative max-w-2xl">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#57C7E3] text-base select-none pointer-events-none">✦</span>
              <input
                type="text"
                placeholder="Ask the AI Copilot: Find me a remote job in Germany..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && navigate({ q: query })}
                className="w-full rounded-xl pl-10 pr-28 py-3.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#57C7E3]/50"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
              />
              {query && (
                <button
                  onClick={() => { setQuery(''); navigate({ q: '' }) }}
                  className="absolute right-24 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              )}
              <button
                onClick={() => navigate({ q: query })}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[13px] font-semibold px-4 py-2 rounded-lg transition-colors text-white"
                style={{ background: '#57C7E3' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#3ab5d1')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#57C7E3')}
              >
                {t('search')}
              </button>
            </div>
          </div>
        </div>

        {/* ── Filter bar ──────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 mb-5">
          {/* Row 1: Country chips + Sort */}
          <div className="flex items-center gap-2 flex-wrap justify-between mb-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              {COUNTRY_CHIPS.map(({ flag, label, value }) => (
                <button
                  key={label}
                  onClick={() => { setCountry(value); navigate({ country: value }) }}
                  className={`inline-flex items-center gap-1.5 text-[13px] font-medium px-3 py-1.5 rounded-full border transition-colors ${
                    country === value
                      ? 'text-white border-[#57C7E3]'
                      : 'border-slate-200 text-slate-600 hover:border-[#57C7E3]/50 hover:text-[#57C7E3] bg-transparent'
                  }`}
                  style={country === value ? { background: '#57C7E3' } : {}}
                >
                  <span>{flag}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[12px] text-slate-400 whitespace-nowrap">Sort by</span>
              <label htmlFor="job-sort" className="sr-only">{t('sortJobsBy')}</label>
              <select
                id="job-sort"
                value={sort}
                onChange={(e) => { const s = e.target.value as SortOption; setSort(s); navigate({ sort: s }) }}
                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[13px] text-slate-700 focus:outline-none focus:border-[#57C7E3] cursor-pointer"
              >
                {SORT_IDS.map((id) => (
                  <option key={id} value={id}>{SORT_LABELS[id]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Advanced chips */}
          <div className="flex flex-wrap gap-1.5">
            {WORK_TYPES.map((wt) => (
              <button
                key={wt}
                onClick={() => { setWorkType(wt); navigate({ workType: wt }) }}
                className={`text-[12px] px-3 py-1 rounded-full border transition-colors ${
                  workType === wt
                    ? 'bg-slate-800 border-slate-800 text-white'
                    : 'border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700'
                }`}
              >
                {workTypeLabel(wt)}
              </button>
            ))}
            <span className="w-px bg-slate-200 mx-0.5 self-stretch hidden sm:block" />
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => { setCategory(cat); navigate({ category: cat }) }}
                className={`text-[12px] px-3 py-1 rounded-full border transition-colors ${
                  category === cat
                    ? 'bg-slate-800 border-slate-800 text-white'
                    : 'border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700'
                }`}
              >
                {categoryLabel(cat)}
              </button>
            ))}
            <span className="w-px bg-slate-200 mx-0.5 self-stretch hidden sm:block" />
            {JOB_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => { setJobType(type); navigate({ type }) }}
                className={`text-[12px] px-3 py-1 rounded-full border transition-colors ${
                  jobType === type
                    ? 'bg-slate-800 border-slate-800 text-white'
                    : 'border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700'
                }`}
              >
                {jobTypeLabel(type)}
              </button>
            ))}
            <span className="w-px bg-slate-200 mx-0.5 self-stretch hidden sm:block" />
            <button
              onClick={() => { const next = !crossBorder; setCrossBorder(next); navigate({ crossBorder: next }) }}
              aria-pressed={crossBorder}
              className={`text-[12px] px-3 py-1 rounded-full border transition-colors ${
                crossBorder
                  ? 'bg-teal-600 border-teal-600 text-white'
                  : 'border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700'
              }`}
            >
              {t('crossBorderFilterLabel')}
            </button>
            <button
              onClick={() => { const next = !trueRemote; setTrueRemote(next); navigate({ trueRemote: next }) }}
              aria-pressed={trueRemote}
              className={`text-[12px] px-3 py-1 rounded-full border transition-colors ${
                trueRemote
                  ? 'bg-green-600 border-green-600 text-white'
                  : 'border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700'
              }`}
            >
              True Remote
            </button>
          </div>
        </div>

        {/* ── Section title ──────────────────────────── */}
        {!isPending && allJobs.length > 0 && (
          <div className="mb-5">
            <h2 className="text-[20px] font-bold" style={{ color: '#10152A' }}>Top matches for you</h2>
            <p className="text-[13px] text-slate-500 mt-0.5">
              Ranked by skill fit, location flexibility, and verified hiring signals.
            </p>
          </div>
        )}

        {/* ── Job Cards ────────────────────────────────────── */}
        {isPending ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)}
          </div>
        ) : allJobs.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <div className="text-4xl mb-3">🔍</div>
            <p className="font-medium text-slate-700">{t('noJobsFound')}</p>
            <p className="text-sm mt-1">{t('tryDifferentKeywords')}</p>
            <button onClick={clearAll} className="mt-4 btn-outline text-xs px-4 py-2">
              {t('clearAllFilters')}
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
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
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
                {Array.from({ length: 3 }).map((_, i) => <JobCardSkeleton key={i} />)}
              </div>
            )}

            {hasMore && <div ref={sentinelRef} className="h-1" />}

            {!hasMore && (
              <p className="text-center text-sm text-slate-500 py-8">
                {t('reachedEnd', { count: total ?? allJobs.length })}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
