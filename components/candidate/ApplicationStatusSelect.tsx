'use client'
import { useState, useTransition } from 'react'
import { APPLICATION_STATUSES, APPLICATION_STATUS_LABEL, APPLICATION_STATUS_VARIANT, type ApplicationStatus } from '@/lib/applicationStatus'
import { updateCandidateApplicationStatus } from '@/app/actions/applications'
import { Badge } from '@/components/ui/badge'

export default function ApplicationStatusSelect({
  applicationId,
  currentStatus,
}: {
  applicationId: string
  currentStatus: ApplicationStatus
}) {
  const [status, setStatus] = useState<ApplicationStatus>(currentStatus)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as ApplicationStatus
    setError('')
    startTransition(async () => {
      const result = await updateCandidateApplicationStatus(applicationId, next)
      if (result.ok) {
        setStatus(next)
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Badge variant={APPLICATION_STATUS_VARIANT[status] ?? 'default'}>
          {APPLICATION_STATUS_LABEL[status] ?? status}
        </Badge>
        <select
          value={status}
          onChange={handleChange}
          disabled={isPending}
          className="text-[11px] text-slate-500 dark:text-slate-400 bg-transparent border-none outline-none cursor-pointer hover:text-primary dark:hover:text-blue-400 transition-colors disabled:opacity-50"
          aria-label="Update status"
        >
          {APPLICATION_STATUSES.map((s) => (
            <option key={s} value={s}>{APPLICATION_STATUS_LABEL[s]}</option>
          ))}
        </select>
      </div>
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  )
}
