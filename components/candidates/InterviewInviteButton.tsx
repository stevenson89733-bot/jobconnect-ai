'use client'
import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { inviteCandidateToInterview } from '@/app/actions/applications'
import { getViewerTimezone, listTimezones, zonedWallClockToUtc } from '@/lib/formatScheduledAt'

export type EmployerJobOption = { id: string; title: string }

export default function InterviewInviteButton({
  candidateId,
  jobs,
}: {
  candidateId: string
  jobs: EmployerJobOption[]
}) {
  const t = useTranslations('candidatesPage')
  const [open, setOpen] = useState(false)
  const [jobId, setJobId] = useState(jobs[0]?.id ?? '')
  // Optional slot — an employer can invite now and set the date later, so
  // an empty value is a real, supported state ("date to be confirmed"),
  // not a validation failure.
  const [slot, setSlot] = useState('')
  // Defaults to the employer's REAL detected zone, but stays editable: a
  // recruiter may schedule in the candidate's or the office's zone rather
  // than wherever their own laptop happens to be.
  const [timezone, setTimezone] = useState(() => getViewerTimezone())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const timezones = useMemo(() => {
    const all = listTimezones()
    const current = getViewerTimezone()
    return all.includes(current) ? all : [current, ...all]
  }, [])

  if (jobs.length === 0) {
    return (
      <button
        type="button"
        disabled
        title={t('noActiveJobsWarning')}
        className="btn-outline text-xs py-2 text-center opacity-50 cursor-not-allowed"
      >
        {t('markAsInterview')}
      </button>
    )
  }

  if (done) {
    return (
      <span className="text-xs text-mint font-medium py-2 text-center">
        {t('interviewInviteSuccess')}
      </span>
    )
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn-outline text-xs py-2 text-center">
        {t('markAsInterview')}
      </button>
    )
  }

  async function handleConfirm() {
    if (!jobId) return
    setSaving(true)
    setError('')

    // Converted here, in the employer's chosen zone, into a real absolute
    // instant — never `new Date(slot)`, which would silently reinterpret
    // the wall clock in the browser's own zone instead.
    let scheduledAt: string | null = null
    if (slot) {
      const utc = zonedWallClockToUtc(slot, timezone)
      if (!utc) {
        setSaving(false)
        setError(t('invalidInterviewDate'))
        return
      }
      scheduledAt = utc.toISOString()
    }

    const res = await inviteCandidateToInterview(candidateId, jobId, scheduledAt, scheduledAt ? timezone : null)
    setSaving(false)
    if (res.ok) {
      setDone(true)
    } else {
      setError(res.error)
    }
  }

  const fieldClass =
    'text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-primary disabled:opacity-50'

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] text-slate-600 dark:text-slate-400">{t('selectJobPrompt')}</label>
      <select
        value={jobId}
        onChange={(e) => setJobId(e.target.value)}
        disabled={saving}
        className={fieldClass}
      >
        {jobs.map((job) => (
          <option key={job.id} value={job.id}>{job.title}</option>
        ))}
      </select>

      <label className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
        {t('interviewSlotLabel')} <span className="text-slate-500 dark:text-slate-500">{t('optional')}</span>
      </label>
      <input
        type="datetime-local"
        value={slot}
        onChange={(e) => setSlot(e.target.value)}
        disabled={saving}
        className={fieldClass}
      />
      {slot && (
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          disabled={saving}
          aria-label={t('interviewTimezoneLabel')}
          className={fieldClass}
        >
          {timezones.map((tz) => (
            <option key={tz} value={tz}>{tz}</option>
          ))}
        </select>
      )}
      {!slot && <p className="text-[11px] text-slate-500 dark:text-slate-500">{t('interviewSlotOptionalHint')}</p>}

      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={saving}
          className="btn-primary text-xs py-1.5 px-3 flex-1 disabled:opacity-50"
        >
          {saving ? t('interviewInviteSaving') : t('confirmInterviewInvite')}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={saving}
          className="btn-outline text-xs py-1.5 px-3"
        >
          {t('cancel')}
        </button>
      </div>
      {error && <p className="text-[11px] text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
}
