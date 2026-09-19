'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const NAV_ITEMS = [
  { label: 'Dashboard',        href: '/candidate',                  icon: '🏠' },
  { label: 'Browse Jobs',      href: '/jobs',                       icon: '💼' },
  { label: 'My Applications',  href: '/candidate/applications',     icon: '📋' },
  { label: 'AI Resume Builder',href: '/ai-tools/resume-builder',    icon: '🤖' },
  { label: 'My Profile',       href: '/profile',                    icon: '👤' },
]

type JobResult = { id: string; title: string; company_name: string }
type PaletteItem = { type: string; label: string; href: string; icon: string; sub?: string }

export default function CommandPalette() {
  const [open, setOpen]       = useState(false)
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState<JobResult[]>([])
  const [selected, setSelected] = useState(0)
  const router = useRouter()

  // Toggle open with Cmd/Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(o => !o)
        setQuery('')
        setResults([])
        setSelected(0)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Debounced job search
  useEffect(() => {
    if (!query || query.length < 2) { setResults([]); return }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/jobs?q=${encodeURIComponent(query)}`)
        if (res.ok) setResults(await res.json())
      } catch { /* ignore */ }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const allItems: PaletteItem[] = [
    ...NAV_ITEMS.map(n => ({ type: 'nav', label: n.label, href: n.href, icon: n.icon })),
    ...results.map(r => ({ type: 'job', label: r.title, href: `/jobs`, icon: '💼', sub: r.company_name })),
  ]

  const go = useCallback((href: string) => {
    router.push(href)
    setOpen(false)
    setQuery('')
  }, [router])

  // Arrow + Enter keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, allItems.length - 1)) }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)) }
      if (e.key === 'Enter' && allItems[selected]) go(allItems[selected].href)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, allItems, selected, go])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={() => setOpen(false)}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden mx-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <span className="text-gray-400 text-lg">🔍</span>
          <input
            autoFocus
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0) }}
            placeholder="Search jobs, go to page..."
            className="flex-1 outline-none text-sm text-gray-800 placeholder-gray-400"
          />
          <kbd className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">ESC</kbd>
        </div>

        {/* Results list */}
        <div className="max-h-80 overflow-y-auto py-2">
          {allItems.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-6">
              {query.length >= 2 ? 'No results found' : 'Type to search jobs or navigate'}
            </p>
          )}
          {allItems.map((item, i) => (
            <button
              key={`${item.type}-${item.href}-${i}`}
              onClick={() => go(item.href)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                i === selected ? 'bg-[#57C7E3]/10 text-[#57C7E3]' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-base shrink-0">{item.icon}</span>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{item.label}</div>
                {item.sub && <div className="text-xs text-gray-400 truncate">{item.sub}</div>}
              </div>
              {item.type === 'nav' && (
                <span className="ml-auto text-xs text-gray-300 shrink-0">Go to</span>
              )}
            </button>
          ))}
        </div>

        <div className="border-t border-gray-100 px-4 py-2 flex gap-4 text-xs text-gray-400">
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  )
}
