'use client'
import { useState } from 'react'
import { Plus, Mail, MessageCircle, ChevronRight, Bell, Pencil, Check } from 'lucide-react'
import OutreachModal from './OutreachModal'
import { COLUMNS, NEXT_STATUS, type Contact, type Status } from './types'

// ── Channel icon ──────────────────────────────────────────────────────────────
function ChannelBadge({ channel }: { channel: string }) {
  if (channel === 'LinkedIn') return (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded text-[9px] font-bold bg-[#0A66C2] text-white flex-shrink-0">in</span>
  )
  if (channel === 'WhatsApp') return (
    <MessageCircle size={14} className="text-green-500 flex-shrink-0" />
  )
  return <Mail size={14} className="text-slate-400 flex-shrink-0" />
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="card py-4 px-5 text-center">
      <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{value}</div>
      <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-primary dark:text-blue-400 font-semibold mt-0.5">{sub}</div>}
    </div>
  )
}

// ── Kanban card ───────────────────────────────────────────────────────────────
function KanbanCard({
  contact,
  onEdit,
  onNext,
  onDragStart,
}: {
  contact: Contact
  onEdit: () => void
  onNext: (() => void) | null
  onDragStart: (e: React.DragEvent) => void
}) {
  const today    = new Date().toISOString().split('T')[0]
  const overdue  = contact.follow_up_date && contact.follow_up_date < today
  const daysAgo  = Math.floor((Date.now() - new Date(contact.created_at).getTime()) / 86400000)

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

      {overdue && (
        <div className="flex items-center gap-1 text-[10px] font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-md px-2 py-1 mb-2">
          <Bell size={10} />
          Follow up {contact.follow_up_date}
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
  const [contacts, setContacts] = useState<Contact[]>(initialContacts)
  const [modal, setModal]       = useState<{ mode: 'add' | 'edit'; contact?: Contact } | null>(null)
  const [dragOver, setDragOver] = useState<Status | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)

  // ── Stats ──────────────────────────────────────────────────────────────────
  const total     = contacts.length
  const replied   = contacts.filter(c => ['replied','call_scheduled','converted'].includes(c.status)).length
  const calls     = contacts.filter(c => c.status === 'call_scheduled').length
  const converted = contacts.filter(c => c.status === 'converted').length
  const rate      = total ? Math.round(converted / total * 100) : 0

  // ── API helpers ────────────────────────────────────────────────────────────
  async function apiAdd(data: Partial<Contact>) {
    const res = await fetch('/api/outreach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const { contact } = await res.json()
    if (contact) setContacts(prev => [contact, ...prev])
    setModal(null)
  }

  async function apiEdit(id: string, data: Partial<Contact>) {
    const res = await fetch(`/api/outreach/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
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

  async function moveContact(id: string, newStatus: Status) {
    // Optimistic update
    setContacts(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c))
    await fetch(`/api/outreach/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
  }

  // ── DnD handlers ──────────────────────────────────────────────────────────
  function onDragStart(e: React.DragEvent, id: string) {
    e.dataTransfer.setData('contactId', id)
    e.dataTransfer.effectAllowed = 'move'
    setDraggingId(id)
  }

  function onDragEnd() {
    setDraggingId(null)
    setDragOver(null)
  }

  function onDragEnter(status: Status) { setDragOver(status) }
  function onDragOver(e: React.DragEvent)  { e.preventDefault() }

  function onDrop(e: React.DragEvent, status: Status) {
    e.preventDefault()
    const id = e.dataTransfer.getData('contactId')
    if (id) moveContact(id, status)
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
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
        <Stat label="Total contacted" value={total} />
        <Stat label="Replied" value={replied} />
        <Stat label="Calls scheduled" value={calls} />
        <Stat label="Converted" value={converted} />
        <Stat label="Conversion rate" value={`${rate}%`} sub={total > 0 ? `${converted}/${total}` : '—'} />
      </div>

      {/* ── Kanban ── */}
      <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: '60vh' }}>
        {COLUMNS.map(col => {
          const cards = contacts.filter(c => c.status === col.key)
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
              {/* Column header */}
              <div className="px-3 py-2.5 flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">
                  {col.emoji} {col.label}
                </span>
                <span className="text-xs text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-2 py-0.5">
                  {cards.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 px-2 pb-2 space-y-2 overflow-y-auto">
                {cards.map(contact => (
                  <div
                    key={contact.id}
                    className={draggingId === contact.id ? 'opacity-40' : ''}
                  >
                    <KanbanCard
                      contact={contact}
                      onEdit={() => setModal({ mode: 'edit', contact })}
                      onNext={NEXT_STATUS[contact.status]
                        ? () => moveContact(contact.id, NEXT_STATUS[contact.status]!)
                        : null
                      }
                      onDragStart={e => onDragStart(e, contact.id)}
                    />
                  </div>
                ))}

                {cards.length === 0 && (
                  <div className="text-center text-xs text-slate-400 dark:text-slate-600 py-8 px-2">
                    Drop contacts here
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Modal ── */}
      {modal && (
        <OutreachModal
          mode={modal.mode}
          contact={modal.contact}
          onClose={() => setModal(null)}
          onSave={data => modal.mode === 'add'
            ? apiAdd(data)
            : apiEdit(modal.contact!.id, data)
          }
          onDelete={modal.mode === 'edit' ? () => apiDelete(modal.contact!.id) : undefined}
        />
      )}
    </>
  )
}
