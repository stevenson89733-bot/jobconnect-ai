// Shared by every "how long ago" label in the app (job cards, recruiter
// dashboard, application status). Built on the runtime's native
// Intl.RelativeTimeFormat rather than hand-translated strings — it covers
// all 11 supported locales' grammar (including Arabic's dual/plural forms)
// for free, and `numeric: 'auto'` naturally produces "yesterday"/"today"
// instead of "1 day ago" where that reads better.
//   'compact' — Intl "short" style ("3d ago" in en, "il y a 3 j" in fr)
//   'verbose' — Intl "long" style ("3 days ago" in en, "il y a 3 jours" in fr)
export function timeAgo(dateStr: string, locale: string, style: 'compact' | 'verbose' = 'compact'): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto', style: style === 'compact' ? 'short' : 'long' })

  if (days < 7) return rtf.format(-days, 'day')
  return rtf.format(-Math.floor(days / 7), 'week')
}
