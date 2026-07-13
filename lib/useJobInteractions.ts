'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Shared by the Jobs page and the Company Profile page — one real
// saved/applied fetch-and-toggle implementation, not two copies that could
// drift apart. redirectTo controls where an unauthenticated Save attempt
// sends the candidate to log in.
export function useJobInteractions(redirectTo: string) {
  const router = useRouter()
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

  async function toggleSave(jobId: string) {
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
        router.push(`/login?redirectTo=${encodeURIComponent(redirectTo)}`)
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

  return { appliedIds, savedIds, toggleSave }
}
