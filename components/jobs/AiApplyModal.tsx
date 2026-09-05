'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type PlanState = 'loading' | 'anonymous' | 'free' | 'pro'
type CoverLetterMode = 'write' | 'upload'

// ── Shared spinner ────────────────────────────────────────────────────────────
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
  const [open, setOpen] = useState(false)
  const [planState, setPlanState] = useState<PlanState>('loading')

  // Profile (Pro)
  const [cvStrengths, setCvStrengths] = useState('')
  const [profileTitle, setProfileTitle] = useState('')
  const [resumeUrl, setResumeUrl] = useState<string | null>(null)

  // Pro pipeline
  const [pipelineStep, setPipelineStep] = useState<'idle' | 'adapting' | 'drafting' | 'done' | 'error'>('idle')
  const [adaptedCv, setAdaptedCv] = useState('')
  const [adaptedCvOpen, setAdaptedCvOpen] = useState(false)
  const [draftError, setDraftError] = useState('')

  // Free — CV upload
  const [freeCvFile, setFreeCvFile] = useState<File | null>(null)
  const [freeCvUploading, setFreeCvUploading] = useState(false)
  const [freeCvError, setFreeCvError] = useState('')

  // Free — cover letter
  const [coverLetterMode, setCoverLetterMode] = useState<CoverLetterMode>('write')
  const [freeCLFile, setFreeCLFile] = useState<File | null>(null)
  const [freeCLUploading, setFreeCLUploading] = useState(false)
  const [freeCLError, setFreeCLError] = useState('')

  // Shared
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [applied, setApplied] = useState(alreadyApplied)

  const autoPipelineRef = useRef(false)
  const cvInputRef = useRef<HTMLInputElement>(null)
  const clInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const t = useTranslations('jobs')
  const tc = useTranslations('common')
  const te = useTranslations('errors')

  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  // On mount: resolve plan + fetch profile fields
  useEffect(() => {
    async function checkPlan() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setPlanState('anonymous'); return }
      const { data } = await supabase
        .from('profiles')
        .select('is_premium, is_admin, title, bio, experience, skills, education, resume_url')
        .eq('user_id', user.id)
        .single()
      setPlanState((data?.is_premium || data?.is_admin) ? 'pro' : 'free')
      if (data?.resume_url) setResumeUrl(data.resume_url)
      setProfileTitle(data?.title ?? '')
      const parts = [data?.bio, data?.experience, data?.skills, data?.education].filter(Boolean)
      setCvStrengths(parts.join('\n\n').slice(0, 2000))
    }
    checkPlan()
  }, [])

  // Auto-trigger pipeline when Pro modal opens — once per open
  useEffect(() => {
    if (open && planState === 'pro' && !autoPipelineRef.current) {
      autoPipelineRef.current = true
      runPipeline()
    }
  }, [open, planState]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Pro pipeline ─────────────────────────────────────────────────────────
  async function runPipeline() {
    setDraftError('')
    setAdaptedCv('')
    setMessage('')
    try {
      setPipelineStep('adapting')
      const adaptRes = await fetch('/api/ai/adapt-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateProfile: { title: profileTitle, bio: cvStrengths, experience: cvStrengths, skills: cvStrengths },
          job: { title: jobTitle, company, description: description?.slice(0, 2000) ?? '', tags },
        }),
      })
      const adaptData = await adaptRes.json()
      const adapted: string = adaptData?.adaptedCv ?? ''
      setAdaptedCv(adapted)

      setPipelineStep('drafting')
      const clRes = await fetch('/api/ai/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole: jobTitle,
          company,
          jobDescription: description?.slice(0, 3000) ?? (tags?.join(', ') ?? ''),
          strengths: adapted || cvStrengths,
          style: 'Formal',
        }),
      })
      const clData = await clRes.json()
      if (!clRes.ok) throw new Error(clData.error || 'Cover letter generation failed')
      const letter = clData?.letter
      if (letter) {
        const parts = [letter.opening, letter.body, letter.closing].filter(Boolean)
        setMessage(parts.join('\n\n'))
      }
      setPipelineStep('done')
    } catch (err) {
      setDraftError(err instanceof Error ? err.message : 'Generation failed')
      setPipelineStep('error')
    }
  }

  // ── File upload helper ────────────────────────────────────────────────────
  async function uploadFile(file: File, bucket: string): Promise<string> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Sign in to upload files')
    const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf'
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`
    const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, { cacheControl: '3600', upsert: false })
    if (upErr) throw new Error(upErr.message)
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path)
    return urlData.publicUrl
  }

  async function handleCvUpload(file: File) {
    setFreeCvUploading(true)
    setFreeCvError('')
    try {
      const url = await uploadFile(file, 'resumes')
      setResumeUrl(url)
      setFreeCvFile(file)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) await supabase.from('profiles').update({ resume_url: url }).eq('user_id', user.id)
    } catch (err) {
      setFreeCvError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setFreeCvUploading(false)
    }
  }

  async function handleCLUpload(file: File) {
    setFreeCLUploading(true)
    setFreeCLError('')
    try {
      const url = await uploadFile(file, 'cover-letters')
      setFreeCLFile(file)
      setMessage(url)
    } catch (err) {
      setFreeCLError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setFreeCLUploading(false)
    }
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError('')
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: jobId, message }),
    })
    if (res.status === 401) { router.push('/login?redirectTo=/jobs'); return }
    if (res.status === 409) { setApplied(true); setOpen(false); setSubmitting(false); return }
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
    setAdaptedCv('')
    setAdaptedCvOpen(false)
    setDraftError('')
    setSubmitError('')
    setFreeCvError('')
    setFreeCLError('')
    setFreeCvFile(null)
    setFreeCLFile(null)
    setCoverLetterMode('write')
    setPipelineStep('idle')
    autoPipelineRef.current = false
    setOpen(true)
  }

  if (applied) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 whitespace-nowrap">
        ✓ Applied
      </span>
    )
  }

  const isPipelining = pipelineStep === 'adapting' || pipelineStep === 'drafting'
  const pipelineLabel = pipelineStep === 'adapting' ? 'Adapting your CV to this role…' : 'Writing your cover letter…'

  // ── Shared upload button ──────────────────────────────────────────────────
  function UploadButton({
    onClick, loading, fileName, placeholder,
  }: { onClick: () => void; loading: boolean; fileName?: string; placeholder: string }) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="w-full inline-flex items-center gap-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 px-4 py-2.5 text-[13px] text-slate-500 dark:text-slate-400 hover:border-[#57C7E3] hover:text-[#57C7E3] transition-colors disabled:opacity-50"
      >
        {loading ? (
          <><Spinner /> Uploading…</>
        ) : fileName ? (
          <><span className="truncate font-medium text-slate-700 dark:text-slate-200">{fileName}</span><span className="ml-auto shrink-0 text-[11px]">Replace</span></>
        ) : (
          <>{placeholder}</>
        )}
      </button>
    )
  }

  return (
    <>
      {/* Trigger */}
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white dark:bg-card border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md shadow-2xl max-h-[85vh] overflow-y-auto mx-4"
            onClick={(e) => e.stopPropagation()}
          >
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
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-xl leading-none ms-4 shrink-0"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Job description — all users */}
              <div>
                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Job description</p>
                <div className="max-h-28 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {description?.trim() || (tags?.length ? tags.join(' · ') : <span className="italic text-slate-400">No description available.</span>)}
                </div>
              </div>

              {/* ── PRO FLOW ───────────────────────────────────────────── */}
              {planState === 'pro' && (
                <>
                  {/* Profile CV (from Supabase) */}
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Your CV</p>
                    {resumeUrl ? (
                      <div className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 py-2">
                        <a href={resumeUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[13px] font-semibold text-[#57C7E3] hover:underline truncate">
                          View CV <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                        <button type="button" onClick={() => cvInputRef.current?.click()}
                          className="ml-auto text-[12px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 shrink-0 transition-colors">
                          Replace
                        </button>
                      </div>
                    ) : (
                      <UploadButton onClick={() => cvInputRef.current?.click()} loading={false}
                        placeholder="↑ Upload CV (PDF · optional)" />
                    )}
                    <input ref={cvInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCvUpload(f); e.target.value = '' }} />
                  </div>

                  {/* Adapted CV */}
                  {adaptedCv && (
                    <div>
                      <button type="button" onClick={() => setAdaptedCvOpen(o => !o)}
                        className="flex items-center gap-1.5 text-[12px] font-semibold text-[#57C7E3] hover:text-[#3ab5d1] transition-colors">
                        {adaptedCvOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        {adaptedCvOpen ? 'Hide adapted CV' : 'View adapted CV'}
                      </button>
                      {adaptedCvOpen && (
                        <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-[#57C7E3]/30 bg-[#57C7E3]/5 px-3 py-2 text-[12px] text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                          {adaptedCv}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pipeline spinner */}
                  {isPipelining && (
                    <div className="flex flex-col items-center justify-center gap-3 py-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                      <Spinner className="w-6 h-6 text-[#57C7E3]" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">{pipelineLabel}</p>
                    </div>
                  )}

                  {/* Cover letter textarea */}
                  {!isPipelining && (
                    <div>
                      <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1.5">
                        Cover letter <span className="text-slate-400 dark:text-slate-500">{t('optional')}</span>
                      </label>
                      <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={7}
                        placeholder={pipelineStep === 'done' ? '' : t('messagePlaceholder')}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#57C7E3] resize-none" />
                      {pipelineStep === 'done' && (
                        <p className="text-[11px] text-slate-400 mt-1">AI draft — edit freely before sending.</p>
                      )}
                    </div>
                  )}

                  {/* Redraft button */}
                  {!isPipelining && (
                    <div>
                      <button type="button"
                        onClick={() => { autoPipelineRef.current = true; runPipeline() }}
                        className="w-full inline-flex items-center justify-center gap-2 text-[13px] font-semibold rounded-lg py-2.5 border transition-colors"
                        style={{ background: 'rgba(87,199,227,0.08)', borderColor: 'rgba(87,199,227,0.4)', color: '#57C7E3' }}>
                        {pipelineStep === 'done' ? '✦ Redraft with AI' : '✦ Draft with AI'}
                      </button>
                      {draftError && <p className="text-red-500 text-xs mt-1.5">{draftError}</p>}
                    </div>
                  )}
                </>
              )}

              {/* ── FREEMIUM FLOW ──────────────────────────────────────── */}
              {(planState === 'free' || planState === 'anonymous' || planState === 'loading') && (
                <>
                  {/* CV upload */}
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1.5">Your CV <span className="normal-case font-normal text-slate-400">(optional)</span></p>
                    <UploadButton
                      onClick={() => cvInputRef.current?.click()}
                      loading={freeCvUploading}
                      fileName={freeCvFile?.name}
                      placeholder="↑ Upload CV — PDF, DOC"
                    />
                    <input ref={cvInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCvUpload(f); e.target.value = '' }} />
                    {freeCvError && <p className="text-red-500 text-xs mt-1">{freeCvError}</p>}
                  </div>

                  {/* Cover letter — Write / Upload toggle */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Cover letter <span className="normal-case font-normal text-slate-400">(optional)</span></p>
                      <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden text-[12px]">
                        {(['write', 'upload'] as CoverLetterMode[]).map((mode) => (
                          <button key={mode} type="button"
                            onClick={() => setCoverLetterMode(mode)}
                            className={`px-3 py-1 capitalize transition-colors ${coverLetterMode === mode
                              ? 'bg-[#57C7E3] text-white font-semibold'
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}>
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>

                    {coverLetterMode === 'write' ? (
                      <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5}
                        placeholder={t('messagePlaceholder')}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#57C7E3] resize-none" />
                    ) : (
                      <>
                        <UploadButton
                          onClick={() => clInputRef.current?.click()}
                          loading={freeCLUploading}
                          fileName={freeCLFile?.name}
                          placeholder="↑ Upload cover letter — PDF, DOC"
                        />
                        <input ref={clInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCLUpload(f); e.target.value = '' }} />
                        {freeCLError && <p className="text-red-500 text-xs mt-1">{freeCLError}</p>}
                      </>
                    )}
                  </div>

                  {/* Draft with AI — grayed, upgrade prompt */}
                  <a href="/pricing" title="Upgrade to Pro to unlock AI drafts"
                    className="w-full inline-flex items-center justify-center gap-2 text-[13px] font-semibold rounded-lg py-2.5 border opacity-50"
                    style={{ borderColor: 'rgba(148,163,184,0.4)', color: '#94a3b8', background: 'rgba(148,163,184,0.06)' }}>
                    ✦ Draft with AI — Upgrade to Pro
                  </a>
                </>
              )}

              {submitError && <p className="text-red-600 dark:text-red-400 text-sm">{submitError}</p>}

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setOpen(false)}
                  className="flex-1 btn-outline py-2.5 text-sm">
                  {tc('cancel')}
                </button>
                <button type="submit" disabled={submitting || isPipelining}
                  className="flex-1 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors disabled:opacity-50"
                  style={{ background: '#57C7E3' }}>
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Spinner /> {t('submitting')}
                    </span>
                  ) : t('submitApplication')}
                </button>
              </div>

              {/* Apply on company website */}
              {applyUrl && (
                <a href={applyUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 w-full text-[13px] text-slate-500 dark:text-slate-400 hover:text-[#57C7E3] transition-colors pt-1">
                  Apply on company website <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  )
}
