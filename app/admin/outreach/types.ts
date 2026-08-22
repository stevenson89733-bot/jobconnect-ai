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
  call_timezone: string | null
  created_at: string
  updated_at: string
}

export type TzOption = { label: string; offset: number; flag: string }

export const TZ_OPTIONS: TzOption[] = [
  { label: 'Vietnam',      offset:  7, flag: '🇻🇳' },
  { label: 'Montréal',    offset: -4, flag: '🇨🇦' },
  { label: 'Paris',        offset:  2, flag: '🇫🇷' },
  { label: 'London',       offset:  1, flag: '🇬🇧' },
  { label: 'New York',     offset: -5, flag: '🇺🇸' },
  { label: 'Los Angeles',  offset: -8, flag: '🇺🇸' },
]

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

// ── Time helpers ──────────────────────────────────────────────────────────────

const DAYS_FR   = ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi']
const MONTHS_FR = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']

export function toHHMM(utc: Date, offsetH: number): string {
  const local = new Date(utc.getTime() + offsetH * 3600000)
  const h  = local.getUTCHours()
  const m  = local.getUTCMinutes().toString().padStart(2, '0')
  const h12 = h % 12 || 12
  return `${h12}h${m} ${h >= 12 ? 'PM' : 'AM'}`
}

export function frenchDate(utcIso: string, offsetH: number): string {
  const d = new Date(new Date(utcIso).getTime() + offsetH * 3600000)
  return `${DAYS_FR[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS_FR[d.getUTCMonth()]}`
}

/** Convert UTC ISO + timezone label to local { date: 'YYYY-MM-DD', time: 'HH:MM' } */
export function utcToLocal(utcIso: string, tzLabel: string, tzOpts: TzOption[]): { date: string; time: string } {
  const tz   = tzOpts.find(t => t.label === tzLabel)
  const off  = tz?.offset ?? 0
  const d    = new Date(new Date(utcIso).getTime() + off * 3600000)
  return {
    date: `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`,
    time: `${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')}`,
  }
}

/** Convert local date+time+tz to UTC ISO */
export function localToUtc(date: string, time: string, tzLabel: string, tzOpts: TzOption[]): string {
  const tz = tzOpts.find(t => t.label === tzLabel)
  const off = tz?.offset ?? 0
  const [y, mo, d] = date.split('-').map(Number)
  const [h, mi]    = time.split(':').map(Number)
  return new Date(Date.UTC(y, mo - 1, d, h - off, mi)).toISOString()
}
