'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { inviteCandidateToInterview } from '@/app/actions/applications'

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
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

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
    const res = await inviteCandidateToInterview(candidateId, jobId)
    setSaving(false)
    if (res.ok) {
      setDone(true)
    } else {
      setError(res.error)
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] text-slate-600 dark:text-slate-400">{t('selectJobPrompt')}</label>
      <select
        value={jobId}
        onChange={(e) => setJobId(e.target.value)}
        disabled={saving}
        className="text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-primary disabled:opacity-50"
      >
        {jobs.map((job) => (
          <option key={job.id} value={job.id}>{job.title}</option>
        ))}
      </select>
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
