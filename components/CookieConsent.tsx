'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

declare global {
  interface Window {
    _fbq?: unknown
  }
}

type ConsentValue = 'accepted' | 'declined' | null

export const CONSENT_KEY = 'cookie-consent'

// The standard FB Pixel stub: a callable function that also carries a few
// extra properties the real fbevents.js looks for once it finishes loading.
type FbqStub = {
  (...args: unknown[]): void
  callMethod?: (...args: unknown[]) => void
  queue: unknown[][]
  loaded: boolean
  version: string
  push: FbqStub
}

// Initialise FB Pixel only after explicit consent.
// Called once on "Accept" and again on mount if previously accepted.
function initFbPixel() {
  if (typeof window === 'undefined') return
  if (window.fbq) {
    window.fbq('consent', 'grant')
    window.fbq('track', 'PageView')
    return
  }
  // Inject pixel script on demand
  const script = document.createElement('script')
  script.async = true
  script.src = 'https://connect.facebook.net/en_US/fbevents.js'
  document.head.appendChild(script)
  script.onload = () => {
    const stub = function (...args: unknown[]) {
      if (stub.callMethod) stub.callMethod(...args)
      else stub.queue.push(args)
    } as FbqStub
    stub.queue = []
    stub.loaded = true
    stub.version = '2.0'
    stub.push = stub
    window.fbq = stub
    if (!window._fbq) window._fbq = stub
    window.fbq('init', '1577365084028138')
    window.fbq('consent', 'grant')
    window.fbq('track', 'PageView')
  }
}

export function CookieConsent() {
  const t = useTranslations('cookieBanner')
  const [show, setShow] = useState(false)

  useEffect(() => {
    let consent: ConsentValue = null
    try {
      consent = localStorage.getItem(CONSENT_KEY) as ConsentValue
    } catch {
      // private browsing / storage blocked
    }

    if (!consent) {
      setShow(true)
    } else if (consent === 'accepted') {
      // Re-initialise on page load for returning visitors who already accepted
      initFbPixel()
    }
    // 'declined' → do nothing; pixel stays unloaded
  }, [])

  const handleAccept = () => {
    try { localStorage.setItem(CONSENT_KEY, 'accepted') } catch { /* ignore */ }
    setShow(false)
    initFbPixel()
  }

  const handleDecline = () => {
    try { localStorage.setItem(CONSENT_KEY, 'declined') } catch { /* ignore */ }
    setShow(false)
    // Pixel was never loaded — nothing to revoke
    if (window.fbq) window.fbq('consent', 'revoke')
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800 shadow-xl">
      <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-slate-300">
              {t('text')}{' '}
              <a href="/privacy" className="text-blue-400 hover:text-blue-300 underline">
                {t('privacyLink')}
              </a>
              .
            </p>
          </div>
          <div className="flex gap-3 sm:flex-shrink-0">
            <button
              onClick={handleDecline}
              className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              {t('decline')}
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              {t('accept')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
