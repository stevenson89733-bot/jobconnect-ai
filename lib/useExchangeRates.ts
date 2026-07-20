'use client'
import { useEffect, useState } from 'react'
import type { RatesResult } from '@/lib/exchangeRates'

// Module-level cache so the many JobCard instances on a single /jobs page
// share one real fetch instead of each hitting /api/exchange-rates
// separately — the route itself is also cached (daily) server-side, this
// just avoids redundant client requests within the same page session.
let cachedPromise: Promise<RatesResult> | null = null

function loadRates(): Promise<RatesResult> {
  if (!cachedPromise) {
    cachedPromise = fetch('/api/exchange-rates')
      .then((res) => res.json())
      .catch(() => ({ rates: {}, fetchedAt: new Date().toISOString() }))
  }
  return cachedPromise
}

export function useExchangeRates(): RatesResult | null {
  const [data, setData] = useState<RatesResult | null>(null)
  useEffect(() => {
    let active = true
    loadRates().then((result) => {
      if (active) setData(result)
    })
    return () => {
      active = false
    }
  }, [])
  return data
}
