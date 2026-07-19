'use client'
import { useEffect, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { APPLICATION_STATUS_VARIANT, type ApplicationStatus } from '@/lib/applicationStatus'
import { Badge } from '@/components/ui/badge'
import type { CopilotSignal } from '@/app/api/copilot/signals/route'

const REFRESH_INTERVAL_MS = 5 * 60 * 1000
const DISMISS_KEY = 'copilot-dismissed'

// One line + one link per signal — reads real numbers/statuses already
// computed elsewhere (Career Progress, AI Match %, application status,
// profile completeness) into a plain sentence. Never invents an activity
// to fill a quiet day; 'idle' is a genuine, honest state.
function SignalRow({ signal }: { signal: CopilotSignal }) {
  const t = useTranslations('copilot')
  const tStatus = useTranslations('applicationStatus')

  switch (signal.type) {
    case 'appStatus':
      return (
        <div className="py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
          <p className="text-sm text-slate-700 dark:text-slate-300 mb-1.5">
            {t('appStatus', { company: signal.company, status: tStatus(signal.status as ApplicationStatus) })}
          </p>
          <div className="flex items-center justify-between">
            <Badge variant={APPLICATION_STATUS_VARIANT[signal.status as ApplicationStatus] ?? 'default'}>
              {tStatus(signal.status as ApplicationStatus)}
            </Badge>
            <Link href="/candidate" className="text-xs text-primary dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
              {t('viewApplications')}
            </Link>
          </div>
        </div>
      )
    case 'atsDelta':
      return (
        <div className="py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
          <p className="text-sm text-slate-700 dark:text-slate-300 mb-1.5">{t('atsDelta', signal)}</p>
          <Link href="/candidate/analytics" className="text-xs text-primary dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
            {t('viewProgress')}
          </Link>
        </div>
      )
    case 'newMatches':
      return (
        <div className="py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
          <p className="text-sm text-slate-700 dark:text-slate-300 mb-1.5">{t('newMatches', signal)}</p>
          <Link href="/jobs" className="text-xs text-primary dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
            {t('viewMatches')}
          </Link>
        </div>
      )
    case 'profileGap':
      return (
        <div className="py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
          <p className="text-sm text-slate-700 dark:text-slate-300 mb-1.5">
            {t(signal.field === 'title' ? 'profileGapTitle' : signal.field === 'skills' ? 'profileGapSkills' : 'profileGapGeneric')}
          </p>
          <Link href="/profile" className="text-xs text-primary dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
            {t('completeProfile')}
          </Link>
        </div>
      )
    case 'idle':
      return (
        <div className="py-3 text-center">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('idleTitle')}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{t('idleDesc')}</p>
        </div>
      )
  }
}

export default function CopilotWidget() {
  const pathname = usePathname()
  const t = useTranslations('copilot')
  const [signals, setSignals] = useState<CopilotSignal[] | null>(null)
  const [open, setOpen] = useState(false)
  const [dismissed, setDismissed] = useState(true) // starts hidden until we know it's not dismissed this session

  const fetchSignals = useCallback(async () => {
    try {
      const res = await fetch('/api/copilot/signals')
      if (!res.ok) return
      const data = await res.json()
      setSignals(data.signals ?? [])
    } catch {
      // Silent — the widget just doesn't appear rather than erroring the page.
    }
  }, [])

  useEffect(() => {
    setDismissed(sessionStorage.getItem(DISMISS_KEY) === '1')
    fetchSignals()
    const id = setInterval(fetchSignals, REFRESH_INTERVAL_MS)
    return () => clearInterval(id)
  }, [fetchSignals])

  function dismiss() {
    sessionStorage.setItem(DISMISS_KEY, '1')
    setDismissed(true)
    setOpen(false)
  }

  // Not on the public landing page, and nothing to show yet (still loading,
  // dismissed this session, or the API said this isn't a candidate).
  if (pathname === '/' || dismissed || !signals || signals.length === 0) return null

  const hasRealUpdate = signals.some((s) => s.type !== 'idle')

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-16 right-0 w-80 max-w-[calc(100vw-2.5rem)] rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white/95 dark:bg-card/95 backdrop-blur-md shadow-2xl dark:shadow-black/40 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary dark:text-blue-400" strokeWidth={1.75} />
                <span className="font-semibold text-sm text-slate-900 dark:text-white">{t('title')}</span>
              </div>
              <button
                onClick={dismiss}
                aria-label={t('closeLabel')}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </div>
            <div className="px-4 max-h-96 overflow-y-auto">
              {signals.map((signal, i) => (
                <SignalRow key={i} signal={signal} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((o) => !o)}
        aria-label={t('openLabel')}
        className="relative w-14 h-14 rounded-full bg-primary hover:bg-blue-700 text-white shadow-lg dark:shadow-black/40 flex items-center justify-center transition-colors"
      >
        <Sparkles className="w-6 h-6" strokeWidth={1.75} />
        {hasRealUpdate && !open && (
          <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-accent border-2 border-white dark:border-background" />
        )}
      </motion.button>
    </div>
  )
}
