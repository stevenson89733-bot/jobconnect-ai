'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'

type PlanState = 'loading' | 'anonymous' | 'free' | 'pro'

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
  const [planState, setPlanState] = useState<PlanState>('loading')
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

  useEffect(() => {
    async function checkPlan() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setPlanState('anonymous'); return }
      const { data } = await supabase
        .from('profiles')
        .select('is_premium, is_admin')
        .eq('id', user.id)
        .single()
      setPlanState((data?.is_premium || data?.is_admin) ? 'pro' : 'free')
    }
    checkPlan()
  }, [])

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
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold px-4 py-2 rounded-lg border transition-colors"
        style={{ borderColor: '#57C7E3', color: '#57C7E3', background: 'rgba(87,199,227,0.07)' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(87,199,227,0.15)' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(87,199,227,0.07)' }}
      >
        ✦ Apply with AI
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

            {/* Body — gated by plan */}
            {planState === 'loading' && (
              <div className="flex items-center justify-center p-12">
                <svg className="animate-spin w-6 h-6 text-[#57C7E3]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              </div>
            )}

            {planState === 'anonymous' && (
              <div className="p-8 text-center space-y-4">
                <div className="text-4xl">✦</div>
                <p className="font-semibold text-slate-800 dark:text-white text-base">Sign in to apply with AI</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Create an account or sign in to draft a tailored cover letter instantly.
                </p>
                <a
                  href="/login?redirectTo=/jobs"
                  className="inline-flex items-center justify-center w-full py-2.5 text-sm font-semibold text-white rounded-lg transition-colors"
                  style={{ background: '#57C7E3' }}
                >
                  Sign in
                </a>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="w-full text-sm text-slate-500 hover:text-slate-700 transition-colors"
                >
                  {tc('cancel')}
                </button>
              </div>
            )}

            {planState === 'free' && (
              <div className="p-8 text-center space-y-4">
                <div className="text-4xl">✦</div>
                <p className="font-semibold text-slate-800 dark:text-white text-base">Apply with AI is a Pro feature</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Upgrade to Pro to draft AI-powered cover letters and track your applications.
                </p>
                <a
                  href="/pricing"
                  className="inline-flex items-center justify-center w-full py-2.5 text-sm font-semibold text-white rounded-lg transition-colors"
                  style={{ background: '#57C7E3' }}
                >
                  Upgrade to Pro →
                </a>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="w-full text-sm text-slate-500 hover:text-slate-700 transition-colors"
                >
                  {tc('cancel')}
                </button>
              </div>
            )}

            {planState === 'pro' && (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Job description */}
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Job description</p>
                  <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {description?.trim() || <span className="text-slate-400 italic">No description available.</span>}
                  </div>
                </div>

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
            )}
          </div>
        </div>
      )}
    </>
  )
}
