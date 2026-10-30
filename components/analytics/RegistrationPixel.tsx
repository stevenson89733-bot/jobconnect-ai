'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CONSENT_KEY } from '@/components/CookieConsent'

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
    // fbq is injected on demand by <CookieConsent> — only once the user has
    // accepted cookies (see initFbPixel there). If consent isn't 'accepted',
    // fbq will never load, so skip the poll entirely and navigate right away
    // rather than burning ~2s waiting for a pixel that was never going to fire.
    let consent: string | null = null
    try {
      consent = localStorage.getItem(CONSENT_KEY)
    } catch {
      // private browsing / storage blocked — treat as no consent
    }

    if (consent !== 'accepted') {
      router.replace('/candidate')
      return
    }

    // Consent was already granted, so <CookieConsent> calls initFbPixel() on
    // its own mount — poll until it's actually ready (max ~2s), fire, then
    // wait 300ms before navigating so fbevents.js has time to send the
    // network request before the soft-nav.
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
