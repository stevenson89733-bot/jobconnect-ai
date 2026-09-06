'use client'
import { useEffect, useState } from 'react'

export default function WaitlistCounter({ initial }: { initial: number }) {
  const [count, setCount] = useState(initial)

  async function refresh() {
    try {
      const res = await fetch('/api/auto-apply/waitlist', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        if (typeof data.count === 'number') setCount(data.count)
      }
    } catch { /* silent */ }
  }

  useEffect(() => {
    // Refresh after someone joins (dispatched by AutoApplyJoinButton)
    window.addEventListener('waitlist-joined', refresh)
    // Poll every 20s for other visitors joining concurrently
    const id = setInterval(refresh, 20_000)
    return () => {
      window.removeEventListener('waitlist-joined', refresh)
      clearInterval(id)
    }
  }, [])

  if (count <= 0) return null

  return (
    <p className="mt-6 text-sm text-slate-500">
      <span className="tabular-nums text-slate-300 font-semibold">{count}</span>
      {' '}candidate{count > 1 ? 's' : ''} already on the waitlist
    </p>
  )
}
