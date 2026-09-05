'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

export default function AiApplyModal({
  jobId,
  jobTitle,
  company,
  description,
  alreadyApplied = false,
}: {
  jobId: string
  jobTitle: string
  company: string
  description?: string | null
  alreadyApplied?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [drafted, setDrafted] = useState(false)
  const [drafting, setDrafting] = useState(false)
  const [draftError, setDraftError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [applied, setApplied] = useState(alreadyApplied)
  const router = useRouter()
  const t = useTranslations('jobs')
  const tc = useTranslations('common')
  const te = useTranslations('errors')

  async function draftWithAi() {
    setDrafting(true)
    setDraftError('')
    try {
      const res = await fetch('/api/ai/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole: jobTitle,
          company,
          jobDescription: description?.slice(0, 3000) ?? '',
          style: 'Formal',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'AI draft failed')

      const letter = data?.letter
      if (letter) {
        const parts = [letter.opening, letter.body, letter.closing].filter(Boolean)
        setMessage(parts.join('\n\n'))
        setDrafted(true)
      } else {
        throw new Error('No letter returned')
      }
    } catch (err) {
      setDraftError(err instanceof Error ? err.message : 'AI draft failed')
    } finally {
      setDrafting(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError('')

    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: jobId, message }),
    })

    if (res.status === 401) {
      router.push('/login?redirectTo=/jobs')
      return
    }
    if (res.status === 409) {
      setApplied(true)
      setOpen(false)
      setSubmitting(false)
      return
    }
    if (!res.ok) {
      const data = await res.json()
      setSubmitError(data.error || te('somethingWentWrong'))
      setSubmitting(false)
      return
    }

    setApplied(true)
    setOpen(false)
    setSubmitting(false)
    setMessage('')
  }

  function handleOpen() {
    setMessage('')
    setDrafted(false)
    setDraftError('')
    setSubmitError('')
    setOpen(true)
  }

  if (applied) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 whitespace-nowrap">
        ✓ Applied
      </span>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-1.5 text-white text-[13px] font-semibold px-4 py-2 rounded-lg transition-colors"
        style={{ background: '#57C7E3' }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#3ab5d1')}
        onMouseLeave={(e) => (e.currentTarget.style.background = '#57C7E3')}
      >
        Apply now
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between p-6 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-slate-900 dark:text-white font-bold text-lg">{t('applyForRole')}</h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5">
                  {jobTitle} · <span className="text-slate-700 dark:text-slate-300">{company}</span>
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-xl leading-none ms-4"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* AI Draft button */}
              <div>
                <button
                  type="button"
                  onClick={draftWithAi}
                  disabled={drafting}
                  className="w-full inline-flex items-center justify-center gap-2 text-[13px] font-semibold rounded-lg py-2.5 border transition-colors disabled:opacity-50"
                  style={{
                    background: drafted ? 'rgba(87,199,227,0.08)' : 'rgba(87,199,227,0.1)',
                    borderColor: 'rgba(87,199,227,0.4)',
                    color: '#57C7E3',
                  }}
                >
                  {drafting ? (
                    <>
                      <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Drafting with AI…
                    </>
                  ) : drafted ? (
                    '✦ Redraft with AI'
                  ) : (
                    '✦ Draft with AI'
                  )}
                </button>
                {draftError && (
                  <p className="text-red-500 text-xs mt-1.5">{draftError}</p>
                )}
              </div>

              {/* Message textarea */}
              <div>
                <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1.5">
                  {t('messageToHiringTeam')}{' '}
                  <span className="text-slate-400 dark:text-slate-500">{t('optional')}</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={7}
                  placeholder={drafted ? '' : t('messagePlaceholder')}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#57C7E3] resize-none"
                />
                {drafted && (
                  <p className="text-[11px] text-slate-400 mt-1">AI draft — edit freely before sending.</p>
                )}
              </div>

              {submitError && <p className="text-red-600 dark:text-red-400 text-sm">{submitError}</p>}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 btn-outline py-2.5 text-sm"
                >
                  {tc('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors disabled:opacity-50"
                  style={{ background: '#57C7E3' }}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      {t('submitting')}
                    </span>
                  ) : t('submitApplication')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
