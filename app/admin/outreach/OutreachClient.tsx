'use client'
import { useState } from 'react'
import { Plus, Mail, MessageCircle, ChevronRight, Bell, Pencil, Check, Phone } from 'lucide-react'
import OutreachModal from './OutreachModal'
import CallScheduleModal from './CallScheduleModal'
import { COLUMNS, NEXT_STATUS, TZ_OPTIONS, toHHMM, frenchDate, type Contact, type Status } from './types'

// ── Time helpers ──────────────────────────────────────────────────────────────

function callBadgeProps(utcIso: string): { text: string; cls: string } {
  const now     = Date.now()
  const nowDay  = Date.UTC(...(([y,m,d]) => [y,m,d] as [number,number,number])(
    [new Date(now).getUTCFullYear(), new Date(now).getUTCMonth(), new Date(now).getUTCDate()]
  ))
  const callMs  = new Date(utcIso).getTime()
  const callDay = Date.UTC(...(([y,m,d]) => [y,m,d] as [number,number,number])(
    [new Date(callMs).getUTCFullYear(), new Date(callMs).getUTCMonth(), new Date(callMs).getUTCDate()]
  ))
  const diffDays = Math.round((callDay - nowDay) / 86400000)

  if (diffDays < 0)  return { text: 'OVERDUE',  cls: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' }
  if (diffDays === 0) return { text: '📅 TODAY',    cls: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' }
  if (diffDays === 1) return { text: '📅 TOMORROW', cls: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' }
  return { text: `In ${diffDays} days`, cls: 'bg-slate-100 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400' }
}

function formatCallShort(utcIso: string, tzLabel: string): string {
  const utc = new Date(utcIso)
  const tz  = TZ_OPTIONS.find(t => t.label === tzLabel)
  if (!tz) return ''
  const contactTime = toHHMM(utc, tz.offset)
  if (tz.label === 'Vietnam') return `${contactTime} (Vietnam)`
  const vnTime = toHHMM(utc, 7)
  return `${contactTime} (${tz.label}) · ${vnTime} (VN)`
}

function formatUpcomingCall(c: Contact): string {
  if (!c.call_scheduled_at) return ''
  const tz = TZ_OPTIONS.find(t => t.label === c.call_timezone) ?? TZ_OPTIONS[1]
  const utc = new Date(c.call_scheduled_at)
  const day = frenchDate(c.call_scheduled_at, tz.offset)
  const contactTime = toHHMM(utc, tz.offset)
  const vnTime      = toHHMM(utc, 7)
  if (tz.label === 'Vietnam') return `${day} à ${vnTime} (Vietnam)`
  return `${day} à ${contactTime} (${tz.label}) / ${vnTime} (Vietnam)`
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ChannelBadge({ channel }: { channel: string }) {
  if (channel === 'LinkedIn') return (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded text-[9px] font-bold bg-[#0A66C2] text-white flex-shrink-0">in</span>
  )
  if (channel === 'WhatsApp') return <MessageCircle size={14} className="text-green-500 flex-shrink-0" />
  return <Mail size={14} className="text-slate-400 flex-shrink-0" />
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="card py-4 px-5 text-center">
      <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{value}</div>
      <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-primary dark:text-blue-400 font-semibold mt-0.5">{sub}</div>}
    </div>
  )
}

function KanbanCard({
  contact, onEdit, onNext, onDragStart,
}: {
  contact: Contact
  onEdit: () => void
  onNext: (() => void) | null
  onDragStart: (e: React.DragEvent) => void
}) {
  const today   = new Date().toISOString().split('T')[0]
  const overdue = contact.follow_up_date && contact.follow_up_date < today
  const daysAgo = Math.floor((Date.now() - new Date(contact.created_at).getTime()) / 86400000)

  const hasBadge = contact.status === 'call_scheduled' && contact.call_scheduled_at
  const badge    = hasBadge ? callBadgeProps(contact.call_scheduled_at!) : null

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group"
    >
      <div className="flex items-start justify-between gap-1 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <ChannelBadge channel={contact.channel} />
          <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">{contact.name}</span>
        </div>
        <button
          onClick={onEdit}
          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-primary dark:hover:text-blue-400 transition-all p-0.5 rounded flex-shrink-0"
          aria-label="Edit"
        >
          <Pencil size={12} />
        </button>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 mb-2">
        <span>{daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`}</span>
        {contact.promo_code_given && (
          <span className="flex items-center gap-0.5 text-green-600 dark:text-green-400">
            <Check size={10} /> promo
          </span>
        )}
      </div>

      {/* Call badge */}
      {badge && (
        <div className={`text-[10px] font-semibold rounded-md px-2 py-1 mb-1 ${badge.cls}`}>
          {badge.text}
        </div>
      )}

      {/* Call time */}
      {contact.call_scheduled_at && contact.call_timezone && (
        <div className="text-[10px] text-violet-600 dark:text-violet-400 mb-2 flex items-center gap-1">
          <Phone size={9} />
          {formatCallShort(contact.call_scheduled_at, contact.call_timezone)}
        </div>
      )}

      {/* Follow-up overdue */}
      {overdue && (
        <div className="flex items-center gap-1 text-[10px] font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-md px-2 py-1 mb-2">
          <Bell size={10} /> Follow up {contact.follow_up_date}
        </div>
      )}

      {contact.notes && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-2 leading-relaxed">
          {contact.notes}
        </p>
      )}

      {onNext && (
        <button
          onClick={onNext}
          className="w-full flex items-center justify-center gap-1 text-[11px] text-primary dark:text-blue-400 hover:bg-primary/5 dark:hover:bg-blue-500/10 rounded-lg py-1 transition-colors border border-transparent hover:border-primary/20 dark:hover:border-blue-500/20"
        >
          Move forward <ChevronRight size={11} />
        </button>
      )}
    </div>
  )
}

// ── Main client component ─────────────────────────────────────────────────────

export default function OutreachClient({ initialContacts }: { initialContacts: Contact[] }) {
  const [contacts,    setContacts]    = useState<Contact[]>(initialContacts)
  const [modal,       setModal]       = useState<{ mode: 'add' | 'edit'; contact?: Contact } | null>(null)
  const [pendingCall, setPendingCall] = useState<{ id: string; name: string } | null>(null)
  const [dragOver,    setDragOver]    = useState<Status | null>(null)
  const [draggingId,  setDraggingId]  = useState<string | null>(null)

  // ── Stats ──────────────────────────────────────────────────────────────────
  const total     = contacts.length
  const replied   = contacts.filter(c => ['replied','call_scheduled','converted'].includes(c.status)).length
  const calls     = contacts.filter(c => c.status === 'call_scheduled').length
  const converted = contacts.filter(c => c.status === 'converted').length
  const rate      = total ? Math.round(converted / total * 100) : 0

  // Upcoming calls: call_scheduled within next 7 days (incl. today, incl. overdue today)
  const upcomingCalls = contacts
    .filter(c => c.status === 'call_scheduled' && c.call_scheduled_at)
    .filter(c => new Date(c.call_scheduled_at!).getTime() <= Date.now() + 7 * 86400000)
    .sort((a, b) => new Date(a.call_scheduled_at!).getTime() - new Date(b.call_scheduled_at!).getTime())

  // ── API helpers ────────────────────────────────────────────────────────────
  async function apiAdd(data: Partial<Contact>) {
    const res = await fetch('/api/outreach', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    })
    const { contact } = await res.json()
    if (contact) setContacts(prev => [contact, ...prev])
    setModal(null)
  }

  async function apiEdit(id: string, data: Partial<Contact>) {
    const res = await fetch(`/api/outreach/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    })
    const { contact } = await res.json()
    if (contact) setContacts(prev => prev.map(c => c.id === id ? contact : c))
    setModal(null)
  }

  async function apiDelete(id: string) {
    await fetch(`/api/outreach/${id}`, { method: 'DELETE' })
    setContacts(prev => prev.filter(c => c.id !== id))
    setModal(null)
  }

  async function moveContact(id: string, newStatus: Status, callData?: { call_scheduled_at: string; call_timezone: string }) {
    const clearCall = newStatus !== 'call_scheduled'
    setContacts(prev => prev.map(c => c.id === id ? {
      ...c, status: newStatus,
      ...(callData ?? {}),
      ...(clearCall ? { call_scheduled_at: null, call_timezone: null } : {}),
    } : c))
    await fetch(`/api/outreach/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: newStatus,
        ...(callData ?? {}),
        ...(clearCall ? { call_scheduled_at: null, call_timezone: null } : {}),
      }),
    })
  }

  function requestCallSchedule(id: string) {
    const c = contacts.find(c => c.id === id)
    setPendingCall({ id, name: c?.name ?? '' })
  }

  async function confirmCallSchedule(utcIso: string, tz: string) {
    if (!pendingCall) return
    const { id } = pendingCall
    setPendingCall(null)
    await moveContact(id, 'call_scheduled', { call_scheduled_at: utcIso, call_timezone: tz })
  }

  // ── DnD handlers ──────────────────────────────────────────────────────────
  function onDragStart(e: React.DragEvent, id: string) {
    e.dataTransfer.setData('contactId', id)
    e.dataTransfer.effectAllowed = 'move'
    setDraggingId(id)
  }
  function onDragEnd()  { setDraggingId(null); setDragOver(null) }
  function onDragOver(e: React.DragEvent)  { e.preventDefault() }
  function onDragEnter(s: Status) { setDragOver(s) }

  function onDrop(e: React.DragEvent, status: Status) {
    e.preventDefault()
    const id = e.dataTransfer.getData('contactId')
    if (id) {
      if (status === 'call_scheduled') {
        requestCallSchedule(id)
      } else {
        moveContact(id, status)
      }
    }
    setDragOver(null)
    setDraggingId(null)
  }

  return (
    <>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <a href="/admin" className="text-sm text-primary dark:text-blue-400 hover:underline">← Admin Panel</a>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Outreach Tracker</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Early adopter pipeline — LinkedIn · WhatsApp · Email</p>
        </div>
        <button
          onClick={() => setModal({ mode: 'add' })}
          className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5"
        >
          <Plus size={15} /> Add Contact
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <Stat label="Total contacted" value={total} />
        <Stat label="Replied" value={replied} />
        <Stat label="Calls scheduled" value={calls} />
        <Stat label="Converted" value={converted} />
        <Stat label="Conversion rate" value={`${rate}%`} sub={total > 0 ? `${converted}/${total}` : '—'} />
      </div>

      {/* ── Upcoming Calls ── */}
      {upcomingCalls.length > 0 && (
        <div className="mb-8 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Phone size={14} className="text-violet-600 dark:text-violet-400" />
            <h2 className="text-sm font-semibold text-violet-800 dark:text-violet-300">Upcoming Calls — 7 days</h2>
          </div>
          <div className="space-y-2">
            {upcomingCalls.map(c => {
              const badge = callBadgeProps(c.call_scheduled_at!)
              return (
                <div key={c.id} className="flex items-start gap-3 bg-white dark:bg-slate-900 rounded-xl px-4 py-3 border border-violet-100 dark:border-violet-800/50">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 flex-shrink-0 ${badge.cls}`}>
                    {badge.text}
                  </span>
                  <div className="min-w-0">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{c.name}</span>
                    <span className="text-slate-400 mx-1.5">—</span>
                    <span className="text-sm text-slate-600 dark:text-slate-400">{formatUpcomingCall(c)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Kanban ── */}
      <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: '60vh' }}>
        {COLUMNS.map(col => {
          const cards  = contacts.filter(c => c.status === col.key)
          const isOver = dragOver === col.key

          return (
            <div
              key={col.key}
              onDragEnter={() => onDragEnter(col.key)}
              onDragOver={onDragOver}
              onDrop={e => onDrop(e, col.key)}
              className={`flex-shrink-0 w-64 flex flex-col rounded-xl border-2 transition-colors ${
                isOver
                  ? 'border-primary/60 bg-primary/5 dark:bg-primary/10'
                  : `${col.color} bg-slate-50/60 dark:bg-slate-800/30`
              }`}
            >
              <div className="px-3 py-2.5 flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">
                  {col.emoji} {col.label}
                </span>
                <span className="text-xs text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-2 py-0.5">
                  {cards.length}
                </span>
              </div>

              <div className="flex-1 px-2 pb-2 space-y-2 overflow-y-auto">
                {cards.map(contact => (
                  <div key={contact.id} className={draggingId === contact.id ? 'opacity-40' : ''}>
                    <KanbanCard
                      contact={contact}
                      onEdit={() => setModal({ mode: 'edit', contact })}
                      onNext={NEXT_STATUS[contact.status]
                        ? () => {
                            const next = NEXT_STATUS[contact.status]!
                            if (next === 'call_scheduled') requestCallSchedule(contact.id)
                            else moveContact(contact.id, next)
                          }
                        : null
                      }
                      onDragStart={e => { onDragStart(e, contact.id) }}
                    />
                  </div>
                ))}

                {cards.length === 0 && (
                  <div className="text-center text-xs text-slate-400 dark:text-slate-600 py-8 px-2">
                    {col.key === 'call_scheduled' ? '📅 Drop here to schedule a call' : 'Drop contacts here'}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Edit/Add Modal ── */}
      {modal && (
        <OutreachModal
          mode={modal.mode}
          contact={modal.contact}
          onClose={() => setModal(null)}
          onSave={data => modal.mode === 'add' ? apiAdd(data) : apiEdit(modal.contact!.id, data)}
          onDelete={modal.mode === 'edit' ? () => apiDelete(modal.contact!.id) : undefined}
        />
      )}

      {/* ── Call Schedule Modal ── */}
      {pendingCall && (
        <CallScheduleModal
          contactName={pendingCall.name}
          onConfirm={confirmCallSchedule}
          onCancel={() => setPendingCall(null)}
        />
      )}
    </>
  )
}
