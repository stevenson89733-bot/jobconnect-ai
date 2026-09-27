'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Labels {
  unlockPro: string
  unlockElite: string
  download: string
  loading: string
  errorUpgrade: string
  errorUnavailable: string
  errorNetwork: string
}

interface Props {
  slug: string
  unlocked: boolean
  requiresPlan: 'pro' | 'elite'
  labels: Labels
}

export default function DownloadGuideButton({ slug, unlocked, requiresPlan, labels }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!unlocked) {
    return (
      <a
        href="/pricing"
        className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-white rounded-xl px-4 py-2 transition-all hover:opacity-90"
        style={{ background: '#F0663A', opacity: 0.75 }}
      >
        {requiresPlan === 'elite' ? labels.unlockElite : labels.unlockPro}
      </a>
    )
  }

  async function handleDownload() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/learn/download?guide=${slug}`)
      const data = await res.json()
      if (res.status === 403) {
        setError(labels.errorUpgrade)
        setTimeout(() => router.push('/pricing'), 1500)
        return
      }
      if (!res.ok || !data.url) {
        setError(labels.errorUnavailable)
        return
      }
      window.open(data.url, '_blank')
    } catch {
      setError(labels.errorNetwork)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleDownload}
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-white rounded-xl px-4 py-2 transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ background: '#F0663A' }}
      >
        {loading ? labels.loading : labels.download}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
