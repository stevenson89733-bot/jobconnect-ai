'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type PlanState = 'loading' | 'anonymous' | 'free' | 'pro'

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

  // Profile fields fetched on mount
  const [cvStrengths, setCvStrengths] = useState('')
  const [profileTitle, setProfileTitle] = useState('')

  // CV upload
  const [resumeUrl, setResumeUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  // Pipeline state
  const [pipelineStep, setPipelineStep] = useState<'idle' | 'adapting' | 'drafting' | 'done' | 'error'>('idle')
  const [adaptedCv, setAdaptedCv] = useState('')
  const [adaptedCvOpen, setAdaptedCvOpen] = useState(false)
  const [draftError, setDraftError] = useState('')

  // Application
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [applied, setApplied] = useState(alreadyApplied)

  const autoPipelineRef = useRef(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
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

  // On mount: resolve plan + fetch profile fields for pipeline
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
      const parts = [
        data?.bio,
        data?.experience,
        data?.skills,
        data?.education,
      ].filter(Boolean)
      setCvStrengths(parts.join('\n\n').slice(0, 2000))
    }
    checkPlan()
  }, [])

  // Auto-trigger pipeline when modal opens and user is Pro — once per open
  useEffect(() => {
    if (open && planState === 'pro' && !autoPipelineRef.current) {
      autoPipelineRef.current = true
      runPipeline()
    }
  }, [open, planState]) // eslint-disable-line react-hooks/exhaustive-deps

  async function runPipeline() {
    setDraftError('')
    setAdaptedCv('')
    setMessage('')

    try {
      // STEP 2 — Adapt CV to job
      setPipelineStep('adapting')
      const adaptRes = await fetch('/api/ai/adapt-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateProfile: {
            title: profileTitle,
            bio: cvStrengths,       // reuse composed strengths
            experience: cvStrengths,
            skills: cvStrengths,
          },
          job: {
            title: jobTitle,
            company,
            description: description?.slice(0, 2000) ?? '',
            tags,
          },
        }),
      })
      const adaptData = await adaptRes.json()
      const adapted: string = adaptData?.adaptedCv ?? ''
      setAdaptedCv(adapted)

      // STEP 3 — Generate cover letter using adapted CV as strengths
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

  async function handleCvUpload(file: File) {
    setUploading(true)
    setUploadError('')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not signed in')
      const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf'
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`
      const { error: upErr } = await supabase.storage.from('resumes').upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      })
      if (upErr) throw new Error(upErr.message)
      const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(path)
      const url = urlData.publicUrl
      setResumeUrl(url)
      await supabase.from('profiles').update({ resume_url: url }).eq('user_id', user.id)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
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
    setUploadError('')
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto relative z-10 mx-4"
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
                {/* Job description */}
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Job description</p>
                  <div className="max-h-32 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {description?.trim() || (tags?.length ? tags.join(' · ') : <span className="text-slate-400 italic">No description available.</span>)}
                  </div>
                </div>

                {/* CV section — all users */}
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Your CV</p>
                  {resumeUrl ? (
                    <div className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 py-2">
                      <a
                        href={resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[13px] font-semibold text-[#57C7E3] hover:underline truncate"
                      >
                        View CV <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="ml-auto text-[12px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 shrink-0 transition-colors disabled:opacity-50"
                      >
                        {uploading ? 'Uploading…' : 'Replace'}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 py-2.5 text-[13px] text-slate-500 dark:text-slate-400 hover:border-[#57C7E3] hover:text-[#57C7E3] transition-colors disabled:opacity-50"
                    >
                      {uploading ? (
                        <>
                          <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          Uploading…
                        </>
                      ) : '↑ Upload CV (PDF · optional)'}
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleCvUpload(file)
                      e.target.value = ''
                    }}
                  />
                  {uploadError && <p className="text-red-500 text-xs mt-1">{uploadError}</p>}
                </div>

                {/* Pro: adapted CV section */}
                {planState === 'pro' && adaptedCv && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setAdaptedCvOpen(o => !o)}
                      className="flex items-center gap-1.5 text-[12px] font-semibold text-[#57C7E3] hover:text-[#3ab5d1] transition-colors"
                    >
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

                {/* Spinner during pipeline */}
                {isPipelining && (
                  <div className="flex flex-col items-center justify-center gap-3 py-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <svg className="animate-spin w-6 h-6 text-[#57C7E3]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{pipelineLabel}</p>
                  </div>
                )}

                {/* Cover letter textarea — shown when not actively pipeling */}
                {!isPipelining && (
                  <div>
                    <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1.5">
                      {t('messageToHiringTeam')}{' '}
                      <span className="text-slate-400 dark:text-slate-500">{t('optional')}</span>
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={7}
                      placeholder={pipelineStep === 'done' ? '' : t('messagePlaceholder')}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#57C7E3] resize-none"
                    />
                    {pipelineStep === 'done' && (
                      <p className="text-[11px] text-slate-400 mt-1">AI draft — edit freely before sending.</p>
                    )}
                  </div>
                )}

                {/* Draft / Redraft button */}
                {!isPipelining && (
                  <div>
                    {planState === 'pro' ? (
                      <button
                        type="button"
                        onClick={() => { autoPipelineRef.current = true; runPipeline() }}
                        className="w-full inline-flex items-center justify-center gap-2 text-[13px] font-semibold rounded-lg py-2.5 border transition-colors"
                        style={{
                          background: 'rgba(87,199,227,0.08)',
                          borderColor: 'rgba(87,199,227,0.4)',
                          color: '#57C7E3',
                        }}
                      >
                        {pipelineStep === 'done' ? '✦ Redraft with AI' : '✦ Draft with AI'}
                      </button>
                    ) : (
                      <a
                        href="/pricing"
                        title="Upgrade to Pro to unlock AI drafts"
                        className="w-full inline-flex items-center justify-center gap-2 text-[13px] font-semibold rounded-lg py-2.5 border opacity-50"
                        style={{
                          borderColor: 'rgba(148,163,184,0.4)',
                          color: '#94a3b8',
                          background: 'rgba(148,163,184,0.06)',
                        }}
                      >
                        ✦ Draft with AI — Upgrade to Pro
                      </a>
                    )}
                    {draftError && <p className="text-red-500 text-xs mt-1.5">{draftError}</p>}
                  </div>
                )}

                {submitError && <p className="text-red-600 dark:text-red-400 text-sm">{submitError}</p>}

                {/* Actions */}
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
                    disabled={submitting || isPipelining}
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

                {/* Apply on company website */}
                {applyUrl && (
                  <a
                    href={applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 w-full text-[13px] text-slate-500 dark:text-slate-400 hover:text-[#57C7E3] transition-colors pt-1"
                  >
                    Apply on company website
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
            </form>
          </div>
        </div>
      )}
    </>
  )
}
