import { NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { fetchExchangeRates } from '@/lib/exchangeRates'

// Daily cache — real current rates, not fetched on every render. Tagged so
// it can be manually invalidated (revalidateTag('exchange-rates')) if a
// rate ever looks stale/wrong during testing, without waiting out the
// window.
const getCachedRates = unstable_cache(fetchExchangeRates, ['exchange-rates'], {
  revalidate: 86400,
  tags: ['exchange-rates'],
})

export async function GET() {
  const result = await getCachedRates()
  return NextResponse.json(result)
}
