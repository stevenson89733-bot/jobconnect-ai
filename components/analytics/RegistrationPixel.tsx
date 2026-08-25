'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

// Fires CompleteRegistration once after a successful candidate signup,
// then removes the ?registered=1 param so a page refresh doesn't re-fire.
export default function RegistrationPixel() {
  const router = useRouter()

  useEffect(() => {
    // fbq stub is injected by <Script afterInteractive> which may not have run yet.
    // Poll until available (max ~2s), fire, then wait 300ms before navigating so
    // fbevents.js has time to send the network request before the soft-nav.
    let cancelled = false
    let timer: ReturnType<typeof setTimeout>
    let attempts = 0

    function tryFire() {
      if (cancelled) return
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'CompleteRegistration', { content_name: 'candidate_signup' })
        timer = setTimeout(() => { if (!cancelled) router.replace('/candidate') }, 300)
      } else if (attempts++ < 20) {
        timer = setTimeout(tryFire, 100)
      } else {
        // fbq never loaded — still clean up the URL param
        router.replace('/candidate')
      }
    }
    tryFire()

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [router])

  return null
}
