'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type JobOption = { id: string; title: string; is_active: boolean }

export default function FeaturedCreditsPanel({ credits, jobs }: { credits: number; jobs: JobOption[] }) {
  const router = useRouter()
  const activeJobs = jobs.filter((j) => j.is_active)
  const [selectedJobId, setSelectedJobId] = useState(activeJobs[0]?.id ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function applyCredit() {
    if (!selectedJobId) return
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('Not authenticated'); setLoading(false); return }

      // Decrement credit and set job as featured in one transaction-like sequence
      const { error: jobErr } = await supabase
        .from('jobs')
        .update({ is_featured: true })
        .eq('id', selectedJobId)
        .eq('posted_by', user.id)

      if (jobErr) { setError(jobErr.message); setLoading(false); return }

      const { error: profileErr } = await supabase
        .from('profiles')
        .update({ featured_listing_credits: credits - 1 })
        .eq('user_id', user.id)

      if (profileErr) { setError(profileErr.message); setLoading(false); return }

      setSuccess(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 flex items-center gap-3">
        <span className="text-2xl">⭐</span>
        <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
          Job featured successfully! It will appear at the top of search results.
        </p>
      </div>
    )
  }

  return (
    <div className="mb-6 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-white dark:to-card p-5">
      <div className="flex items-start gap-3 mb-4">
        <span className="text-2xl">⭐</span>
        <div>
          <p className="font-semibold text-amber-700 dark:text-amber-400 text-sm">
            You have {credits} featured listing credit{credits !== 1 ? 's' : ''}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Apply a credit to boost one of your active jobs to the top of search results.
          </p>
        </div>
      </div>
      {activeJobs.length === 0 ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Post an active job first to apply your featured credit.
        </p>
      ) : (
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm px-3 py-2 text-slate-900 dark:text-white"
          >
            {activeJobs.map((j) => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>
          <button
            onClick={applyCredit}
            disabled={loading || !selectedJobId}
            className="shrink-0 font-semibold rounded-xl px-5 py-2 text-sm bg-amber-500 hover:bg-amber-600 text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? '…' : '⭐ Feature this job'}
          </button>
        </div>
      )}
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </div>
  )
}
