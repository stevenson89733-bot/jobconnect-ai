'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ApplyModal({
  jobId,
  jobTitle,
  company,
  alreadyApplied = false,
}: {
  jobId: string
  jobTitle: string
  company: string
  alreadyApplied?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [applied, setApplied] = useState(alreadyApplied)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleApply(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: jobId, message }),
    })

    if (res.status === 401) {
      router.push(`/login?redirectTo=/jobs`)
      return
    }

    if (res.status === 409) {
      setApplied(true)
      setOpen(false)
      setLoading(false)
      return
    }

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Something went wrong')
      setLoading(false)
      return
    }

    setApplied(true)
    setOpen(false)
    setLoading(false)
    setMessage('')
  }

  if (applied) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-800/50 rounded-lg px-3 py-1.5 whitespace-nowrap">
        ✓ Applied
      </span>
    )
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-primary text-xs py-1.5 px-4 whitespace-nowrap"
      >
        Apply Now
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-start justify-between p-6 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-slate-900 dark:text-white font-bold text-lg">Apply for this role</h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5">
                  {jobTitle} · <span className="text-slate-700 dark:text-slate-300">{company}</span>
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors text-xl leading-none ml-4"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApply} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1.5">
                  Message to the hiring team <span className="text-slate-500 dark:text-slate-600">(optional)</span>
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={4}
                  placeholder="Briefly explain why you're a great fit, or share anything relevant…"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary resize-none"
                />
              </div>

              {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 btn-outline py-2.5 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn-primary py-2.5 text-sm disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                      </svg>
                      Submitting…
                    </span>
                  ) : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
