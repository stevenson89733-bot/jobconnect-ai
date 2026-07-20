import { COUNTRIES } from '@/lib/countries'

export type RateProvider = 'fawazahmed0' | 'frankfurter'
export type RateEntry = { rate: number; provider: RateProvider }
export type RatesResult = { rates: Record<string, RateEntry>; fetchedAt: string }

// Real currencies actually needed by the country selector — USD excluded
// (base currency, rate is always 1, never fetched).
const NEEDED_CURRENCIES = [...new Set(COUNTRIES.map((c) => c.currency))].filter((c) => c !== 'USD')

// Overridable only for real-failure testing (see verification notes in the
// PR/summary) — never set in normal operation. Lets us point the primary at
// an unreachable URL to prove the Frankfurter fallback path actually runs,
// rather than existing in code, unused and unverified.
const PRIMARY_BASE_URL =
  process.env.EXCHANGE_RATE_PRIMARY_URL_OVERRIDE ||
  'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json'

const FRANKFURTER_URL = 'https://api.frankfurter.dev/v1/latest?base=USD'

type Fawazahmed0Response = { date: string; usd: Record<string, number> }
type FrankfurterResponse = { amount: number; base: string; date: string; rates: Record<string, number> }

async function fetchPrimary(): Promise<Record<string, number> | null> {
  try {
    const res = await fetch(PRIMARY_BASE_URL, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return null
    const data = (await res.json()) as Fawazahmed0Response
    if (!data?.usd) return null
    // Real response keys are lowercase ISO codes (e.g. "eur", "vnd") —
    // normalize to uppercase to match our own currency codes.
    return Object.fromEntries(Object.entries(data.usd).map(([k, v]) => [k.toUpperCase(), v]))
  } catch {
    return null
  }
}

async function fetchFallback(symbols: string[]): Promise<Record<string, number> | null> {
  if (symbols.length === 0) return {}
  try {
    const res = await fetch(`${FRANKFURTER_URL}&symbols=${symbols.join(',')}`, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return null
    const data = (await res.json()) as FrankfurterResponse
    return data?.rates ?? {}
  } catch {
    return null
  }
}

// Real current exchange rates, USD as base, dual-provider with a real
// fallback chain (never a hardcoded/stale rate):
//   1. Try the primary (fawazahmed0/currency-api) for every needed currency
//      in one request.
//   2. Whatever's still missing (primary failed entirely, or a specific
//      currency wasn't in its response) goes to Frankfurter in one request.
//   3. Anything still missing after both gets no entry at all — callers
//      must treat a missing currency as "show USD only", never invent a
//      number.
// `provider` is recorded per-currency so it's possible to tell after the
// fact which of the two actually supplied a given rate.
export async function fetchExchangeRates(): Promise<RatesResult> {
  const rates: Record<string, RateEntry> = {}

  const primary = await fetchPrimary()
  if (primary) {
    for (const currency of NEEDED_CURRENCIES) {
      if (typeof primary[currency] === 'number') {
        rates[currency] = { rate: primary[currency], provider: 'fawazahmed0' }
      }
    }
  }

  const stillMissing = NEEDED_CURRENCIES.filter((c) => !rates[c])
  if (stillMissing.length > 0) {
    const fallback = await fetchFallback(stillMissing)
    if (fallback) {
      for (const currency of stillMissing) {
        if (typeof fallback[currency] === 'number') {
          rates[currency] = { rate: fallback[currency], provider: 'frankfurter' }
        }
      }
    }
  }

  return { rates, fetchedAt: new Date().toISOString() }
}
