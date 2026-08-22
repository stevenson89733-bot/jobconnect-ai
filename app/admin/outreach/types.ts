export type Status  = 'contacted' | 'replied' | 'call_scheduled' | 'converted' | 'not_interested'
export type Channel = 'LinkedIn' | 'WhatsApp' | 'Email'

export type Contact = {
  id: string
  name: string
  channel: Channel
  status: Status
  notes: string | null
  promo_code_given: boolean
  follow_up_date: string | null
  call_scheduled_at: string | null
  call_timezone: string | null   // IANA timezone string, e.g. "America/Toronto"
  created_at: string
  updated_at: string
}

export const COLUMNS: { key: Status; emoji: string; label: string; color: string }[] = [
  { key: 'contacted',      emoji: '📤', label: 'Contacted',      color: 'border-slate-300 dark:border-slate-600' },
  { key: 'replied',        emoji: '💬', label: 'Replied',         color: 'border-blue-300 dark:border-blue-700' },
  { key: 'call_scheduled', emoji: '📅', label: 'Call Scheduled',  color: 'border-violet-300 dark:border-violet-700' },
  { key: 'converted',      emoji: '✅', label: 'Converted',       color: 'border-green-300 dark:border-green-700' },
  { key: 'not_interested', emoji: '❌', label: 'Not Interested',  color: 'border-red-300 dark:border-red-700' },
]

export const NEXT_STATUS: Partial<Record<Status, Status>> = {
  contacted:      'replied',
  replied:        'call_scheduled',
  call_scheduled: 'converted',
}

// ── Timezone helpers ───────────────────────────────────────────────────────────

export const REGION_ORDER = [
  'America', 'Europe', 'Asia', 'Africa', 'Australia', 'Pacific',
  'Atlantic', 'Indian', 'Arctic', 'Antarctica', 'Etc',
]

export function getSupportedTimezones(): string[] {
  try {
    return (Intl as unknown as { supportedValuesOf(k: string): string[] }).supportedValuesOf('timeZone')
  } catch {
    return [
      'UTC',
      'America/New_York','America/Chicago','America/Denver','America/Los_Angeles',
      'America/Toronto','America/Vancouver','America/Sao_Paulo','America/Mexico_City',
      'Europe/London','Europe/Paris','Europe/Berlin','Europe/Amsterdam',
      'Europe/Rome','Europe/Madrid','Europe/Warsaw',
      'Asia/Dubai','Asia/Karachi','Asia/Kolkata','Asia/Dhaka',
      'Asia/Bangkok','Asia/Ho_Chi_Minh','Asia/Singapore',
      'Asia/Hong_Kong','Asia/Shanghai','Asia/Tokyo','Asia/Seoul',
      'Africa/Cairo','Africa/Lagos','Africa/Nairobi','Africa/Johannesburg',
      'Australia/Sydney','Australia/Melbourne',
      'Pacific/Auckland','Pacific/Honolulu',
    ]
  }
}

/** Get numeric UTC offset in hours for an IANA timezone at a given date */
export function getOffsetHours(tz: string, date: Date = new Date()): number {
  try {
    const fmt = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    })
    const parts = fmt.formatToParts(date)
    const get   = (t: string) => parseInt(parts.find(p => p.type === t)?.value ?? '0')
    let h = get('hour')
    if (h === 24) h = 0
    const localMs = Date.UTC(get('year'), get('month') - 1, get('day'), h, get('minute'), get('second'))
    return Math.round((localMs - date.getTime()) / 3600000)
  } catch {
    return 0
  }
}

/** UTC offset string for display, e.g. "UTC+7", "UTC-4" */
export function getUtcOffsetStr(tz: string, date: Date = new Date()): string {
  try {
    const fmt = new Intl.DateTimeFormat('en', { timeZone: tz, timeZoneName: 'shortOffset' })
    const gmt = fmt.formatToParts(date).find(p => p.type === 'timeZoneName')?.value ?? 'GMT+0'
    return gmt.replace('GMT', 'UTC')
  } catch {
    return 'UTC'
  }
}

/** Format a UTC date as local time in an IANA timezone, e.g. "9:15 PM" */
export function formatTimeInTZ(utcDate: Date, tz: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hour: 'numeric', minute: '2-digit', hour12: true,
    }).format(utcDate)
  } catch {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'UTC', hour: 'numeric', minute: '2-digit', hour12: true,
    }).format(utcDate) + ' (UTC)'
  }
}

// ── Date/time conversion helpers ───────────────────────────────────────────────

const DAYS_FR   = ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi']
const MONTHS_FR = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']

/** French date string in an IANA timezone, e.g. "mardi 25 août" */
export function frenchDateInTZ(utcIso: string, tz: string): string {
  try {
    const d   = new Date(utcIso)
    const off = getOffsetHours(tz, d)
    const adj = new Date(d.getTime() + off * 3600000)
    return `${DAYS_FR[adj.getUTCDay()]} ${adj.getUTCDate()} ${MONTHS_FR[adj.getUTCMonth()]}`
  } catch {
    const d = new Date(utcIso)
    return `${DAYS_FR[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS_FR[d.getUTCMonth()]}`
  }
}

/** UTC ISO → local { date: 'YYYY-MM-DD', time: 'HH:MM' } in an IANA timezone */
export function utcToLocal(utcIso: string, tz: string): { date: string; time: string } {
  try {
    const d   = new Date(utcIso)
    const fmt = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    })
    const parts = fmt.formatToParts(d)
    const get   = (t: string) => parts.find(p => p.type === t)?.value ?? '00'
    let h = get('hour')
    if (h === '24') h = '00'
    return { date: `${get('year')}-${get('month')}-${get('day')}`, time: `${h}:${get('minute')}` }
  } catch {
    const d = new Date(utcIso)
    return {
      date: d.toISOString().split('T')[0],
      time: d.toISOString().split('T')[1].substring(0, 5),
    }
  }
}

/** Local date+time+IANA TZ → UTC ISO (two-pass for DST accuracy) */
export function localToUtc(date: string, time: string, tz: string): string {
  const [y, mo, d] = date.split('-').map(Number)
  const [h, mi]    = time.split(':').map(Number)
  const approx = new Date(Date.UTC(y, mo - 1, d, h, mi))
  const off1   = getOffsetHours(tz, approx)
  const guess2 = new Date(Date.UTC(y, mo - 1, d, h - off1, mi))
  const off2   = getOffsetHours(tz, guess2)
  return new Date(Date.UTC(y, mo - 1, d, h - off2, mi)).toISOString()
}
