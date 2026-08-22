'use client'
import { useState } from 'react'

export type PromoCode = {
  id: string
  code: string
  type: 'candidate' | 'employer'
  description: string | null
  max_uses: number
  used_count: number
  expires_at: string | null
  is_active: boolean
  created_at: string
}

export default function PromoCodesTable({
  codes,
  onToggle,
}: {
  codes: PromoCode[]
  onToggle: (id: string, newValue: boolean) => void
}) {
  const [toggling, setTog] = useState<string | null>(null)

  async function handleToggle(id: string, current: boolean) {
    setTog(id)
    await fetch('/api/promo/admin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active: !current }),
    })
    onToggle(id, !current)
    setTog(null)
  }

  if (!codes.length) {
    return <p className="text-sm text-slate-500 dark:text-slate-400 py-4">No promo codes yet.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700 text-left">
            <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">Code</th>
            <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">Type</th>
            <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">Uses</th>
            <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">Code expires</th>
            <th className="py-2 pr-4 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">Status</th>
            <th className="py-2 font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {codes.map(c => {
            const codeExpired = c.expires_at ? new Date(c.expires_at) < new Date() : false
            const full        = c.used_count >= c.max_uses
            const statusLabel = !c.is_active ? 'Disabled' : codeExpired ? 'Expired' : full ? 'Full' : 'Active'
            const statusColor = statusLabel === 'Active'
              ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            return (
              <tr key={c.id}>
                <td className="py-3 pr-4">
                  <div className="font-mono font-semibold text-slate-900 dark:text-white tracking-wider">{c.code}</div>
                  {c.description && <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{c.description}</div>}
                </td>
                <td className="py-3 pr-4">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                    c.type === 'employer'
                      ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300'
                      : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                  }`}>
                    {c.type === 'employer' ? '🏢 Employer' : '👤 Candidate'}
                  </span>
                </td>
                <td className="py-3 pr-4 text-slate-700 dark:text-slate-300">
                  <span className={full ? 'text-red-600 dark:text-red-400' : ''}>{c.used_count}</span>
                  <span className="text-slate-400"> / {c.max_uses}</span>
                </td>
                <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">
                  {c.expires_at
                    ? new Date(c.expires_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                    : <span className="text-slate-400">—</span>}
                </td>
                <td className="py-3 pr-4">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                    {statusLabel}
                  </span>
                </td>
                <td className="py-3">
                  <button
                    onClick={() => handleToggle(c.id, c.is_active)}
                    disabled={toggling === c.id}
                    className="text-xs text-primary dark:text-blue-400 hover:underline disabled:opacity-40"
                  >
                    {toggling === c.id ? '…' : c.is_active ? 'Disable' : 'Enable'}
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
