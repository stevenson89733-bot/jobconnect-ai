'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface JobResult {
  id: string
  title: string
  company_name: string | null
  location: string | null
  source: string | null
}

interface NavItem {
  type: 'nav'
  label: string
  href: string
  icon: string
}

interface JobItem {
  type: 'job'
  job: JobResult
}

type ResultItem = NavItem | JobItem

const NAV_LINKS: NavItem[] = [
  { type: 'nav', label: 'Go to Dashboard', href: '/dashboard', icon: '🏠' },
  { type: 'nav', label: 'Go to Jobs', href: '/jobs', icon: '💼' },
  { type: 'nav', label: 'Go to Profile', href: '/profile', icon: '👤' },
  { type: 'nav', label: 'Go to AI Tools', href: '/ai-tools', icon: '🤖' },
]

const RECENT_SEARCHES_KEY = 'cmdpalette_recent_searches'
const MAX_RECENT = 5

function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function saveRecentSearch(q: string) {
  try {
    const prev = getRecentSearches()
    const next = [q, ...prev.filter((s) => s !== q)].slice(0, MAX_RECENT)
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next))
  } catch {
    // ignore
  }
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [jobs, setJobs] = useState<JobResult[]>([])
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()

  // Build flat result list
  const results: ResultItem[] = query.trim()
    ? [
        ...NAV_LINKS.filter((n) =>
          n.label.toLowerCase().includes(query.toLowerCase())
        ),
        ...jobs.map((j): JobItem => ({ type: 'job', job: j })),
      ]
    : NAV_LINKS

  const openPalette = useCallback(() => {
    setOpen(true)
    setQuery('')
    setJobs([])
    setActiveIndex(0)
    setRecentSearches(getRecentSearches())
  }, [])

  const closePalette = useCallback(() => {
    setOpen(false)
    setQuery('')
    setJobs([])
  }, [])

  // Global keyboard listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC')
      const modKey = isMac ? e.metaKey : e.ctrlKey
      if (modKey && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => {
          if (prev) {
            return false
          }
          setQuery('')
          setJobs([])
          setActiveIndex(0)
          setRecentSearches(getRecentSearches())
          return true
        })
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const q = query.trim()
    if (!q || q.length < 2) {
      setJobs([])
      setLoading(false)
      return
    }
    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/jobs?q=${encodeURIComponent(q)}`)
        const data = await res.json() as { jobs?: JobResult[] }
        setJobs(data.jobs ?? [])
      } catch {
        setJobs([])
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(0)
  }, [results.length, query])

  const navigateTo = useCallback(
    (item: ResultItem) => {
      if (item.type === 'nav') {
        if (query.trim()) saveRecentSearch(query.trim())
        router.push(item.href)
        closePalette()
      } else {
        if (query.trim()) saveRecentSearch(query.trim())
        router.push(`/jobs/${item.job.id}`)
        closePalette()
      }
    },
    [query, router, closePalette]
  )

  // Keyboard navigation inside palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closePalette()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      if (results[activeIndex]) navigateTo(results[activeIndex])
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Search command palette"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closePalette}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-[600px] mx-4 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <svg
            className="w-5 h-5 text-slate-400 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search jobs, companies, AI tools..."
            className="flex-1 bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 text-base outline-none"
          />
          {loading && (
            <svg
              className="w-4 h-4 text-slate-400 animate-spin flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4l3-3-3-3V0a12 12 0 100 24v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
              />
            </svg>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-600">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto">
          {/* Recent searches (shown on empty query) */}
          {!query.trim() && recentSearches.length > 0 && (
            <div>
              <div className="px-4 pt-3 pb-1 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Recent
              </div>
              {recentSearches.map((s) => (
                <button
                  key={s}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
                  onClick={() => setQuery(s)}
                >
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {s}
                </button>
              ))}
              <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
            </div>
          )}

          {/* Quick nav */}
          {results.filter((r) => r.type === 'nav').length > 0 && (
            <div>
              <div className="px-4 pt-3 pb-1 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Navigation
              </div>
              {results
                .map((r, i) => ({ r, i }))
                .filter(({ r }) => r.type === 'nav')
                .map(({ r, i }) => {
                  const nav = r as NavItem
                  return (
                    <button
                      key={nav.href}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                        activeIndex === i
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                      onClick={() => navigateTo(nav)}
                      onMouseEnter={() => setActiveIndex(i)}
                    >
                      <span className="text-base">{nav.icon}</span>
                      <span>{nav.label}</span>
                      <svg
                        className="w-4 h-4 ml-auto text-slate-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )
                })}
            </div>
          )}

          {/* Job results */}
          {results.filter((r) => r.type === 'job').length > 0 && (
            <div>
              <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
              <div className="px-4 pt-2 pb-1 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Jobs
              </div>
              {results
                .map((r, i) => ({ r, i }))
                .filter(({ r }) => r.type === 'job')
                .map(({ r, i }) => {
                  const { job } = r as JobItem
                  return (
                    <button
                      key={job.id}
                      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${
                        activeIndex === i
                          ? 'bg-indigo-50 dark:bg-indigo-900/30'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                      onClick={() => navigateTo(r)}
                      onMouseEnter={() => setActiveIndex(i)}
                    >
                      <span className="text-base mt-0.5">💼</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                          {job.title}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {[job.company_name, job.location].filter(Boolean).join(' · ')}
                        </div>
                      </div>
                      <svg
                        className="w-4 h-4 flex-shrink-0 text-slate-400 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )
                })}
            </div>
          )}

          {/* Empty state */}
          {query.trim().length >= 2 && !loading && results.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
              No results for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-2 flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-600">↑↓</kbd>
            navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-600">↵</kbd>
            open
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-600">Esc</kbd>
            close
          </span>
        </div>
      </div>
    </div>
  )
}
