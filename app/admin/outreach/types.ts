export type Status = 'contacted' | 'replied' | 'call_scheduled' | 'converted' | 'not_interested'
export type Channel = 'LinkedIn' | 'WhatsApp' | 'Email'

export type Contact = {
  id: string
  name: string
  channel: Channel
  status: Status
  notes: string | null
  promo_code_given: boolean
  follow_up_date: string | null
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
