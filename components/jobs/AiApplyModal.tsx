'use client'
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type PlanState = 'loading' | 'anonymous' | 'free' | 'pro'
type CoverLetterMode = 'write' | 'upload'
type PipelineStep = 'idle' | 'running' | 'done' | 'error'

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
  const [open, setOpen]           = useState(false)
  const [mounted, setMounted]     = useState(false)
  const [planState, setPlanState] = useState<PlanState>('loading')

  // Profile fields fetched on mount
  const [profileTitle, setProfileTitle]       = useState('')
  const [profileBio, setProfileBio]           = useState('')
  const [profileExperience, setProfileExperience] = useState('')
  const [profileSkills, setProfileSkills]     = useState('')
  const [profileEducation, setProfileEducation] = useState('')
  const [resumeUrl, setResumeUrl]             = useState<string | null>(null)

  // Pro/Admin pipeline
  const [pipelineStep, setPipelineStep] = useState<PipelineStep>('idle')
  const [adaptedCv, setAdaptedCv]       = useState('')
  const [pipelineError, setPipelineError] = useState('')
  const pipelineRanRef = useRef(false)

  // Free flow
  const [clMode, setClMode]             = useState<CoverLetterMode>('write')
  const [freeCvFile, setFreeCvFile]     = useState<File | null>(null)
  const [freeCvUploading, setFreeCvUploading] = useState(false)
  const [freeCLFile, setFreeCLFile]     = useState<File | null>(null)
  const [freeCLUploading, setFreeCLUploading] = useState(false)

  // Shared
  const [coverLetter, setCoverLetter]   = useState('')
  const [submitting, setSubmitting]     = useState(false)
  const [submitError, setSubmitError]   = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [applied, setApplied]           = useState(alreadyApplied)

  const cvInputRef = useRef<HTMLInputElement>(null)
  const clInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Portal SSR guard
  useEffect(() => { setMounted(true) }, [])

  // Body scroll lock — hidden when open, restored on close/unmount
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Fetch profile on mount — runs once regardless of modal state
  useEffect(() => {
    async function checkPlan() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setPlanState('anonymous'); return }
      const { data } = await supabase
        .from('profiles')
        .select('is_admin, is_premium, title, bio, experience, skills, education, resume_url')
        .eq('user_id', user.id)
        .single()
      const isPro = data?.is_admin === true || data?.is_premium === true
      setPlanState(isPro ? 'pro' : 'free')
      setProfileTitle(data?.title ?? '')
      setProfileBio(data?.bio ?? '')
      setProfileExperience(data?.experience ?? '')
      setProfileSkills(data?.skills ?? '')
      setProfileEducation(data?.education ?? '')
      if (data?.resume_url) setResumeUrl(data.resume_url)
    }
    checkPlan()
  }, [])

  // Auto-run AI pipeline for Pro/Admin once per modal open
  useEffect(() => {
    if (open && planState === 'pro' && !pipelineRanRef.current) {
      pipelineRanRef.current = true
      runPipeline()
    }
  }, [open, planState]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Pro pipeline ──────────────────────────────────────────────────────────
  async function runPipeline() {
    setPipelineStep('running')
    setPipelineError('')
    setAdaptedCv('')
    setCoverLetter('')

    const profileStrengths = [profileBio, profileExperience, profileSkills, profileEducation]
      .filter(Boolean).join('\n\n').slice(0, 2000)

    try {
      // Step 1: adapt CV to this specific role
      const adaptRes = await fetch('/api/ai/adapt-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateProfile: {
            title: profileTitle,
            bio: profileBio,
            experience: profileExperience,
            skills: profileSkills,
          },
          job: { title: jobTitle, company, description: description?.slice(0, 2000), tags },
        }),
      })
      const adaptData = await adaptRes.json()
      const adapted: string = adaptData?.adaptedCv ?? ''
      setAdaptedCv(adapted)

      // Step 2: generate cover letter
      const clRes = await fetch('/api/ai/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole: jobTitle,
          company,
          jobDescription: description?.slice(0, 3000) ?? tags?.join(', ') ?? '',
          strengths: adapted || profileStrengths,
          style: 'Formal',
        }),
      })
      const clData = await clRes.json()
      if (!clRes.ok) throw new Error(clData.error || 'Cover letter generation failed')
      const letter = clData?.letter
      if (letter) {
        const parts = [letter.opening, letter.body, letter.closing].filter(Boolean)
        setCoverLetter(parts.join('\n\n'))
      }
      setPipelineStep('done')
    } catch (err) {
      setPipelineError(err instanceof Error ? err.message : 'Generation failed — please try again.')
      setPipelineStep('error')
    }
  }

  // ── File upload helper ────────────────────────────────────────────────────
  async function uploadFile(file: File, bucket: string): Promise<string> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Sign in to upload files')
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'pdf'
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`
    const { error } = await supabase.storage.from(bucket).upload(path, file, { cacheControl: '3600', upsert: false })
    if (error) throw new Error(error.message)
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
  }

  async function handleCvUpload(file: File) {
    setFreeCvUploading(true)
    try {
      const url = await uploadFile(file, 'resumes')
      setResumeUrl(url)
      setFreeCvFile(file)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) await supabase.from('profiles').update({ resume_url: url }).eq('user_id', user.id)
    } catch { /* upload errors are non-fatal — file is still selected locally */ }
    finally { setFreeCvUploading(false) }
  }

  async function handleCLUpload(file: File) {
    setFreeCLUploading(true)
    try {
      const url = await uploadFile(file, 'cover-letters')
      setFreeCLFile(file)
      setCoverLetter(url)
    } catch { /* non-fatal */ }
    finally { setFreeCLUploading(false) }
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError('')
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: jobId, message: coverLetter }),
    })
    setSubmitting(false)
    if (res.status === 401) { router.push('/login?redirectTo=/jobs'); return }
    if (res.status === 409 || res.ok) {
      setApplied(true)
      setSubmitSuccess(true)
      return
    }
    const data = await res.json().catch(() => ({}))
    setSubmitError(data.error || 'Something went wrong — please try again.')
  }

  function handleOpen() {
    setCoverLetter('')
    setAdaptedCv('')
    setPipelineStep('idle')
    setPipelineError('')
    setSubmitError('')
    setSubmitSuccess(false)
    setFreeCvFile(null)
    setFreeCLFile(null)
    setClMode('write')
    pipelineRanRef.current = false
    setOpen(true)
  }

  function handleClose() {
    setOpen(false)
  }

  // ── Upload button ─────────────────────────────────────────────────────────
  function UploadButton({ onClick, loading, file, placeholder }: {
    onClick: () => void
    loading: boolean
    file: File | null
    placeholder: string
  }) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="w-full flex items-center gap-2 rounded-lg border-2 border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500 hover:border-[#57C7E3] hover:text-[#57C7E3] transition-colors disabled:opacity-50"
      >
        {loading ? (
          <><Spinner /> Uploading…</>
        ) : file ? (
          <>
            <span className="flex-1 truncate font-medium text-slate-700 text-left">{file.name}</span>
            <span className="text-xs shrink-0 text-slate-400">Replace</span>
          </>
        ) : (
          <span className="text-left">{placeholder}</span>
        )}
      </button>
    )
  }

  // ── Trigger / applied badge ───────────────────────────────────────────────
  const trigger = applied ? (
    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 whitespace-nowrap">
      ✓ Applied
    </span>
  ) : (
    <button
      type="button"
      onClick={handleOpen}
      className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg border transition-colors whitespace-nowrap"
      style={{ borderColor: '#57C7E3', color: '#57C7E3', background: 'rgba(87,199,227,0.07)' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(87,199,227,0.15)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(87,199,227,0.07)' }}
    >
      ✦ Apply with AI
    </button>
  )

  if (!mounted || !open) return trigger

  // ── Modal ─────────────────────────────────────────────────────────────────
  const isProPlan   = planState === 'pro'
  const isPipelining = pipelineStep === 'running'

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-[18px] leading-snug text-slate-900">Apply for this role</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {jobTitle} · <span className="font-medium text-slate-700">{company}</span>
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

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

          {/* ── Success state ──────────────────────────────────────────── */}
          {submitSuccess ? (
            <div className="flex flex-col items-center gap-4 py-10">
              <span className="text-5xl">✅</span>
              <p className="text-xl font-bold text-emerald-600">Applied!</p>
              <p className="text-sm text-slate-500 text-center">
                Your application has been submitted successfully.
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="mt-2 px-6 py-2.5 rounded-lg text-sm font-semibold border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {/* ── Job description ─────────────────────────────────── */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
                  Job description
                </p>
                <div className="max-h-32 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
                  {description?.trim() ? (
                    <div
                      className="text-sm text-slate-600 leading-relaxed [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-0.5 [&_p]:mb-1 [&_strong]:font-semibold [&_h2]:font-semibold [&_h3]:font-semibold"
                      dangerouslySetInnerHTML={{ __html: description }}
                    />
                  ) : (
                    <p className="text-sm text-slate-500 italic">
                      {tags?.length ? tags.join(' · ') : 'No description available.'}
                    </p>
                  )}
                </div>
              </div>

              {/* ── PRO / ADMIN FLOW ───────────────────────────────── */}
              {isProPlan && (
                <div className="space-y-4">
                  {isPipelining ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-12 rounded-xl border border-slate-200 bg-slate-50">
                      <Spinner className="w-6 h-6 text-[#57C7E3]" />
                      <p className="text-sm font-medium text-slate-500">Preparing your application…</p>
                    </div>
                  ) : (
                    <>
                      {/* Adapted CV badge */}
                      {adaptedCv && (
                        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                          <span className="text-sm font-semibold text-emerald-700">
                            CV: adapted for this role ✓
                          </span>
                          {resumeUrl && (
                            <a
                              href={resumeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-auto flex items-center gap-0.5 text-xs text-[#57C7E3] hover:underline shrink-0"
                            >
                              View <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      )}

                      {/* Pipeline error */}
                      {pipelineStep === 'error' && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                          {pipelineError}
                        </p>
                      )}

                      {/* Cover letter textarea */}
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
                          Cover letter{' '}
                          <span className="normal-case font-normal text-slate-400">(optional)</span>
                        </label>
                        <textarea
                          value={coverLetter}
                          onChange={e => setCoverLetter(e.target.value)}
                          rows={8}
                          placeholder={pipelineStep === 'done' ? '' : 'Write your cover letter here…'}
                          className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#57C7E3] resize-none"
                        />
                        {pipelineStep === 'done' && (
                          <p className="text-xs text-slate-400 mt-1">AI draft — edit freely before sending.</p>
                        )}
                      </div>

                      {/* Redraft / Draft button */}
                      <button
                        type="button"
                        onClick={() => { pipelineRanRef.current = true; runPipeline() }}
                        className="w-full flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold border transition-colors"
                        style={{
                          background: 'rgba(87,199,227,0.08)',
                          borderColor: 'rgba(87,199,227,0.35)',
                          color: '#57C7E3',
                        }}
                      >
                        ✦ {pipelineStep === 'done' ? 'Redraft with AI' : 'Draft with AI'}
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* ── FREE / ANONYMOUS FLOW ──────────────────────────── */}
              {!isProPlan && (
                <div className="space-y-4">
                  {/* YOUR CV */}
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
                      Your CV{' '}
                      <span className="normal-case font-normal text-slate-400">(optional)</span>
                    </p>
                    <UploadButton
                      onClick={() => cvInputRef.current?.click()}
                      loading={freeCvUploading}
                      file={freeCvFile}
                      placeholder="↑ Upload CV — PDF or DOC"
                    />
                    <input
                      ref={cvInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={e => {
                        const f = e.target.files?.[0]
                        if (f) handleCvUpload(f)
                        e.target.value = ''
                      }}
                    />
                  </div>

                  {/* COVER LETTER */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                        Cover letter{' '}
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
                        placeholder="Write your cover letter here…"
                        className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#57C7E3] resize-none"
                      />
                    ) : (
                      <>
                        <UploadButton
                          onClick={() => clInputRef.current?.click()}
                          loading={freeCLUploading}
                          file={freeCLFile}
                          placeholder="↑ Upload cover letter — PDF or DOC"
                        />
                        <input
                          ref={clInputRef}
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={e => {
                            const f = e.target.files?.[0]
                            if (f) handleCLUpload(f)
                            e.target.value = ''
                          }}
                        />
                      </>
                    )}
                  </div>

                  {/* Draft with AI — locked for free users */}
                  <button
                    type="button"
                    onClick={() => { window.location.href = '/pricing' }}
                    className="w-full flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold border opacity-50"
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

              {/* ── Actions ─────────────────────────────────────────── */}
              <div className="flex gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-3 rounded-lg text-sm font-semibold border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || isPipelining}
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

              {/* ── Footer: company website link ─────────────────── */}
              {applyUrl && (
                <a
                  href={applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 w-full text-sm text-slate-400 hover:text-[#57C7E3] transition-colors"
                >
                  Apply on company website <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </>
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
