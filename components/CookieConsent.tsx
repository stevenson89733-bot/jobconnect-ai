'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

export function CookieConsent() {
  const t = useTranslations('cookieBanner')
  const [show, setShow] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setShow(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setShow(false)
    if (window.fbq) {
      window.fbq('consent', 'grant')
    }
  }

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined')
    setShow(false)
    if (window.fbq) {
      window.fbq('consent', 'revoke')
    }
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
