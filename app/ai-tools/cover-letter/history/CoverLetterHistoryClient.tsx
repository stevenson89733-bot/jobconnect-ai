'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Markdown } from '@/lib/docExport'
import { deleteCoverLetterDraft } from '@/app/actions/coverLetters'
import type { CoverLetterDraft } from '@/lib/coverLetters'

// History items are shown read-only (not re-loaded into the generator for
// editing) — simplest choice given the generator's state doesn't otherwise
// need to support "resume editing a past letter," and it avoids conflating
// "what the AI generated" with "what a past draft happened to contain" in
// one piece of state.
function snippet(text: string, max = 140): string {
  const trimmed = text.trim().replace(/\s+/g, ' ')
  return trimmed.length > max ? `${trimmed.slice(0, max)}…` : trimmed
}

export default function CoverLetterHistoryClient({
  initialDrafts,
  loadError,
}: {
  initialDrafts: CoverLetterDraft[]
  loadError: string
}) {
  const [drafts, setDrafts] = useState(initialDrafts)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState(loadError)

  async function handleDelete(id: string) {
    setDeletingId(id)
    setError('')
    const res = await deleteCoverLetterDraft(id)
    if (res.ok) {
      setDrafts((prev) => prev.filter((d) => d.id !== id))
      if (expandedId === id) setExpandedId(null)
    } else {
      setError(res.error)
    }
    setDeletingId(null)
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-3">
        <Link href="/candidate" className="hover:text-slate-900 dark:hover:text-white transition-colors">Dashboard</Link>
        <span>/</span>
        <Link href="/ai-tools/cover-letter" className="hover:text-slate-900 dark:hover:text-white transition-colors">AI Cover Letter Generator</Link>
        <span>/</span>
        <span className="text-slate-700 dark:text-slate-300">History</span>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">Saved Cover Letters</h1>
        <p className="text-slate-600 dark:text-slate-400">Your previously saved drafts.</p>
      </div>

      {error && <p className="text-red-600 dark:text-red-400 text-sm mb-4">{error}</p>}

      {drafts.length === 0 && !error && (
        <div className="card flex flex-col items-center justify-center py-16 text-center text-slate-600 dark:text-slate-400">
          <div className="text-4xl mb-3">📄</div>
          <p className="text-sm mb-4">No saved letters yet.</p>
          <Link href="/ai-tools/cover-letter" className="btn-primary text-sm py-2 px-4">
            Generate a Cover Letter
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {drafts.map((draft) => {
          const isExpanded = expandedId === draft.id
          return (
            <div key={draft.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : draft.id)}
                  className="flex-1 text-left"
                >
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h2 className="font-semibold text-slate-900 dark:text-white">{draft.target_role}</h2>
                    <span className="text-slate-400 dark:text-slate-600">·</span>
                    <span className="text-slate-600 dark:text-slate-400">{draft.company_name}</span>
                    <span className="inline-flex items-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full px-2 py-0.5 text-xs">
                      {draft.style}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                    {new Date(draft.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  {!isExpanded && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">{snippet(draft.letter_content.opening)}</p>
                  )}
                </button>
                <button
                  onClick={() => handleDelete(draft.id)}
                  disabled={deletingId === draft.id}
                  className="text-xs text-red-600 dark:text-red-400 hover:underline disabled:opacity-50 whitespace-nowrap"
                >
                  {deletingId === draft.id ? 'Deleting…' : 'Delete'}
                </button>
              </div>

              {isExpanded && (
                <div className="mt-4 bg-slate-50 dark:bg-slate-900 rounded-xl p-5 text-sm space-y-4">
                  <p className="text-slate-600 dark:text-slate-400 text-xs">{draft.letter_content.subject}</p>
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
                    <Markdown text={draft.letter_content.greeting} />
                    <div className="space-y-4 text-justify">
                      <Markdown text={draft.letter_content.opening} />
                      <Markdown text={draft.letter_content.body} className="space-y-3" />
                      <Markdown text={draft.letter_content.closing} />
                    </div>
                    <Markdown text={draft.letter_content.signature} className="text-slate-600 dark:text-slate-400" />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
