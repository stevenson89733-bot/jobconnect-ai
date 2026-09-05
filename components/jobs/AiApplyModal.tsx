'use client'
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { ExternalLink } from 'lucide-react'

type Step = 'preparing' | 'ready'
type CoverLetterMode = 'write' | 'upload'

const stripHtml = (html: string) =>
  html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

function makeBlobUrl(text: string): string {
  return URL.createObjectURL(new Blob([text], { type: 'text/plain' }))
}

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
  category,
  applyUrl,
  alreadyApplied = false,
}: {
  jobId: string
  jobTitle: string
  company: string
  description?: string | null
  tags?: string[]
  category?: string
  applyUrl?: string | null
  alreadyApplied?: boolean
}) {
  const [open, setOpen]       = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // ── States ────────────────────────────────────────────────────────────────
  const [isPro, setIsPro]                   = useState(false)
  const [profileLoaded, setProfileLoaded]   = useState(false)
  const [step, setStep]                     = useState<Step>('preparing')
  const [coverLetter, setCoverLetter]       = useState('')
  const [adaptedCvText, setAdaptedCvText]   = useState('')
  const [adaptedCvUrl, setAdaptedCvUrl]     = useState('')
  const [coverLetterUrl, setCoverLetterUrl] = useState('')
  const [draftError, setDraftError]         = useState('')
  const pipelineRanRef = useRef(false)

  // Free flow
  const [clMode, setClMode] = useState<CoverLetterMode>('write')
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [clFile, setClFile] = useState<File | null>(null)

  // Submit
  const [submitting, setSubmitting]       = useState(false)
  const [submitError, setSubmitError]     = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [applied, setApplied]             = useState(alreadyApplied)

  // Profile ref to avoid stale closures in pipeline
  const profileRef = useRef<{
    full_name: string | null
    headline: string | null
    bio: string | null
    experience: string | null
    skills: string | null
  } | null>(null)

  // ── SSR guard ──────────────────────────────────────────────────────────────
  useEffect(() => { setMounted(true) }, [])

  // ── Scroll lock ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [open])

  // ── Mount: load profile then run pipeline if Pro ───────────────────────────
  useEffect(() => {
    async function init() {
      try {
        const res = await fetch('/api/candidate/profile')
        // Any HTTP error (401, 500, network…) → stay free, never Pro
        if (!res.ok) { setProfileLoaded(true); return }

        let data: Record<string, unknown>
        try { data = await res.json() } catch { setProfileLoaded(true); return }

        // Strict boolean checks — null / undefined / 0 / '' all evaluate to false
        const isAdmin = data.is_admin === true
        const plan    = typeof data.plan === 'string' ? data.plan : 'free'
        const pro     = isAdmin || plan === 'pro' || plan === 'premium'
        console.log('[AiApplyModal] isPro:', pro, 'is_admin:', isAdmin, 'plan:', plan)

        profileRef.current = {
          full_name:  typeof data.full_name  === 'string' ? data.full_name  : null,
          headline:   typeof data.headline   === 'string' ? data.headline   : null,
          bio:        typeof data.bio        === 'string' ? data.bio        : null,
          experience: typeof data.experience === 'string' ? data.experience : null,
          skills:     typeof data.skills     === 'string' ? data.skills     : null,
        }

        setIsPro(pro)
        setProfileLoaded(true)

        if (pro && !pipelineRanRef.current) {
          pipelineRanRef.current = true
          await runPipeline(profileRef.current)
        }
      } catch (err) {
        console.error('[AiApplyModal] init error:', err)
        setProfileLoaded(true)
      }
    }
    init()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Pro pipeline ───────────────────────────────────────────────────────────
  async function runPipeline(p: typeof profileRef.current) {
    setStep('preparing')
    setDraftError('')
    setAdaptedCvText('')
    setAdaptedCvUrl('')
    setCoverLetter('')
    setCoverLetterUrl('')

    const jobDesc = description ? stripHtml(description) : tags?.join(', ') ?? ''
    const strengths = [
      p?.full_name  ? `Name: ${p.full_name}` : null,
      p?.headline   ? `Role: ${p.headline}` : null,
      p?.bio        ? `Bio: ${p.bio}` : null,
      p?.experience ? `Experience:\n${p.experience}` : null,
      p?.skills     ? `Skills: ${p.skills}` : null,
    ].filter(Boolean).join('\n\n')

    try {
      // A) Adapt CV
      const cvRes = await fetch('/api/ai/adapt-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateProfile: {
            title:      p?.headline   ?? undefined,
            bio:        p?.bio        ?? undefined,
            experience: p?.experience ?? undefined,
            skills:     p?.skills     ?? undefined,
          },
          job: {
            title:       jobTitle,
            company,
            description: jobDesc.slice(0, 2000) || undefined,
            tags:        tags ?? [],
            category:    category ?? undefined,
          },
        }),
      })
      const cvData = await cvRes.json()
      if (!cvRes.ok) throw new Error(cvData.error || 'CV adaptation failed')
      if (cvData.adaptedCv) {
        setAdaptedCvText(cvData.adaptedCv)
        setAdaptedCvUrl(makeBlobUrl(cvData.adaptedCv))
      }

      // B) Cover letter
      const clRes = await fetch('/api/ai/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole:     jobTitle,
          company,
          jobDescription: jobDesc.slice(0, 3000) || undefined,
          strengths:      strengths || undefined,
        }),
      })
      const clData = await clRes.json()
      if (!clRes.ok) throw new Error(clData.error || 'Cover letter generation failed')
      const letter = clData?.letter
      if (letter) {
        const text = [letter.opening, letter.body, letter.closing].filter(Boolean).join('\n\n')
        setCoverLetter(text)
        setCoverLetterUrl(makeBlobUrl(text))
      }

      setStep('ready')
    } catch (err) {
      setDraftError(err instanceof Error ? err.message : 'Generation failed — please try again.')
      setStep('ready')
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
        body: JSON.stringify({ job_id: jobId, message: coverLetter || null }),
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
    setSubmitError('')
    setSubmitSuccess(false)
    setCvFile(null)
    setClFile(null)
    setClMode('write')
    setOpen(true)
  }

  function handleClose() { setOpen(false) }

  async function handleRedraft() {
    pipelineRanRef.current = true
    await runPipeline(profileRef.current)
  }

  // ── Trigger ────────────────────────────────────────────────────────────────
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

  const jobDescText = description?.trim()
    ? stripHtml(description)
    : tags?.length ? tags.join(' · ') : 'No description available.'

  // ── Modal content ──────────────────────────────────────────────────────────
  let body: React.ReactNode

  if (!profileLoaded) {
    body = (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <Spinner className="w-6 h-6 text-[#57C7E3]" />
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    )
  } else if (isPro && step === 'preparing') {
    body = (
      <div className="flex flex-col items-center justify-center gap-3 py-16 rounded-xl border border-slate-200 bg-slate-50">
        <Spinner className="w-6 h-6 text-[#57C7E3]" />
        <p className="text-sm font-semibold text-slate-500">
          ✦ Generating your CV + Cover Letter for {jobTitle}…
        </p>
      </div>
    )
  } else if (isPro && step === 'ready') {
    body = (
      <div className="space-y-4">
        {draftError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {draftError}
          </p>
        )}

        {/* Adapted CV */}
        {adaptedCvText && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 space-y-2">
            <p className="text-xs font-semibold text-emerald-700">
              ✓ CV adapted for {jobTitle} at {company}
            </p>
            <a
              href={adaptedCvUrl}
              download={`CV-${company.replace(/\s+/g, '-')}.txt`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:underline"
            >
              ⬇ Download Adapted CV
            </a>
          </div>
        )}

        {/* Cover letter */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
              Cover letter <span className="normal-case font-normal">(optional)</span>
            </p>
            {coverLetterUrl && (
              <a
                href={coverLetterUrl}
                download={`CoverLetter-${company.replace(/\s+/g, '-')}.txt`}
                className="text-xs font-semibold text-[#57C7E3] hover:underline"
              >
                ⬇ Download
              </a>
            )}
          </div>
          <textarea
            value={coverLetter}
            onChange={e => {
              setCoverLetter(e.target.value)
              setCoverLetterUrl(makeBlobUrl(e.target.value))
            }}
            rows={9}
            placeholder="Your cover letter will appear here…"
            className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#57C7E3] resize-none"
          />
        </div>

        {/* Redraft */}
        <button
          type="button"
          onClick={handleRedraft}
          className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold border transition-colors"
          style={{ background: 'rgba(87,199,227,0.07)', borderColor: 'rgba(87,199,227,0.35)', color: '#57C7E3' }}
        >
          ↺ Redraft
        </button>
      </div>
    )
  } else {
    // Freemium
    body = (
      <div className="space-y-4">
        {/* CV upload */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
            Your CV <span className="normal-case font-normal text-slate-400">(optional)</span>
          </p>
          <label className="flex items-center gap-2 w-full cursor-pointer rounded-lg border-2 border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500 hover:border-[#57C7E3] hover:text-[#57C7E3] transition-colors">
            {cvFile
              ? <><span className="flex-1 truncate font-medium text-slate-700">{cvFile.name}</span><span className="text-xs text-slate-400 shrink-0">Replace</span></>
              : '↑ Upload CV — PDF, DOC'}
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) setCvFile(f); e.target.value = '' }}
            />
          </label>
        </div>

        {/* Cover letter */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
              Cover letter <span className="normal-case font-normal text-slate-400">(optional)</span>
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
              placeholder="Briefly explain why you are a great fit…"
              className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#57C7E3] resize-none"
            />
          ) : (
            <label className="flex items-center gap-2 w-full cursor-pointer rounded-lg border-2 border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500 hover:border-[#57C7E3] hover:text-[#57C7E3] transition-colors">
              {clFile
                ? <><span className="flex-1 truncate font-medium text-slate-700">{clFile.name}</span><span className="text-xs text-slate-400 shrink-0">Replace</span></>
                : '↑ Upload cover letter — PDF, DOC'}
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) setClFile(f); e.target.value = '' }}
              />
            </label>
          )}
        </div>

        {/* Locked AI button */}
        <button
          type="button"
          onClick={() => router.push('/pricing')}
          className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold border opacity-50 cursor-pointer"
          style={{ borderColor: 'rgba(148,163,184,0.4)', color: '#94a3b8', background: 'rgba(148,163,184,0.06)' }}
        >
          ✦ Draft with AI — Upgrade to Pro
        </button>
      </div>
    )
  }

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-[520px] max-h-[85vh] overflow-y-auto"
        style={{ fontSize: '14px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-lg text-slate-900 leading-snug">Apply for this role</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {jobTitle} {' · '} <span className="font-medium text-slate-700">{company}</span>
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
            {/* Success */}
            {submitSuccess ? (
              <div className="flex flex-col items-center gap-4 py-10">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-2xl">✓</div>
                <div className="text-center">
                  <p className="font-bold text-lg text-emerald-700">Application submitted!</p>
                  <p className="text-sm text-slate-500 mt-1">Application sent to {company}.</p>
                </div>
                <button type="button" onClick={handleClose} className="px-6 py-2.5 rounded-lg text-sm font-semibold border border-slate-200 hover:bg-slate-50 transition-colors">
                  Close
                </button>
              </div>
            ) : (
              <>
                {/* Job description */}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Job description</p>
                  <div className="max-h-24 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
                    <p className="text-sm text-slate-600 leading-relaxed">{jobDescText}</p>
                  </div>
                </div>

                {body}

                {submitError && (
                  <p className="text-sm text-red-600">{submitError}</p>
                )}
              </>
            )}
          </div>

          {/* Actions */}
          {!submitSuccess && profileLoaded && step !== 'preparing' && (
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
                disabled={submitting}
                className="flex-1 py-3 rounded-lg text-sm font-bold text-white transition-colors disabled:opacity-50"
                style={{ background: '#57C7E3' }}
              >
                {submitting
                  ? <span className="flex items-center justify-center gap-2"><Spinner /> Submitting…</span>
                  : 'Submit Application'}
              </button>
            </div>
          )}

          {/* Company website */}
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
