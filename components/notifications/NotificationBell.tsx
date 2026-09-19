'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Notification = {
  id: string
  type: 'job_match' | 'application_status' | 'interview'
  title: string
  body: string
  href: string
  read: boolean
  created_at: string
}

const TYPE_ICON: Record<Notification['type'], string> = {
  job_match: '💼',
  application_status: '📋',
  interview: '🎤',
}

function timeAgo(dateStr: string) {
  const secs = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (secs < 60) return 'just now'
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`
  return `${Math.floor(secs / 86400)}d ago`
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const fetchNotifications = useCallback(async () => {
    const { data } = await supabase
      .from('notifications')
      .select('id, type, title, body, href, read, created_at')
      .order('created_at', { ascending: false })
      .limit(5)
    setNotifications((data as Notification[] | null) ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('notifications-bell')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        () => { fetchNotifications() }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase, fetchNotifications])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent) {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  async function markRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
    await supabase.from('notifications').update({ read: true }).eq('id', id)
  }

  async function markAllRead() {
    const ids = notifications.filter((n) => !n.read).map((n) => n.id)
    if (!ids.length) return
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    await supabase.from('notifications').update({ read: true }).in('id', ids)
  }

  function handleClick(n: Notification) {
    markRead(n.id)
    setOpen(false)
    router.push(n.href)
  }

  const unread = notifications.filter((n) => !n.read).length

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <Bell className="w-5 h-5" strokeWidth={1.75} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-full mt-2 w-[320px] bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-sm font-semibold text-slate-800 dark:text-white">Notifications</span>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs text-[#57C7E3] hover:underline font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          {loading ? (
            <div className="px-4 py-6 text-center text-sm text-slate-400">Loading…</div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-2xl mb-2">🔔</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">No notifications yet</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[360px] overflow-y-auto">
              {notifications.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => handleClick(n)}
                    className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                      !n.read ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                    }`}
                  >
                    <span className="text-lg shrink-0 mt-0.5">{TYPE_ICON[n.type]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-semibold text-slate-800 dark:text-white truncate">
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-[#57C7E3] shrink-0" />
                        )}
                      </div>
                      <p className="text-[12px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                        {n.body}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
