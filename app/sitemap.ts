import type { MetadataRoute } from 'next'
import { createPublicClient } from '@/lib/supabase/public'
import { SITE_URL } from '@/lib/seo'

const STATIC_ROUTES: { path: string; priority: number }[] = [
  { path: '/', priority: 1 },
  { path: '/jobs', priority: 0.9 },
  { path: '/companies', priority: 0.8 },
  { path: '/pricing', priority: 0.6 },
  { path: '/ai-tools/resume-builder', priority: 0.7 },
  { path: '/ai-tools/cover-letter', priority: 0.7 },
  { path: '/about', priority: 0.5 },
  { path: '/contact', priority: 0.4 },
  { path: '/privacy', priority: 0.3 },
  { path: '/terms', priority: 0.3 },
  { path: '/login', priority: 0.3 },
  { path: '/register', priority: 0.5 },
]

// Real, current company names only — queried fresh from the same active
// jobs the rest of the app treats as the source of truth (no hardcoded
// list that would silently go stale as jobs are added/closed).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    priority,
  }))

  let companyEntries: MetadataRoute.Sitemap = []
  try {
    const supabase = createPublicClient()
    const { data } = await supabase
      .from('jobs')
      .select('company_name')
      .eq('is_active', true)

    const uniqueNames = [...new Set((data ?? []).map((j) => j.company_name).filter(Boolean))]
    companyEntries = uniqueNames.map((name) => ({
      url: `${SITE_URL}/companies/${encodeURIComponent(name)}`,
      lastModified: new Date(),
      priority: 0.6,
    }))
  } catch {
    // Supabase not configured or unreachable at build time — sitemap still
    // serves the static routes rather than failing entirely.
  }

  return [...staticEntries, ...companyEntries]
}
