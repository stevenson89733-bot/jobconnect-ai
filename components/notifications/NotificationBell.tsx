'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'

type Notification = {
  id: string
  type: 'job_match' | 'application_status' | 'interview'
  title: string
  body: string
  href: string
  read: boolean
  time: string
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'job_match',
    title: 'New job match',
    body: 'Senior Frontend Engineer at Stripe — 92% match',
    href: '/jobs',
    read: false,
    time: '2m ago',
  },
  {
    id: '2',
    type: 'application_status',
    title: 'Application update',
    body: 'Vercel moved your application to Interview stage',
    href: '/candidate/applications',
    read: false,
    time: '1h ago',
  },
  {
    id: '3',
    type: 'interview',
    title: 'Interview reminder',
    body: 'You have an interview with Notion tomorrow at 10:00 AM',
    href: '/candidate/applications',
    read: false,
    time: '3h ago',
  },
  {
    id: '4',
    type: 'job_match',
    title: 'New job match',
    body: 'Full-Stack Engineer at Linear — 87% match',
    href: '/jobs',
    read: true,
    time: '1d ago',
  },
]

const TYPE_ICON: Record<Notification['type'], string> = {
  job_match: '💼',
  application_status: '📋',
  interview: '🎤',
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const router = useRouter()

  const unread = notifications.filter((n) => !n.read).length

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

  function markRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  function handleClick(n: Notification) {
    markRead(n.id)
    setOpen(false)
    router.push(n.href)
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

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
                    <p className="text-[11px] text-slate-400 mt-1">{n.time}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>

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
