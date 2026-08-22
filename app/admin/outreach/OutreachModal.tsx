'use client'
import { useState, useEffect, useMemo } from 'react'
import { X, Phone } from 'lucide-react'
import {
  utcToLocal, localToUtc, formatTimeInTZ, getUtcOffsetStr,
  getSupportedTimezones, REGION_ORDER, type Contact,
} from './types'

const CHANNELS = ['LinkedIn', 'WhatsApp', 'Email'] as const
const STATUSES = [
  { value: 'contacted',      label: '📤 Contacted' },
  { value: 'replied',        label: '💬 Replied' },
  { value: 'call_scheduled', label: '📅 Call Scheduled' },
  { value: 'converted',      label: '✅ Converted' },
  { value: 'not_interested', label: '❌ Not Interested' },
]

type Props = {
  mode: 'add' | 'edit'
  contact?: Contact
  onClose: () => void
  onSave: (data: Partial<Contact>) => Promise<void>
  onDelete?: () => Promise<void>
}

export default function OutreachModal({ mode, contact, onClose, onSave, onDelete }: Props) {
  const [name,       setName]      = useState(contact?.name ?? '')
  const [channel,    setChannel]   = useState<Contact['channel']>(contact?.channel ?? 'LinkedIn')
  const [status,     setStatus]    = useState<string>(contact?.status ?? 'contacted')
  const [notes,      setNotes]     = useState(contact?.notes ?? '')
  const [followUp,   setFollowUp]  = useState(contact?.follow_up_date ?? '')
  const [promo,      setPromo]     = useState(contact?.promo_code_given ?? false)
  const [saving,     setSaving]    = useState(false)
  const [deleting,   setDeleting]  = useState(false)
  const [confirmDel, setConfirm]   = useState(false)

  // Call scheduling fields
  const initTz    = contact?.call_timezone ?? (Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC')
  const initLocal = contact?.call_scheduled_at ? utcToLocal(contact.call_scheduled_at, initTz) : null
  const [callDate, setCallDate] = useState(initLocal?.date ?? '')
  const [callTime, setCallTime] = useState(initLocal?.time ?? '09:00')
  const [callTz,   setCallTz]   = useState(initTz)

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // Grouped timezone list — computed once at mount
  const { grouped, regions } = useMemo(() => {
    const all = getSupportedTimezones()
    const now = new Date()
    const map: Record<string, Array<{ tz: string; label: string }>> = {}
    for (const z of all) {
      const region = z.includes('/') ? z.split('/')[0] : 'Other'
      if (!map[region]) map[region] = []
      map[region].push({ tz: z, label: `${z} (${getUtcOffsetStr(z, now)})` })
    }
    const ordered = [
      ...REGION_ORDER.filter(r => map[r]),
      ...Object.keys(map).filter(r => !REGION_ORDER.includes(r)),
    ]
    return { grouped: map, regions: ordered }
  }, [])

  // Live call preview
  let previewContact = '—', previewVN = '—', previewUTC = '—'
  if (status === 'call_scheduled' && callDate && callTime) {
    try {
      const utcIso = localToUtc(callDate, callTime, callTz)
      const utc    = new Date(utcIso)
      previewContact = formatTimeInTZ(utc, callTz)
      previewVN      = formatTimeInTZ(utc, 'Asia/Ho_Chi_Minh')
      previewUTC     = `${String(utc.getUTCHours()).padStart(2,'0')}:${String(utc.getUTCMinutes()).padStart(2,'0')}`
    } catch { /* ignore */ }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    let call_scheduled_at: string | null = null
    let call_timezone: string | null     = null
    if (status === 'call_scheduled' && callDate && callTime) {
      call_scheduled_at = localToUtc(callDate, callTime, callTz)
      call_timezone     = callTz
    }
    await onSave({
      name: name.trim(), channel,
      status: status as Contact['status'],
      notes: notes.trim() || null,
      follow_up_date: followUp || null,
      promo_code_given: promo,
      call_scheduled_at,
      call_timezone,
    })
    setSaving(false)
  }

  async function handleDelete() {
    if (!onDelete) return
    setDeleting(true)
    await onDelete()
    setDeleting(false)
  }

  const inputCls = 'w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-white">
            {mode === 'add' ? 'Add Contact' : 'Edit Contact'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Name *</label>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              required placeholder="Jean Dupont" autoFocus className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Channel</label>
              <select value={channel} onChange={e => setChannel(e.target.value as Contact['channel'])} className={inputCls}>
                {CHANNELS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            {mode === 'edit' && (
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)} className={inputCls}>
                  {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* Call scheduling — shown when status is call_scheduled */}
          {status === 'call_scheduled' && (
            <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Phone size={12} className="text-violet-600 dark:text-violet-400" />
                <span className="text-xs font-semibold text-violet-700 dark:text-violet-300">Call details</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Date</label>
                  <input type="date" value={callDate} onChange={e => setCallDate(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Time</label>
                  <input type="time" value={callTime} onChange={e => setCallTime(e.target.value)} className={inputCls} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Timezone</label>
                <select value={callTz} onChange={e => setCallTz(e.target.value)} className={inputCls}>
                  {regions.map(region => (
                    <optgroup key={region} label={region}>
                      {(grouped[region] ?? []).map(({ tz: z, label }) => (
                        <option key={z} value={z}>{label}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {callDate && callTime && (
                <div className="flex flex-col gap-1 text-xs pt-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400 truncate max-w-[60%]">{callTz}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{previewContact}</span>
                  </div>
                  {callTz !== 'Asia/Ho_Chi_Minh' && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">🇻🇳 Asia/Ho_Chi_Minh</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{previewVN}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-violet-200 dark:border-violet-800/40 pt-1 mt-0.5">
                    <span className="text-slate-400">UTC</span>
                    <span className="font-mono text-slate-500 dark:text-slate-400">{previewUTC}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Follow-up date</label>
            <input type="date" value={followUp} onChange={e => setFollowUp(e.target.value)} className={inputCls} />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Notes</label>
            <textarea
              value={notes} onChange={e => setNotes(e.target.value)}
              rows={3} placeholder="Conversation notes, interests, context…"
              className={`${inputCls} resize-none`}
            />
          </div>

          {mode === 'edit' && (
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input type="checkbox" checked={promo} onChange={e => setPromo(e.target.checked)} className="w-4 h-4 rounded accent-primary" />
              <span className="text-sm text-slate-700 dark:text-slate-300">🎟️ Promo code given</span>
            </label>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button type="submit" disabled={saving || !name.trim()} className="btn-primary text-sm py-2 px-5 disabled:opacity-50 flex-1">
              {saving ? 'Saving…' : mode === 'add' ? 'Add Contact' : 'Save Changes'}
            </button>

            {mode === 'edit' && onDelete && (
              confirmDel ? (
                <button type="button" onClick={handleDelete} disabled={deleting} className="text-xs text-red-600 dark:text-red-400 hover:underline px-2 py-2 disabled:opacity-50">
                  {deleting ? 'Deleting…' : 'Confirm delete'}
                </button>
              ) : (
                <button type="button" onClick={() => setConfirm(true)} className="text-xs text-slate-400 hover:text-red-500 dark:hover:text-red-400 px-2 py-2 transition-colors">
                  Delete
                </button>
              )
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
