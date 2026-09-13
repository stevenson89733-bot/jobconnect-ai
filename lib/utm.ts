const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const
const STORAGE_KEY = 'utm_params'

export type UtmParams = Partial<Record<typeof UTM_KEYS[number], string>>

/**
 * Reads UTM parameters from the current URL and persists them to localStorage.
 * Call on every page load — only overwrites if fresh UTM params are present,
 * so the first-touch attribution is preserved across navigation.
 */
export function captureUtmParams(): void {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)
  const found: UtmParams = {}
  for (const key of UTM_KEYS) {
    const val = params.get(key)
    if (val) found[key] = val
  }
  if (Object.keys(found).length > 0) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(found))
    } catch {
      // storage unavailable (private mode, quota exceeded) — silently skip
    }
  }
}

/** Returns the stored UTM params, or null if none have been captured. */
export function getStoredUtmParams(): UtmParams | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as UtmParams) : null
  } catch {
    return null
  }
}
