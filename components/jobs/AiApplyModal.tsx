'use client'
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { ExternalLink } from 'lucide-react'

type CoverLetterMode = 'write' | 'upload'

const stripHtml = (html: string) =>
  html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

function Spinner({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )
}

export default function AiApplyModal({
  jobId,
  jobTitle,
  company,
  description,
  tags,
  applyUrl,
  alreadyApplied = false,
}: {
  jobId: string
  jobTitle: string
  company: string
  description?: string | null
  tags?: string[]
  applyUrl?: string | null
  alreadyApplied?: boolean
}) {
  const [open, setOpen]       = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Profile state
  const [isPro, setIsPro]               = useState(false)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [resumeUrl, setResumeUrl]       = useState<string | null>(null)
  const profileRef = useRef<{
    resume_text: string | null
    skills: string | null
    experience: string | null
    headline: string | null
    bio: string | null
  } | null>(null)

  // Pipeline (Pro)
  const [drafting, setDrafting]         = useState(false)
  const [draftError, setDraftError]     = useState('')
  const [coverLetter, setCoverLetter]   = useState('')
  const [draftReady, setDraftReady]     = useState(false)
  const pipelineRanRef = useRef(false)

  // Free flow
  const [clMode, setClMode]             = useState<CoverLetterMode>('write')
  const [cvFile, setCvFile]             = useState<File | null>(null)
  const [clFile, setClFile]             = useState<File | null>(null)
  const cvInputRef = useRef<HTMLInputElement>(null)
  const clInputRef = useRef<HTMLInputElement>(null)

  // Submit
  const [submitting, setSubmitting]       = useState(false)
  const [submitError, setSubmitError]     = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [applied, setApplied]             = useState(alreadyApplied)

  // ── SSR guard ──────────────────────────────────────────────────────────────
  useEffect(() => { setMounted(true) }, [])

  // ── Scroll lock ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [open])

  // ── Fetch profile on mount ─────────────────────────────────────────────────
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/candidate/profile')
        if (!res.ok) { setProfileLoaded(true); return }
        const { is_admin, plan, resume_text, skills, experience, headline, bio, resume_url: ru } = await res.json()
        const pro = is_admin === true || plan === 'pro' || plan === 'premium'
        setIsPro(pro)
        setResumeUrl(ru ?? null)
        profileRef.current = { resume_text, skills, experience, headline, bio }
      } catch {
        // anonymous or network error — default free flow
      } finally {
        setProfileLoaded(true)
      }
    }
    loadProfile()
  }, [])

  // ── Auto-run pipeline when Pro modal opens ─────────────────────────────────
  useEffect(() => {
    if (open && isPro && profileLoaded && !pipelineRanRef.current) {
      pipelineRanRef.current = true
      runDraft()
    }
  }, [open, isPro, profileLoaded]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cover-letter pipeline ──────────────────────────────────────────────────
  async function runDraft() {
    setDrafting(true)
    setDraftError('')
    setDraftReady(false)
    setCoverLetter('')
    const jobDesc = description
      ? stripHtml(description)
      : tags?.join(' · ') ?? ''
    try {
      const res = await fetch('/api/ai/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole: jobTitle,
          company,
          jobDescription: jobDesc.slice(0, 3000),
          candidateProfile: profileRef.current ?? {},
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Cover letter generation failed')
      const letter = data?.letter
      if (letter) {
        const parts = [letter.opening, letter.body, letter.closing].filter(Boolean)
        setCoverLetter(parts.join('\n\n'))
        setDraftReady(true)
      }
    } catch (err) {
      setDraftError(err instanceof Error ? err.message : 'Generation failed — please try again.')
    } finally {
      setDrafting(false)
    }
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: jobId,
          message: coverLetter || null,
        }),
      })
      if (res.status === 401) { router.push('/login?redirectTo=/jobs'); return }
      if (!res.ok && res.status !== 409) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Submission failed — please try again.')
      }
      setApplied(true)
      setSubmitSuccess(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleOpen() {
    setCoverLetter('')
    setDraftError('')
    setSubmitError('')
    setSubmitSuccess(false)
    setCvFile(null)
    setClFile(null)
    setClMode('write')
    setDraftReady(false)
    pipelineRanRef.current = false
    setOpen(true)
  }

  function handleClose() { setOpen(false) }

  // ── Trigger / applied badge ────────────────────────────────────────────────
  const trigger = applied ? (
    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 whitespace-nowrap">
      ✓ Applied
    </span>
  ) : (
    <button
      type="button"
      onClick={handleOpen}
      className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg border whitespace-nowrap transition-colors"
      style={{ borderColor: '#57C7E3', color: '#57C7E3', background: 'rgba(87,199,227,0.07)' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(87,199,227,0.15)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(87,199,227,0.07)' }}
    >
      ✦ Apply with AI
    </button>
  )

  if (!mounted || !open) return trigger

  // ── Job description text ───────────────────────────────────────────────────
  const jobDescText = description?.trim()
    ? stripHtml(description)
    : tags?.length
    ? tags.join(' · ')
    : 'No description available.'

  // ── Modal JSX ─────────────────────────────────────────────────────────────
  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-lg text-slate-900 leading-snug">Apply for this role</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {jobTitle}
              {' · '}
              <span className="font-medium text-slate-700">{company}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="ml-4 shrink-0 text-slate-400 hover:text-slate-800 transition-colors text-xl leading-none mt-0.5"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-5">

            {/* ── Success state ──────────────────────────────────── */}
            {submitSuccess ? (
              <div className="flex flex-col items-center gap-4 py-10">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-2xl">✓</div>
                <div className="text-center">
                  <p className="font-bold text-lg text-emerald-700">Application submitted!</p>
                  <p className="text-sm text-slate-500 mt-1">We've sent your application to {company}.</p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2.5 rounded-lg text-sm font-semibold border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                {/* ── Job description ────────────────────────────── */}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
                    Job description
                  </p>
                  <div className="max-h-24 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
                    <p className="text-sm text-slate-600 leading-relaxed">{jobDescText}</p>
                  </div>
                </div>

                {/* ── PRO / ADMIN FLOW ───────────────────────────── */}
                {isPro ? (
                  <div className="space-y-4">
                    {drafting ? (
                      /* Spinner */
                      <div className="flex flex-col items-center justify-center gap-3 py-12 rounded-xl border border-slate-200 bg-slate-50">
                        <Spinner className="w-6 h-6 text-[#57C7E3]" />
                        <p className="text-sm font-semibold text-slate-500">✦ Preparing your application…</p>
                      </div>
                    ) : (
                      <>
                        {/* Draft ready hint */}
                        {draftReady && (
                          <p className="text-xs font-semibold text-[#57C7E3]">
                            ✦ AI draft ready — edit freely
                          </p>
                        )}

                        {/* Draft error */}
                        {draftError && (
                          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                            {draftError}
                          </p>
                        )}

                        {/* Cover letter textarea */}
                        <div>
                          <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
                            Cover letter
                            {' '}
                            <span className="normal-case font-normal">(optional)</span>
                          </label>
                          <textarea
                            value={coverLetter}
                            onChange={e => setCoverLetter(e.target.value)}
                            rows={9}
                            placeholder="Your cover letter will appear here…"
                            className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#57C7E3] resize-none"
                          />
                        </div>

                        {/* Redraft */}
                        <button
                          type="button"
                          onClick={() => { pipelineRanRef.current = true; runDraft() }}
                          className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold border transition-colors"
                          style={{
                            background: 'rgba(87,199,227,0.07)',
                            borderColor: 'rgba(87,199,227,0.35)',
                            color: '#57C7E3',
                          }}
                        >
                          ↺ Redraft
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  /* ── FREE / ANONYMOUS FLOW ─────────────────────── */
                  <div className="space-y-4">
                    {/* YOUR CV */}
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
                        Your CV
                        {' '}
                        <span className="normal-case font-normal text-slate-400">(optional)</span>
                      </p>
                      <label className="flex items-center gap-2 w-full cursor-pointer rounded-lg border-2 border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500 hover:border-[#57C7E3] hover:text-[#57C7E3] transition-colors">
                        {cvFile ? (
                          <><span className="flex-1 truncate font-medium text-slate-700">{cvFile.name}</span><span className="text-xs text-slate-400 shrink-0">Replace</span></>
                        ) : (
                          '↑ Upload CV — PDF, DOC'
                        )}
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={e => { const f = e.target.files?.[0]; if (f) setCvFile(f); e.target.value = '' }}
                        />
                      </label>
                    </div>

                    {/* COVER LETTER */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                          Cover letter
                          {' '}
                          <span className="normal-case font-normal text-slate-400">(optional)</span>
                        </p>
                        <div className="flex rounded-lg border border-slate-200 overflow-hidden text-[12px]">
                          {(['write', 'upload'] as CoverLetterMode[]).map(mode => (
                            <button
                              key={mode}
                              type="button"
                              onClick={() => setClMode(mode)}
                              className={`px-3 py-1 capitalize transition-colors ${
                                clMode === mode
                                  ? 'bg-[#57C7E3] text-white font-semibold'
                                  : 'text-slate-500 hover:text-slate-700'
                              }`}
                            >
                              {mode}
                            </button>
                          ))}
                        </div>
                      </div>

                      {clMode === 'write' ? (
                        <textarea
                          value={coverLetter}
                          onChange={e => setCoverLetter(e.target.value)}
                          rows={5}
                          placeholder="Briefly explain why you're a great fit…"
                          className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#57C7E3] resize-none"
                        />
                      ) : (
                        <label className="flex items-center gap-2 w-full cursor-pointer rounded-lg border-2 border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500 hover:border-[#57C7E3] hover:text-[#57C7E3] transition-colors">
                          {clFile ? (
                            <><span className="flex-1 truncate font-medium text-slate-700">{clFile.name}</span><span className="text-xs text-slate-400 shrink-0">Replace</span></>
                          ) : (
                            '↑ Upload cover letter — PDF, DOC'
                          )}
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                            onChange={e => { const f = e.target.files?.[0]; if (f) setClFile(f); e.target.value = '' }}
                          />
                        </label>
                      )}
                    </div>

                    {/* Locked AI Draft */}
                    <button
                      type="button"
                      onClick={() => router.push('/pricing')}
                      className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold border opacity-50 cursor-pointer"
                      style={{
                        borderColor: 'rgba(148,163,184,0.4)',
                        color: '#94a3b8',
                        background: 'rgba(148,163,184,0.06)',
                      }}
                    >
                      ✦ Draft with AI — Upgrade to Pro
                    </button>
                  </div>
                )}

                {submitError && (
                  <p className="text-sm text-red-600">{submitError}</p>
                )}
              </>
            )}
          </div>

          {/* ── Actions ─────────────────────────────────────────────── */}
          {!submitSuccess && (
            <div className="flex gap-3 px-6 pb-5 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-3 rounded-lg text-sm font-semibold border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || drafting}
                className="flex-1 py-3 rounded-lg text-sm font-bold text-white transition-colors disabled:opacity-50"
                style={{ background: '#57C7E3' }}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner /> Submitting…
                  </span>
                ) : (
                  'Submit Application'
                )}
              </button>
            </div>
          )}

          {/* ── Footer: company website ──────────────────────────────── */}
          {applyUrl && !submitSuccess && (
            <div className="px-6 pb-5">
              <a
                href={applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 w-full text-sm text-slate-400 hover:text-[#57C7E3] transition-colors"
              >
                Apply on company website
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </form>
      </div>
    </div>
  )

  return (
    <>
      {trigger}
      {createPortal(modal, document.body)}
    </>
  )
}
