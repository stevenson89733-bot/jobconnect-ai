import type { RateEntry, RateProvider } from '@/lib/exchangeRates'

export type ConvertedAmount = { amount: number; provider: RateProvider | 'base' }

// Real conversion from the job's real stored USD figure using a real,
// currently-cached rate — never a fabricated/stale number. Returns null
// when there is genuinely no rate available (from either provider) for the
// requested currency, so the caller can honestly fall back to USD-only
// display instead of showing something invented.
export function convertFromUsd(
  amountUsd: number,
  currency: string,
  rates: Record<string, RateEntry>
): ConvertedAmount | null {
  if (currency === 'USD') return { amount: amountUsd, provider: 'base' }
  const entry = rates[currency]
  if (!entry) return null
  return { amount: amountUsd * entry.rate, provider: entry.provider }
}

// Compact currency formatting via native Intl — no custom rounding/unit
// logic invented, same approach for every currency (JPY/VND's larger
// magnitudes format naturally via `compact` notation, e.g. "¥26M", "₫4.4B").
export function formatCompactCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount)
  } catch {
    // Unknown/invalid ISO code to Intl (shouldn't happen — currencies come
    // from lib/countries.ts's real ISO 4217 list) — safe plain fallback.
    return `${Math.round(amount).toLocaleString('en-US')} ${currency}`
  }
}
