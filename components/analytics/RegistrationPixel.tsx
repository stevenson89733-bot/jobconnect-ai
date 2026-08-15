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
    // Poll until it's available (max ~2s) before firing, then clean up the param.
    let attempts = 0
    function tryFire() {
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'CompleteRegistration', { content_name: 'candidate_signup' })
        router.replace('/candidate')
      } else if (attempts++ < 20) {
        setTimeout(tryFire, 100)
      } else {
        // fbq never loaded — still clean up the URL param
        router.replace('/candidate')
      }
    }
    tryFire()
  }, [router])

  return null
}
