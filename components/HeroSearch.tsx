'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const POPULAR = ['AI Engineer', 'Product Designer', 'Full Stack Dev', 'Data Scientist']

export default function HeroSearch() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    router.push(q ? `/jobs?q=${encodeURIComponent(q)}` : '/jobs')
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Job title, skills, or company…"
            className="w-full bg-card border border-slate-700 rounded-xl pl-11 pr-4 py-4
                       text-white placeholder-slate-500
                       focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>
        <button
          type="submit"
          className="bg-primary hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl transition-colors whitespace-nowrap"
        >
          Search Jobs
        </button>
      </form>

      <p className="text-sm text-slate-500">
        Popular:{' '}
        {POPULAR.map(t => (
          <Link
            key={t}
            href={`/jobs?q=${encodeURIComponent(t)}`}
            className="text-slate-400 hover:text-primary transition-colors mr-3 underline underline-offset-2"
          >
            {t}
          </Link>
        ))}
      </p>
    </>
  )
}
