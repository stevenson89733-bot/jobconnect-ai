'use client'
import { useState } from 'react'
import { updateApplicationStatus } from '@/app/actions/applications'
import { APPLICATION_STATUSES, APPLICATION_STATUS_LABEL, APPLICATION_STATUS_VARIANT, type ApplicationStatus } from '@/lib/applicationStatus'
import { timeAgo } from '@/lib/timeAgo'
import { Badge } from '@/components/ui/badge'

// Real employer-facing status control — ownership is enforced by the RLS
// policy the server action relies on (an employer can only ever affect
// applications to jobs they actually posted), not by anything client-side.
export default function ApplicationStatusControl({
  applicationId,
  initialStatus,
  initialStatusUpdatedAt,
}: {
  applicationId: string
  initialStatus: ApplicationStatus
  initialStatusUpdatedAt: string | null
}) {
  const [status, setStatus] = useState(initialStatus)
  const [statusUpdatedAt, setStatusUpdatedAt] = useState(initialStatusUpdatedAt)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleChange(next: ApplicationStatus) {
    if (next === status) return
    const previous = status
    setStatus(next)
    setSaving(true)
    setError('')
    const res = await updateApplicationStatus(applicationId, next)
    if (res.ok) {
      setStatusUpdatedAt(new Date().toISOString())
    } else {
      setStatus(previous)
      setError(res.error)
    }
    setSaving(false)
  }

  return (
    <div className="flex flex-col items-end gap-1 shrink-0">
      <div className="flex items-center gap-2">
        <Badge variant={APPLICATION_STATUS_VARIANT[status]}>{APPLICATION_STATUS_LABEL[status]}</Badge>
        <select
          value={status}
          disabled={saving}
          onChange={(e) => handleChange(e.target.value as ApplicationStatus)}
          aria-label="Update application status"
          className="text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-1.5 py-1 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-primary disabled:opacity-50"
        >
          {APPLICATION_STATUSES.map((s) => (
            <option key={s} value={s}>{APPLICATION_STATUS_LABEL[s]}</option>
          ))}
        </select>
      </div>
      {statusUpdatedAt && status !== 'submitted' && (
        <span className="text-[11px] text-slate-600 dark:text-slate-400">
          {APPLICATION_STATUS_LABEL[status]} {timeAgo(statusUpdatedAt, 'verbose')}
        </span>
      )}
      {error && <span className="text-[11px] text-red-600 dark:text-red-400">{error}</span>}
    </div>
  )
}
