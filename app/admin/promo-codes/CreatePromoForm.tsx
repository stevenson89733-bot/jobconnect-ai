'use client'
import { useState } from 'react'

export default function CreatePromoForm({ onCreated }: { onCreated: () => void }) {
  const [code, setCode]         = useState('')
  const [maxUses, setMaxUses]   = useState('10')
  const [expiresAt, setExpires] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const res = await fetch('/api/promo/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: code.trim().toUpperCase(),
        max_uses: parseInt(maxUses, 10),
        expires_at: expiresAt || null,
      }),
    })
    const data = await res.json()
    setLoading(false)

    if (data.error) {
      setError(data.error)
    } else {
      setSuccess(`Code "${data.code.code}" created.`)
      setCode('')
      setMaxUses('10')
      setExpires('')
      onCreated()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h3 className="font-semibold text-slate-900 dark:text-white">New Promo Code</h3>

      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Code *</label>
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            required
            placeholder="EARLY3MONTHS"
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Max uses *</label>
          <input
            type="number"
            value={maxUses}
            onChange={e => setMaxUses(e.target.value)}
            min="1"
            required
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Code expires at</label>
          <input
            type="date"
            value={expiresAt}
            onChange={e => setExpires(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>

      {error   && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {success && <p className="text-sm text-green-600 dark:text-green-400">{success}</p>}

      <button
        type="submit"
        disabled={loading || !code.trim()}
        className="btn-primary text-sm py-2 px-5 disabled:opacity-50"
      >
        {loading ? 'Creating…' : 'Create Code'}
      </button>
    </form>
  )
}
