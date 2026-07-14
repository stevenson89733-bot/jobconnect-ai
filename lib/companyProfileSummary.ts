// Cache/orchestration layer for Company Profile's "Culture & Overview"
// section. Wraps lib/ai/companySummary.ts's real Tavily+LLM synthesis with
// a DB cache (supabase/company_profile_summaries.sql) so most page views hit
// the cache instead of re-running a paid web search + LLM call every time.

import { createPublicClient } from '@/lib/supabase/public'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { buildCompanySummary, type CompanySummaryResult } from '@/lib/ai/companySummary'
import type { CompanySource } from '@/lib/ai/companyResearch'

const TTL_MS = 21 * 24 * 60 * 60 * 1000 // 21 days
const REFRESH_LIMIT = 20
const REFRESH_WINDOW_MS = 60 * 60 * 1000 // 1 hour

export type CompanyProfileSummary =
  | { found: true; summary: string; sources: CompanySource[] }
  | { found: false }

type CacheRow = {
  company_name: string
  found: boolean
  summary: string | null
  sources: CompanySource[] | null
  generated_at: string
}

function isFresh(generatedAt: string): boolean {
  return Date.now() - new Date(generatedAt).getTime() < TTL_MS
}

function toResult(row: CacheRow): CompanyProfileSummary {
  if (!row.found || !row.summary) return { found: false }
  return { found: true, summary: row.summary, sources: row.sources ?? [] }
}

async function saveToCache(companyName: string, result: CompanySummaryResult): Promise<void> {
  try {
    const admin = createAdminClient()
    await admin.from('company_profile_summaries').upsert(
      {
        company_name: companyName,
        found: result.found,
        summary: result.found ? result.summary : null,
        sources: result.found ? result.sources : [],
        generated_at: new Date().toISOString(),
      },
      { onConflict: 'company_name' }
    )
  } catch (err) {
    // Cache write failure shouldn't break the page — the real result is
    // still returned to this request, just not persisted for next time.
    console.error('[companyProfileSummary/cache]', err instanceof Error ? err.message : 'cache write failed')
  }
}

// Real, sourced company overview — cached with a 21-day TTL so the paid
// Tavily+LLM call only runs once per company per refresh window, not on
// every page view. On a cache miss, rate-limited per-IP (this page is
// public, so "per user" isn't available for anonymous visitors) — if
// rate-limited, falls back to a stale cached row if one exists, or skips
// the section entirely rather than erroring the whole page load.
export async function getCompanyProfileSummary(companyName: string): Promise<CompanyProfileSummary | null> {
  const publicSupabase = createPublicClient()
  const { data: cached } = await publicSupabase
    .from('company_profile_summaries')
    .select('company_name, found, summary, sources, generated_at')
    .ilike('company_name', companyName)
    .maybeSingle()

  const cachedRow = cached as CacheRow | null
  if (cachedRow && isFresh(cachedRow.generated_at)) {
    return toResult(cachedRow)
  }

  const { ok } = rateLimit(`company-summary:${getClientIp()}`, REFRESH_LIMIT, REFRESH_WINDOW_MS)
  if (!ok) {
    // Rate-limited on a cache miss — prefer a stale cached row over
    // nothing, since it's still real, previously-verified data.
    return cachedRow ? toResult(cachedRow) : null
  }

  const result = await buildCompanySummary(companyName)
  await saveToCache(companyName, result)
  return result
}
