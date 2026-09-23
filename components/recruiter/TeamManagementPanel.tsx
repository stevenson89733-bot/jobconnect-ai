'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Member = {
  id: string
  invited_email: string
  status: 'invited' | 'active' | 'removed'
  invited_at: string
  accepted_at: string | null
}

export default function TeamManagementPanel({
  isGrowth,
  isPro,
}: {
  isGrowth: boolean
  isPro: boolean
}) {
  const [members, setMembers] = useState<Member[]>([])
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const maxMembers = isPro ? null : 5

  useEffect(() => {
    if (!isGrowth) return
    setFetching(true)
    fetch('/api/recruiter/team')
      .then(r => r.json())
      .then(d => setMembers(d.members ?? []))
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [isGrowth])

  if (!isGrowth) {
    return (
      <div className="card">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xl">👥</span>
          <h2 className="font-semibold text-slate-900 dark:text-white">Team Collaboration</h2>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400">Growth</span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Invite up to 5 team members to collaborate on your recruiting dashboard.
        </p>
        <Link href="/pricing#employers" className="btn-primary text-sm py-2 px-4 inline-flex">
          ✦ Upgrade to Growth
        </Link>
      </div>
    )
  }

  async function invite(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/recruiter/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to send invite'); return }
      setSuccess(`Invitation sent to ${email.trim()}`)
      setEmail('')
      // Refresh list
      const listRes = await fetch('/api/recruiter/team')
      const listData = await listRes.json()
      setMembers(listData.members ?? [])
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  async function remove(id: string) {
    const res = await fetch(`/api/recruiter/team/${id}`, { method: 'DELETE' })
    if (res.ok) setMembers(prev => prev.filter(m => m.id !== id))
  }

  return (
    <div className="card space-y-5">
      <div className="flex items-center gap-2">
        <span className="text-xl">👥</span>
        <h2 className="font-semibold text-slate-900 dark:text-white">Team Collaboration</h2>
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${isPro ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400'}`}>
          {isPro ? 'Pro' : 'Growth'}
        </span>
        {maxMembers && (
          <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">
            {members.length}/{maxMembers} members
          </span>
        )}
      </div>

      <form onSubmit={invite} className="flex gap-3">
        <input
          type="email"
          placeholder="colleague@company.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="flex-1 bg-white dark:bg-background border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary"
          disabled={loading || (maxMembers !== null && members.length >= maxMembers)}
        />
        <button
          type="submit"
          disabled={loading || !email.trim() || (maxMembers !== null && members.length >= maxMembers)}
          className="btn-primary text-sm py-2 px-4 disabled:opacity-50"
        >
          {loading ? 'Sending…' : 'Invite'}
        </button>
      </form>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-emerald-600 dark:text-emerald-400">{success}</p>}
      {maxMembers !== null && members.length >= maxMembers && (
        <p className="text-xs text-amber-600 dark:text-amber-400">Team limit reached. <Link href="/pricing#employers" className="underline">Upgrade to Pro</Link> for unlimited members.</p>
      )}

      {fetching ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading team…</p>
      ) : members.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">No team members yet. Invite colleagues above.</p>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {members.map(m => (
            <div key={m.id} className="flex items-center gap-3 py-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {m.invited_email[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{m.invited_email}</p>
              </div>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                m.status === 'active'
                  ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
                  : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400'
              }`}>
                {m.status === 'active' ? 'Active' : 'Pending'}
              </span>
              <button
                onClick={() => remove(m.id)}
                className="text-xs text-red-400 hover:text-red-600 transition-colors ml-1"
                title="Remove member"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
