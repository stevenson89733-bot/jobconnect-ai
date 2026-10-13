'use client'
import { useEffect } from 'react'

// Rendered on /candidate only for referred users who haven't been counted as
// returned yet. daysSince is a hint to skip the call outside day 7..30 — the
// server re-checks the window and the once-only rule itself.
export default function ReturnTracker({ daysSince }: { daysSince: number }) {
  useEffect(() => {
    if (daysSince < 7 || daysSince > 30) return
    fetch('/api/referral/return', { method: 'POST', keepalive: true }).catch(() => {})
  }, [daysSince])

  return null
}
