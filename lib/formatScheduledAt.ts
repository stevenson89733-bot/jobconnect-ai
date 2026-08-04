/**
 * Interview slot rendering — the app's first and only timezone-aware date
 * formatter. lib/timeAgo.ts is relative + locale-only (no timezone concept),
 * and the two inline toLocaleDateString calls elsewhere use the ambient
 * local zone implicitly; a scheduled interview needs an explicit, labeled
 * zone on both sides, so this is a shared helper rather than another
 * inline call.
 *
 * No per-user timezone is stored anywhere in this project (profiles.location
 * is free text, the country cookie drives currency display only), so the
 * viewer's zone is DETECTED at render time via Intl — always more accurate
 * than a stored preference that goes stale the moment someone travels.
 */

// The viewer's real zone, straight from the runtime. Falls back to UTC only
// if the environment somehow reports nothing (never guessed from country).
export function getViewerTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    return 'UTC'
  }
}

// One absolute instant rendered in one explicit zone, in the viewer's real
// locale. Returns null for a missing/unparseable value so callers render an
// explicit "to be confirmed" state — never an empty line or "Invalid Date".
export function formatInZone(iso: string | null | undefined, locale: string, timeZone: string): string | null {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null

  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone,
    }).format(date)
  } catch {
    // Unknown/invalid IANA zone (e.g. a hand-edited scheduled_timezone) —
    // fall back to the viewer's own zone rather than throwing, so the slot
    // still renders something true rather than breaking the page.
    try {
      return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(date)
    } catch {
      return null
    }
  }
}

// The list offered in the employer's zone picker. Intl.supportedValuesOf is
// the runtime's own IANA list (no hardcoded/stale zone table shipped in the
// bundle); older runtimes without it fall back to just the detected zone,
// which is still correct — only shorter.
export function listTimezones(): string[] {
  try {
    const supported = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf
    if (typeof supported === 'function') return supported('timeZone')
  } catch {
    // fall through
  }
  return [getViewerTimezone()]
}

// Converts an <input type="datetime-local"> value ("2026-08-14T09:00") plus
// an IANA zone into the real absolute instant.
//
// This cannot be `new Date(local)`: that parses the wall-clock string in the
// BROWSER's zone, which is wrong whenever the employer schedules in a zone
// other than their own. Instead: read the string as if it were UTC, ask Intl
// what wall clock that instant actually shows in the target zone, and shift
// by the difference. Handles DST correctly because the offset is resolved
// at that specific date, not assumed constant.
export function zonedWallClockToUtc(local: string, timeZone: string): Date | null {
  if (!local) return null
  const asUtc = new Date(`${local.length === 16 ? `${local}:00` : local}Z`)
  if (Number.isNaN(asUtc.getTime())) return null

  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    }).formatToParts(asUtc)

    const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
    // Intl renders midnight as hour "24" in some runtimes — normalize.
    const hour = get('hour') === 24 ? 0 : get('hour')
    const shown = Date.UTC(get('year'), get('month') - 1, get('day'), hour, get('minute'), get('second'))
    if (Number.isNaN(shown)) return null

    return new Date(asUtc.getTime() - (shown - asUtc.getTime()))
  } catch {
    return null
  }
}

export type ScheduledSlotDisplay = {
  /** The slot in the viewer's own detected timezone. */
  viewer: string
  viewerTimezone: string
  /**
   * The slot in the timezone the employer originally chose, when that
   * differs from the viewer's — so the two sides can talk about the same
   * meeting without ambiguity. Null when both zones agree (or when no
   * origin zone was recorded), so the UI shows a single unambiguous line
   * instead of the same time twice.
   */
  origin: string | null
  originTimezone: string | null
}

// A stored zone the runtime doesn't recognise (only reachable by hand-editing
// the DB — the picker only offers Intl's own list) must NOT be labeled on a
// time it wasn't actually rendered in: formatInZone falls back to the local
// zone, so labeling that as the employer's zone would state something untrue.
// Such a zone is dropped instead, leaving the viewer's own line only.
function isValidTimezone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone }).format(new Date())
    return true
  } catch {
    return false
  }
}

export function buildScheduledSlotDisplay(
  iso: string | null | undefined,
  scheduledTimezone: string | null | undefined,
  locale: string
): ScheduledSlotDisplay | null {
  const viewerTimezone = getViewerTimezone()
  const viewer = formatInZone(iso, locale, viewerTimezone)
  if (!viewer) return null

  const rawOrigin = scheduledTimezone?.trim() || null
  const originTimezone = rawOrigin && isValidTimezone(rawOrigin) ? rawOrigin : null
  // Compared by RENDERED TIME, not by zone identifier: IANA aliases are
  // common in the wild (a browser reporting Asia/Saigon while the picker
  // offers Asia/Ho_Chi_Minh, Europe/Kiev vs Europe/Kyiv, …), and two
  // genuinely different zones can share an offset on that date anyway
  // (Paris/Madrid). In every such case the second line would repeat the
  // first verbatim, so it's dropped — the line exists to resolve a real
  // difference, not to restate the same time under another label.
  const originFormatted = originTimezone ? formatInZone(iso, locale, originTimezone) : null
  const origin = originFormatted && originFormatted !== viewer ? originFormatted : null

  return {
    viewer,
    viewerTimezone,
    origin,
    originTimezone: origin ? originTimezone : null,
  }
}
