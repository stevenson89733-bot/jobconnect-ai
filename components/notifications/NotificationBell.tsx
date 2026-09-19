'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ProLockButton from '@/components/ui/ProLockButton'

interface Notification {
  id: string
  message: string
  href: string
  read: boolean
  time: string
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', message: 'New job match: Senior Developer at Stripe',   href: '/jobs',                     read: false, time: '2 min ago'   },
  { id: '2', message: 'Your application was viewed by TechCorp',     href: '/candidate/applications',   read: false, time: '1 hour ago'  },
  { id: '3', message: 'Interview reminder: Tomorrow at 10am',        href: '/candidate/applications',   read: false, time: '3 hours ago' },
]

export default function NotificationBell() {
  const [open, setOpen]                   = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS)
  const ref                               = useRef<HTMLDivElement>(null)
  const router                            = useRouter()

  const unread = notifications.filter(n => !n.read).length

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markAllRead = () => setNotifications(n => n.map(x => ({ ...x, read: true })))

  const handleClick = (notif: Notification) => {
    setNotifications(n => n.map(x => x.id === notif.id ? { ...x, read: true } : x))
    setOpen(false)
    router.push(notif.href)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <span className="font-semibold text-sm text-gray-800">Notifications</span>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-[#57C7E3] hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-8">No notifications yet</p>
            ) : (
              notifications.map(n => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!n.read ? 'bg-[#57C7E3]/5' : ''}`}
                >
                  <div className="flex items-start gap-2">
                    <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${!n.read ? 'bg-[#57C7E3]' : ''}`} />
                    <div>
                      <p className="text-sm text-gray-700">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
          <div className="px-4 py-3 border-t border-gray-50 flex justify-center">
            <ProLockButton label="Unlock Pro alerts" size="sm" />
          </div>
        </div>
      )}
    </div>
  )
}
