'use client'
import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { buildScheduledSlotDisplay } from '@/lib/formatScheduledAt'

/**
 * Renders an interview slot identically for both the employer and the
 * candidate. Two states, both explicit — a missing slot is a real state
 * ("date to be confirmed"), never a blank line or an "Invalid Date".
 *
 * Client-only formatting on purpose: the viewer's timezone comes from
 * Intl at render time (no per-user timezone is stored anywhere in this
 * project), which the server can't know. Rendering is deferred to after
 * mount so the server HTML and the first client paint agree — otherwise a
 * server-rendered UTC time would visibly flip to local time on hydration.
 */
export default function ScheduledSlot({
  scheduledAt,
  scheduledTimezone,
  className = '',
}: {
  scheduledAt: string | null
  scheduledTimezone: string | null
  className?: string
}) {
  const t = useTranslations('applicationStatus')
  const locale = useLocale()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!scheduledAt) {
    return <span className={`text-slate-600 dark:text-slate-400 ${className}`}>{t('slotToBeConfirmed')}</span>
  }

  // Pre-hydration placeholder — same height, no flash of a wrong (UTC) time.
  if (!mounted) return <span className={`text-slate-600 dark:text-slate-400 ${className}`}>…</span>

  const display = buildScheduledSlotDisplay(scheduledAt, scheduledTimezone, locale)
  if (!display) {
    // Unparseable value that somehow reached the DB — say so honestly
    // rather than rendering "Invalid Date".
    return <span className={`text-slate-600 dark:text-slate-400 ${className}`}>{t('slotToBeConfirmed')}</span>
  }

  return (
    <span className={`text-slate-700 dark:text-slate-300 ${className}`}>
      {display.viewer}{' '}
      <span className="text-slate-500 dark:text-slate-500">({display.viewerTimezone})</span>
      {display.origin && (
        <>
          {' · '}
          <span className="text-slate-500 dark:text-slate-500">
            {t('slotEmployerTime', { time: display.origin, zone: display.originTimezone ?? '' })}
          </span>
        </>
      )}
    </span>
  )
}
