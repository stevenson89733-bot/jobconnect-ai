const ADZUNA_BASE_URL = 'https://api.adzuna.com/v1/api/jobs'
const FETCH_TIMEOUT_MS = 8000

export const ADZUNA_COUNTRIES = [
  { code: 'gb', label: 'UK' },
  { code: 'au', label: 'Australia' },
  { code: 'fr', label: 'France' },
  { code: 'de', label: 'Germany' },
  { code: 'ca', label: 'Canada' },
  { code: 'nl', label: 'Netherlands' },
] as const

export type AdzunaCountryCode = typeof ADZUNA_COUNTRIES[number]['code']

export interface AdzunaJob {
  id: string
  title: string
  company_name: string
  description: string  // plain text
  location: string
  salary_min: number | null
  salary_max: number | null
  redirect_url: string
  created: string  // ISO date string
  country: AdzunaCountryCode
}

export async function fetchAdzunaJobs({
  country,
  resultsPerPage = 50,
  timeoutMs = FETCH_TIMEOUT_MS,
}: {
  country: AdzunaCountryCode
  resultsPerPage?: number
  timeoutMs?: number
}): Promise<AdzunaJob[]> {
  const appId = process.env.ADZUNA_APP_ID
  const appKey = process.env.ADZUNA_APP_KEY

  if (!appId || !appKey) {
    throw new Error('ADZUNA_APP_ID and ADZUNA_APP_KEY environment variables are required')
  }

  const url = new URL(`${ADZUNA_BASE_URL}/${country}/search/1`)
  url.searchParams.set('app_id', appId)
  url.searchParams.set('app_key', appKey)
  url.searchParams.set('results_per_page', String(resultsPerPage))
  url.searchParams.set('what', 'remote')
  url.searchParams.set('content-type', 'application/json')

  const res = await fetch(url.toString(), {
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; JobConnectBot/1.0)',
      Accept: 'application/json',
    },
  })

  if (!res.ok) {
    throw new Error(`Adzuna API returned ${res.status} for country=${country}`)
  }

  const data = await res.json()
  return (data.results ?? []).map((j: Record<string, unknown>) => {
    const company = (j.company as Record<string, unknown> | undefined)
    const location = (j.location as Record<string, unknown> | undefined)
    return {
      id: String(j.id ?? ''),
      title: String(j.title ?? ''),
      company_name: String(company?.display_name ?? ''),
      description: String(j.description ?? ''),
      location: String(location?.display_name ?? country.toUpperCase()),
      salary_min: typeof j.salary_min === 'number' ? j.salary_min : null,
      salary_max: typeof j.salary_max === 'number' ? j.salary_max : null,
      redirect_url: String(j.redirect_url ?? ''),
      created: String(j.created ?? ''),
      country,
    }
  })
}

export function adzunaSourceKey(country: AdzunaCountryCode): string {
  return `adzuna_${country}`
}

export function formatAdzunaSalary(min: number | null, max: number | null): { minStr: string; maxStr: string } {
  return {
    minStr: min ? String(Math.round(min)) : '',
    maxStr: max ? String(Math.round(max)) : '',
  }
}
