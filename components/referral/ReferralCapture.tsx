'use client'
import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'

// Sibling of UtmCapture: when a page is opened with ?ref=CODE, hand the raw
// value to the server, which validates it and sets the httpOnly attribution
// cookie. The browser never decides whether a code is valid. Then strip the
// param so a refresh or copied URL doesn't re-submit it. Must be mounted
// inside <Suspense> (useSearchParams in the root layout).
export default function ReferralCapture() {
  const searchParams = useSearchParams()
  const sent = useRef(false)
  const code = searchParams.get('ref')

  useEffect(() => {
    if (!code || sent.current) return
    sent.current = true

    fetch('/api/referral/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code.slice(0, 32) }),
      keepalive: true,
    }).catch(() => {})

    const params = new URLSearchParams(window.location.search)
    params.delete('ref')
    const qs = params.toString()
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`)
  }, [code])

  return null
}
