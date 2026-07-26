// Cache/orchestration layer for Company Profile's "Culture & Overview"
// section. Wraps lib/ai/companySummary.ts's real Tavily+LLM synthesis with
// a DB cache (supabase/company_profile_summaries.sql) so most page views hit
// the cache instead of re-running a paid web search + LLM call every time.

import { createPublicClient } from '@/lib/supabase/public'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { buildCompanySummary, type CompanySummaryResult } from '@/lib/ai/companySummary'
import { getPromptLocale } from '@/lib/ai/promptLocale'
import type { CompanySource } from '@/lib/ai/companyResearch'
import type { Locale } from '@/lib/i18n/config'

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

async function fetchCacheRow(companyName: string, locale: Locale): Promise<CacheRow | null> {
  const publicSupabase = createPublicClient()
  const { data } = await publicSupabase
    .from('company_profile_summaries')
    .select('company_name, found, summary, sources, generated_at')
    .ilike('company_name', companyName)
    .eq('locale', locale)
    .maybeSingle()
  return data as CacheRow | null
}

async function saveToCache(companyName: string, locale: Locale, result: CompanySummaryResult): Promise<void> {
  try {
    const admin = createAdminClient()
    await admin.from('company_profile_summaries').upsert(
      {
        company_name: companyName,
        locale,
        found: result.found,
        summary: result.found ? result.summary : null,
        sources: result.found ? result.sources : [],
        generated_at: new Date().toISOString(),
      },
      { onConflict: 'company_name,locale' }
    )
  } catch (err) {
    // Cache write failure shouldn't break the page — the real result is
    // still returned to this request, just not persisted for next time.
    console.error('[companyProfileSummary/cache]', err instanceof Error ? err.message : 'cache write failed')
  }
}

// Real, sourced company overview — cached with a 21-day TTL, keyed by
// (company_name, locale) so each site language gets its own real
// generation instead of every locale showing whatever was cached first
// (see supabase/company_profile_summaries_locale.sql for the migration
// this depends on). The paid Tavily+LLM call only runs once per
// company+locale per refresh window, not on every page view.
//
// On a cache miss, rate-limited per-IP (this page is public, so "per
// user" isn't available for anonymous visitors) — if rate-limited, falls
// back in order to: a stale row in the requested locale, then a fresh
// English row (silent, graceful degradation while the requested locale's
// translation hasn't been generated yet — never an immediate bulk
// regeneration of every locale), then nothing rather than erroring the
// whole page load.
export async function getCompanyProfileSummary(companyName: string): Promise<CompanyProfileSummary | null> {
  const locale = getPromptLocale()
  const cachedRow = await fetchCacheRow(companyName, locale)
  if (cachedRow && isFresh(cachedRow.generated_at)) {
    return toResult(cachedRow)
  }

  const { ok } = rateLimit(`company-summary:${getClientIp()}`, REFRESH_LIMIT, REFRESH_WINDOW_MS)
  if (!ok) {
    if (cachedRow) return toResult(cachedRow)
    if (locale !== 'en') {
      const englishFallback = await fetchCacheRow(companyName, 'en')
      if (englishFallback && isFresh(englishFallback.generated_at)) return toResult(englishFallback)
    }
    return null
  }

  const result = await buildCompanySummary(companyName)
  await saveToCache(companyName, locale, result)
  return result
}
