'use client'
import { useState, useEffect, useMemo } from 'react'
import { X, Phone } from 'lucide-react'
import { localToUtc, formatTimeInTZ, getUtcOffsetStr, getSupportedTimezones, REGION_ORDER } from './types'

type Props = {
  contactName: string
  onConfirm: (utcIso: string, tz: string) => void
  onCancel: () => void
}

export default function CallScheduleModal({ contactName, onConfirm, onCancel }: Props) {
  const tomorrow    = new Date(Date.now() + 86400000)
  const tomorrowStr = `${tomorrow.getUTCFullYear()}-${String(tomorrow.getUTCMonth()+1).padStart(2,'0')}-${String(tomorrow.getUTCDate()).padStart(2,'0')}`

  const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

  const [date, setDate] = useState(tomorrowStr)
  const [time, setTime] = useState('09:00')
  const [tz,   setTz]   = useState(browserTz)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel])

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

  // Live preview
  let previewContact = '—', previewVN = '—', previewUTC = '—'
  if (date && time) {
    try {
      const utcIso = localToUtc(date, time, tz)
      const utc    = new Date(utcIso)
      previewContact = formatTimeInTZ(utc, tz)
      previewVN      = formatTimeInTZ(utc, 'Asia/Ho_Chi_Minh')
      previewUTC     = `${String(utc.getUTCHours()).padStart(2,'0')}:${String(utc.getUTCMinutes()).padStart(2,'0')}`
    } catch { /* ignore */ }
  }

  function handleConfirm() {
    if (!date || !time) return
    onConfirm(localToUtc(date, time, tz), tz)
  }

  const inputCls = 'w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-400/40'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
              <Phone size={14} className="text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h2 className="font-semibold text-sm text-slate-900 dark:text-white">Schedule Call</h2>
              <p className="text-xs text-slate-400">{contactName}</p>
            </div>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Time</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} className={inputCls} />
            </div>
          </div>

          {/* Timezone — full IANA list grouped by region */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Timezone <span className="text-slate-400 font-normal">(auto-detected)</span>
            </label>
            <select value={tz} onChange={e => setTz(e.target.value)} className={inputCls}>
              {regions.map(region => (
                <optgroup key={region} label={region}>
                  {(grouped[region] ?? []).map(({ tz: z, label }) => (
                    <option key={z} value={z}>{label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Preview */}
          <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl px-4 py-3 space-y-1.5">
            <p className="text-xs font-semibold text-violet-700 dark:text-violet-300 mb-2">Preview</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 truncate max-w-[60%]">{tz}</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{previewContact}</span>
            </div>
            {tz !== 'Asia/Ho_Chi_Minh' && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">🇻🇳 Asia/Ho_Chi_Minh</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{previewVN}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs border-t border-violet-200 dark:border-violet-700/40 pt-1.5 mt-1">
              <span className="text-slate-400 dark:text-slate-500">UTC</span>
              <span className="font-mono text-slate-500 dark:text-slate-400">{previewUTC}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!date || !time}
              className="flex-1 py-2 text-sm bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors disabled:opacity-40"
            >
              Confirm Call
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
