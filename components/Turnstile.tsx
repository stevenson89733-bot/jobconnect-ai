'use client'
import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, opts: object) => string
      reset: (widgetId: string) => void
    }
  }
}

export default function Turnstile({ fieldName = 'cf-turnstile-response' }: { fieldName?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetId = useRef<string | null>(null)
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  useEffect(() => {
    if (!siteKey || !containerRef.current) return

    function render() {
      if (!containerRef.current || !window.turnstile) return
      widgetId.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        'response-field-name': fieldName,
        theme: 'auto',
        size: 'normal',
      })
    }

    if (window.turnstile) {
      render()
    } else {
      const existing = document.querySelector('script[data-turnstile]')
      if (!existing) {
        const script = document.createElement('script')
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
        script.async = true
        script.defer = true
        script.dataset.turnstile = '1'
        script.onload = render
        document.head.appendChild(script)
      } else {
        existing.addEventListener('load', render)
      }
    }

    return () => {
      if (widgetId.current && window.turnstile) {
        try { window.turnstile.reset(widgetId.current) } catch {}
      }
    }
  }, [siteKey, fieldName])

  // If no site key configured, render nothing (graceful degradation)
  if (!siteKey) return null

  return <div ref={containerRef} className="mt-1" />
}
