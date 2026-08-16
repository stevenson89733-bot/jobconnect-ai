// Shared by JobCard and the Company Profile page header — one initials
// convention, not two.
export function companyInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || name[0]?.toUpperCase() || '?'
}

// Legal-entity suffixes to strip before guessing a .com domain.
const LEGAL_SUFFIXES = /\b(inc|llc|corp|ltd|limited|gmbh|s\.?a\.?s?|plc|ag|bv|oy|ab|as|nv|pvt|co)\b\.?$/i
// Characters that can't appear in a hostname.
const NON_HOSTNAME = /[^a-z0-9-]/g

/**
 * Returns a Clearbit Logo API URL for a company name, or null if the name
 * produces an obviously invalid domain (empty, too short). The caller is
 * responsible for handling 404s via an onError handler — the browser loads
 * the image natively so no server round-trip is needed.
 *
 * Heuristic: strip legal suffixes + punctuation, lowercase, join → guess
 * a .com domain. Works well for major tech companies; silently falls back
 * to the letter avatar for anything Clearbit doesn't recognise.
 */
export function clearbitLogoUrl(companyName: string): string | null {
  const slug = companyName
    .trim()
    .replace(LEGAL_SUFFIXES, '')
    .trim()
    .toLowerCase()
    .replace(NON_HOSTNAME, '')
  if (slug.length < 2) return null
  return `https://logo.clearbit.com/${slug}.com`
}
