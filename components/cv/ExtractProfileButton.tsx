'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ExtractProfileButton({ cvUrl, isPremium }: { cvUrl: string | null; isPremium: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  async function handleExtract() {
    setLoading(true)
    setToast(null)
    try {
      const res = await fetch('/api/cv/extract-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv_url: cvUrl }),
      })
      const data = await res.json()
      if (data.success) {
        setToast({ type: 'success', message: 'Profil mis à jour à partir de ton CV !' })
        router.refresh()
      } else {
        setToast({ type: 'error', message: 'Impossible d’analyser le CV. Réessaie.' })
      }
    } catch {
      setToast({ type: 'error', message: 'Impossible d’analyser le CV. Réessaie.' })
    } finally {
      setLoading(false)
    }
  }

  // Free plan → lock button always visible, links to pricing
  if (!isPremium) {
    return (
      <Link
        href="/pricing"
        className="flex items-center gap-2 font-semibold text-white rounded-xl px-5 py-2.5 text-sm shrink-0 transition-all hover:opacity-90"
        style={{ background: '#F0663A', opacity: 0.75 }}
      >
        🔒 Analyser mon CV <span className="text-xs font-normal opacity-80">Pro</span>
      </Link>
    )
  }

  // Pro plan, no CV yet → disabled with hint
  if (!cvUrl) {
    return (
      <div className="flex flex-col items-start gap-1">
        <button
          type="button"
          disabled
          className="flex items-center gap-2 font-semibold text-white rounded-xl px-5 py-2.5 text-sm shrink-0 opacity-50 cursor-not-allowed"
          style={{ background: '#F0663A' }}
        >
          ✨ Analyser mon CV
        </button>
        <p className="text-xs text-slate-500">Upload un CV d&apos;abord via &ldquo;Import CV&rdquo;</p>
      </div>
    )
  }

  // Pro plan + CV present → active
  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={handleExtract}
        disabled={loading}
        className="flex items-center gap-2 font-semibold text-white rounded-xl px-5 py-2.5 text-sm shrink-0 transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ background: '#F0663A' }}
      >
        {loading ? 'Analyse en cours...' : '✨ Analyser mon CV'}
      </button>
      {toast && (
        <p className={`text-sm font-medium ${toast.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
          {toast.message}
        </p>
      )}
    </div>
  )
}
