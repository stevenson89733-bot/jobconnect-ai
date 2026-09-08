'use client'
import { useState } from 'react'

export default function AutoApplyJoinButton() {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  async function join() {
    setState('loading')
    try {
      const res = await fetch('/api/auto-apply/waitlist', { method: 'POST' })
      if (res.ok) {
        setState('done')
        window.dispatchEvent(new Event('waitlist-joined'))
      } else {
        setState('error')
      }
    } catch {
      setState('error')
    }
  }

  if (state === 'done') {
    return (
      <a href="/auto-apply/settings" className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-semibold text-base px-8 py-3.5 hover:bg-emerald-500/30 transition-colors">
        ✓ Go to Settings →
      </a>
    )
  }

  return (
    <button
      onClick={join}
      disabled={state === 'loading'}
      className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-slate-900 font-bold text-base px-8 py-3.5 transition-colors shadow-lg shadow-cyan-500/30"
    >
      {state === 'loading' ? (
        <>
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
          </svg>
          Joining…
        </>
      ) : (
        <><span className="text-base">✦</span> Join Auto-Apply Beta</>
      )}
    </button>
  )
}
