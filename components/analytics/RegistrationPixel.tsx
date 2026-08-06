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
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'CompleteRegistration', { content_name: 'candidate_signup' })
    }
    router.replace('/candidate')
  }, [router])

  return null
}
