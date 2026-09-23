'use client'
import { useState } from 'react'

type Ranking = { id: string; name: string; title: string; score: number; reason: string }

export default function AIScreeningPanel({
  jobs,
  isPro,
}: {
  jobs: { id: string; title: string }[]
  isPro: boolean
}) {
  const [selectedJob, setSelectedJob] = useState('')
  const [loading, setLoading] = useState(false)
  const [rankings, setRankings] = useState<Ranking[]>([])
  const [error, setError] = useState('')
  const [ran, setRan] = useState(false)

  if (!isPro) return null

  async function runScreening() {
    if (!selectedJob) return
    setLoading(true)
    setError('')
    setRankings([])
    try {
      const res = await fetch('/api/recruiter/screen-candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: selectedJob }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to screen candidates'); return }
      setRankings(data.rankings ?? [])
      setRan(true)
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xl">🤖</span>
        <h2 className="font-semibold text-slate-900 dark:text-white">AI Candidate Screening</h2>
        <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400">Pro</span>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Rank applicants by fit for a job posting. Scored 0–100 with a one-sentence rationale.
      </p>

      <div className="flex gap-3">
        <select
          value={selectedJob}
          onChange={e => setSelectedJob(e.target.value)}
          className="flex-1 bg-white dark:bg-background border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary"
        >
          <option value="">Select a job posting…</option>
          {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
        </select>
        <button
          onClick={runScreening}
          disabled={!selectedJob || loading}
          className="btn-primary text-sm py-2 px-4 disabled:opacity-50"
        >
          {loading ? 'Screening…' : 'Screen Candidates'}
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {ran && rankings.length === 0 && !loading && (
        <p className="text-sm text-slate-500 dark:text-slate-400">No applications to screen for this job.</p>
      )}

      {rankings.length > 0 && (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {rankings.map((r, i) => (
            <div key={r.id} className="flex items-start gap-3 py-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                style={{
                  background: r.score >= 80 ? 'rgba(16,185,129,0.15)' : r.score >= 60 ? 'rgba(59,130,246,0.15)' : 'rgba(148,163,184,0.15)',
                  color: r.score >= 80 ? '#059669' : r.score >= 60 ? '#2563eb' : '#64748b',
                }}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-900 dark:text-white">{r.name}</span>
                  {r.title && <span className="text-xs text-slate-500 dark:text-slate-400">{r.title}</span>}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{r.reason}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                <span className="text-lg font-bold"
                  style={{ color: r.score >= 80 ? '#059669' : r.score >= 60 ? '#2563eb' : '#64748b' }}>
                  {r.score}
                </span>
                <span className="text-xs text-slate-400">/100</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
