'use client'
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { ExternalLink } from 'lucide-react'

type Step = 'preparing' | 'ready'
type CoverLetterMode = 'write' | 'upload'

const BRAND = '#57C7E3'

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

// ── PDF helpers (jsPDF loaded dynamically — Pro path only) ─────────────────

type Profile = {
  full_name:  string | null
  headline:   string | null
  email:      string | null
  phone:      string | null
  linkedin:   string | null
  bio:        string | null
  experience: string | null
  skills:     string | null
}

// CV: font-size 10 × line-spacing 1.5 → ~5.3 mm per line
const CV_LINE_H = 5.3

async function buildCvPdf(p: Profile | null, cvText: string, job: { title: string; company: string }): Promise<Blob> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = 210, ml = 20, mr = 20, tw = W - ml - mr
  const cx = W / 2
  let y = 20

  // ── HEADER — centré ──────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(15, 23, 42)
  doc.text(p?.full_name ?? 'Candidate', cx, y, { align: 'center' }); y += 8

  if (p?.headline) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(12)
    doc.setTextColor(100, 116, 139)
    doc.text(p.headline, cx, y, { align: 'center' }); y += 6
  }

  // Contact line : email · phone · linkedin
  const contactParts: string[] = []
  if (p?.email)    contactParts.push(p.email)
  if (p?.phone)    contactParts.push(p.phone)
  if (p?.linkedin) contactParts.push(p.linkedin)
  if (contactParts.length > 0) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(100, 116, 139)
    doc.text(contactParts.join('  ·  '), cx, y, { align: 'center' }); y += 5
  }

  // Ligne séparatrice header
  y += 2
  doc.setDrawColor(203, 213, 225)
  doc.setLineWidth(0.5)
  doc.line(ml, y, W - mr, y); y += 8

  // ── HELPER : section structurée avec texte justifié ───────────────────────
  function renderSection(title: string, content: string) {
    if (!content?.trim()) return
    if (y > 258) { doc.addPage(); y = 20 }

    y += 4
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(15, 23, 42)
    doc.text(title.toUpperCase(), ml, y); y += 4

    doc.setDrawColor(203, 213, 225)
    doc.setLineWidth(0.3)
    doc.line(ml, y, W - mr, y); y += 4

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(51, 65, 85)

    const paras = content.trim().split(/\n{2,}/)
    for (const para of paras) {
      const lines = doc.splitTextToSize(para.trim(), tw)
      for (let i = 0; i < lines.length; i++) {
        if (y > 278) { doc.addPage(); y = 20 }
        // Justify all lines except the last of each paragraph
        const isLast = i === lines.length - 1
        doc.text(lines[i], ml, y, { align: isLast ? 'left' : 'justify', maxWidth: tw })
        y += CV_LINE_H
      }
      y += 2
    }
  }

  // ── SECTIONS ─────────────────────────────────────────────────────────────
  // Professional Summary = FIRST PARAGRAPH only of the AI narrative (concise)
  const summaryText = cvText.trim().split(/\n{2,}/)[0] ?? cvText.trim()
  renderSection('Professional Summary', summaryText)
  if (p?.experience) renderSection('Experience', p.experience)
  if (p?.skills)     renderSection('Skills',      p.skills)

  // Footer discret
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8)
  doc.setTextColor(148, 163, 184)
  doc.text(`Adapted for: ${job.title} at ${job.company}`, cx, 291, { align: 'center' })

  return doc.output('blob')
}

// Cover letter: font-size 11 × 1.6 spacing → ~6.2 mm
const CL_LINE_H = 6.2

async function buildCoverLetterPdf(p: Profile | null, text: string, job: { title: string; company: string }): Promise<Blob> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = 210, ml = 25, mr = 25, tw = W - ml - mr
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  let y = 25

  // ── Sender block ──
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(15, 23, 42)
  doc.text(p?.full_name ?? 'Candidate', ml, y); y += 6

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(100, 116, 139)
  if (p?.headline) { doc.text(p.headline, ml, y); y += 5 }
  if (p?.email) { doc.text(p.email, ml, y); y += 5 }
  doc.text(date, ml, y); y += 10

  // To / Re
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(15, 23, 42)
  doc.text(job.company, ml, y); y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(100, 116, 139)
  doc.text(`Re: ${job.title}`, ml, y); y += 10

  // ── Body justifié ────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(51, 65, 85)

  const paras = text.split(/\n{2,}/)
  for (const para of paras) {
    const trimmed = para.trim()
    if (!trimmed) continue
    const lines = doc.splitTextToSize(trimmed, tw)
    for (let i = 0; i < lines.length; i++) {
      if (y > 265) { doc.addPage(); y = 25 }
      // Justify all lines except the last of each paragraph
      const isLast = i === lines.length - 1
      doc.text(lines[i], ml, y, { align: isLast ? 'left' : 'justify', maxWidth: tw })
      y += CL_LINE_H
    }
    y += 4 // espace inter-paragraphe
  }

  // ── Signature ──
  if (y > 252) { doc.addPage(); y = 25 }
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(51, 65, 85)
  doc.text('Sincerely,', ml, y); y += 14
  doc.setFont('helvetica', 'bold')
  doc.text(p?.full_name ?? '', ml, y)

  return doc.output('blob')
}

function makePdfUrl(blob: Blob) {
  return URL.createObjectURL(blob)
}

// ─────────────────────────────────────────────────────────────────────────────

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

  // ── Profile ────────────────────────────────────────────────────────────────
  const [isPro, setIsPro]                 = useState(false)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const profileRef = useRef<Profile | null>(null)

  // ── Pro pipeline ───────────────────────────────────────────────────────────
  const [step, setStep]               = useState<Step>('preparing')
  const [draftError, setDraftError]   = useState('')
  const [coverLetter, setCoverLetter] = useState('')
  const [adaptedCvText, setAdaptedCvText]         = useState('')
  const [cvPdfUrl, setCvPdfUrl]                   = useState('')
  const [coverLetterPdfUrl, setCoverLetterPdfUrl] = useState('')
  // Keep blobs in refs so we can re-download without re-creating URLs
  const cvBlobRef = useRef<Blob | null>(null)
  const clBlobRef = useRef<Blob | null>(null)
  const pipelineRanRef = useRef(false)

  // ── Free flow ──────────────────────────────────────────────────────────────
  const [clMode, setClMode] = useState<CoverLetterMode>('write')
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [clFile, setClFile] = useState<File | null>(null)

  // ── Submit ─────────────────────────────────────────────────────────────────
  const [submitting, setSubmitting]       = useState(false)
  const [submitError, setSubmitError]     = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [applied, setApplied]             = useState(alreadyApplied)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [open])

  // ── Load profile once on mount ─────────────────────────────────────────────
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/candidate/profile')
        if (!res.ok) { setProfileLoaded(true); return }

        let data: Record<string, unknown>
        try { data = await res.json() } catch { setProfileLoaded(true); return }

        const isAdmin = data.is_admin === true
        const plan    = typeof data.plan === 'string' ? data.plan : 'free'
        const pro     = isAdmin || plan === 'pro' || plan === 'premium'

        console.log('[AiApplyModal] isPro:', pro, 'is_admin:', isAdmin, 'plan:', plan)

        profileRef.current = {
          full_name:  typeof data.full_name  === 'string' ? data.full_name  : null,
          headline:   typeof data.headline   === 'string' ? data.headline   : null,
          email:      typeof data.email      === 'string' ? data.email      : null,
          phone:      typeof data.phone      === 'string' ? data.phone      : null,
          linkedin:   typeof data.linkedin   === 'string' ? data.linkedin   : null,
          bio:        typeof data.bio        === 'string' ? data.bio        : null,
          experience: typeof data.experience === 'string' ? data.experience : null,
          skills:     typeof data.skills     === 'string' ? data.skills     : null,
        }

        setIsPro(pro)
      } catch (err) {
        console.error('[AiApplyModal] loadProfile error:', err)
      } finally {
        setProfileLoaded(true)
      }
    }
    loadProfile()
  }, [])

  // ── Pipeline triggers when modal opens AND user is Pro ─────────────────────
  useEffect(() => {
    if (open && isPro && profileLoaded && !pipelineRanRef.current) {
      pipelineRanRef.current = true
      runPipeline(profileRef.current)
    }
  }, [open, isPro, profileLoaded]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Pro pipeline ───────────────────────────────────────────────────────────
  async function runPipeline(p: Profile | null) {
    if (!isPro) return

    setStep('preparing')
    setDraftError('')
    setAdaptedCvText('')
    setCvPdfUrl('')
    setCoverLetterPdfUrl('')
    setCoverLetter('')
    cvBlobRef.current = null
    clBlobRef.current = null

    const jobDesc   = description ? stripHtml(description) : tags?.join(', ') ?? ''
    const strengths = [
      p?.full_name  ? `Name: ${p.full_name}` : null,
      p?.headline   ? `Role: ${p.headline}` : null,
      p?.bio        ? `Bio: ${p.bio}` : null,
      p?.experience ? `Experience:\n${p.experience}` : null,
      p?.skills     ? `Skills: ${p.skills}` : null,
    ].filter(Boolean).join('\n\n')

    try {
      // A) Adapt CV
      const cvRes  = await fetch('/api/ai/adapt-cv', {
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
        const blob = await buildCvPdf(p, cvData.adaptedCv, { title: jobTitle, company })
        cvBlobRef.current = blob
        setCvPdfUrl(makePdfUrl(blob))
      }

      // B) Cover letter
      const clRes  = await fetch('/api/ai/cover-letter', {
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
        const blob = await buildCoverLetterPdf(p, text, { title: jobTitle, company })
        clBlobRef.current = blob
        setCoverLetterPdfUrl(makePdfUrl(blob))
      }
    } catch (err) {
      setDraftError(err instanceof Error ? err.message : 'Generation failed — please try again.')
    } finally {
      setStep('ready')
    }
  }

  // Regenerate cover letter PDF when user edits the textarea
  async function handleCoverLetterEdit(text: string) {
    setCoverLetter(text)
    if (!isPro) return
    try {
      const blob = await buildCoverLetterPdf(profileRef.current, text, { title: jobTitle, company })
      clBlobRef.current = blob
      // Revoke old URL before setting new one
      if (coverLetterPdfUrl) URL.revokeObjectURL(coverLetterPdfUrl)
      setCoverLetterPdfUrl(makePdfUrl(blob))
    } catch { /* non-blocking */ }
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError('')

    // Auto-download PDFs so candidate has them for the external application
    if (isPro && cvPdfUrl) {
      const a = document.createElement('a')
      a.href = cvPdfUrl
      a.download = `CV-${company.replace(/\s+/g, '-')}.pdf`
      a.click()
    }
    if (isPro && coverLetterPdfUrl) {
      const a = document.createElement('a')
      a.href = coverLetterPdfUrl
      a.download = `CoverLetter-${company.replace(/\s+/g, '-')}.pdf`
      a.click()
    }

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId, message: coverLetter || null }),
      })
      if (res.status === 401) { router.push('/login?redirectTo=/jobs'); return }
      if (!res.ok && res.status !== 409) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Submission failed — please try again.')
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
    setDraftError('')
    pipelineRanRef.current = false
    setOpen(true)
  }

  function handleClose() { setOpen(false) }

  async function handleRedraft() {
    pipelineRanRef.current = true
    await runPipeline(profileRef.current)
  }

  // ── Trigger button ─────────────────────────────────────────────────────────
  const trigger = applied ? (
    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 whitespace-nowrap">
      ✓ Applied
    </span>
  ) : (
    <button
      type="button"
      onClick={handleOpen}
      className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg border whitespace-nowrap transition-colors"
      style={{ borderColor: BRAND, color: BRAND, background: 'rgba(87,199,227,0.07)' }}
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

  // ── Modal body ─────────────────────────────────────────────────────────────
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
      <div className="flex flex-col items-center justify-center gap-4 py-14 rounded-xl border border-slate-100 bg-slate-50">
        <Spinner className="w-7 h-7 text-[#57C7E3]" />
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-700">
            ✦ Generating your documents…
          </p>
          <p className="text-xs text-slate-400 mt-1">{jobTitle} at {company}</p>
        </div>
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

        {/* CV PDF card */}
        {cvPdfUrl && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg shrink-0">📄</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-emerald-800 truncate">CV adapté — {jobTitle}</p>
                  <p className="text-[11px] text-emerald-600">{company} · PDF professionnel</p>
                </div>
              </div>
              <a
                href={cvPdfUrl}
                download={`CV-${company.replace(/\s+/g, '-')}.pdf`}
                className="shrink-0 flex items-center gap-1 text-xs font-bold text-emerald-700 bg-white border border-emerald-200 rounded-lg px-3 py-1.5 hover:bg-emerald-50 transition-colors"
              >
                ⬇ CV (PDF)
              </a>
            </div>
          </div>
        )}

        {/* Cover letter section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
              Cover letter <span className="normal-case font-normal">(optional — edit freely)</span>
            </p>
            {coverLetterPdfUrl && (
              <a
                href={coverLetterPdfUrl}
                download={`CoverLetter-${company.replace(/\s+/g, '-')}.pdf`}
                className="flex items-center gap-1 text-[11px] font-bold text-[#57C7E3] bg-sky-50 border border-sky-200 rounded-lg px-2.5 py-1 hover:bg-sky-100 transition-colors"
              >
                ⬇ Letter (PDF)
              </a>
            )}
          </div>
          <textarea
            value={coverLetter}
            onChange={e => handleCoverLetterEdit(e.target.value)}
            rows={9}
            placeholder="Your cover letter will appear here…"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#57C7E3] resize-none"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Editing regenerates the PDF automatically.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRedraft}
          className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold border transition-colors"
          style={{ background: 'rgba(87,199,227,0.07)', borderColor: 'rgba(87,199,227,0.35)', color: BRAND }}
        >
          ↺ Redraft documents
        </button>
      </div>
    )
  } else {
    // Freemium
    body = (
      <div className="space-y-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
            Your CV <span className="normal-case font-normal text-slate-400">(optional)</span>
          </p>
          <label className="flex items-center gap-2 w-full cursor-pointer rounded-lg border-2 border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500 hover:border-[#57C7E3] hover:text-[#57C7E3] transition-colors">
            {cvFile
              ? <><span className="flex-1 truncate font-medium text-slate-700">{cvFile.name}</span><span className="text-xs text-slate-400 shrink-0">Replace</span></>
              : '↑ Upload CV — PDF, DOC'}
            <input type="file" accept=".pdf,.doc,.docx" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) setCvFile(f); e.target.value = '' }} />
          </label>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
              Cover letter <span className="normal-case font-normal text-slate-400">(optional)</span>
            </p>
            <div className="flex rounded-lg border border-slate-200 overflow-hidden text-[12px]">
              {(['write', 'upload'] as CoverLetterMode[]).map(mode => (
                <button key={mode} type="button" onClick={() => setClMode(mode)}
                  className={`px-3 py-1 capitalize transition-colors ${
                    clMode === mode ? 'bg-[#57C7E3] text-white font-semibold' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >{mode}</button>
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
              <input type="file" accept=".pdf,.doc,.docx" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) setClFile(f); e.target.value = '' }} />
            </label>
          )}
        </div>

        <button type="button" onClick={() => router.push('/pricing')}
          className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold border opacity-50"
          style={{ borderColor: 'rgba(148,163,184,0.4)', color: '#94a3b8', background: 'rgba(148,163,184,0.06)' }}
        >
          ✦ Draft with AI — Upgrade to Pro
        </button>
      </div>
    )
  }

  // ── Modal ──────────────────────────────────────────────────────────────────
  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-[540px] max-h-[88vh] overflow-y-auto"
        style={{ fontSize: '14px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-lg text-slate-900 leading-snug">Apply for this role</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {jobTitle}{' · '}<span className="font-medium text-slate-700">{company}</span>
            </p>
          </div>
          <button type="button" onClick={handleClose}
            className="ml-4 shrink-0 text-slate-400 hover:text-slate-800 transition-colors text-xl leading-none mt-0.5">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-5">
            {submitSuccess ? (
              <div className="flex flex-col items-center gap-4 py-10">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-2xl">✓</div>
                <div className="text-center">
                  <p className="font-bold text-lg text-emerald-700">Application submitted!</p>
                  <p className="text-sm text-slate-500 mt-1">Sent to {company}.</p>
                  {isPro && cvPdfUrl && (
                    <p className="text-xs text-slate-400 mt-2">Your PDF documents were downloaded automatically.</p>
                  )}
                </div>
                <button type="button" onClick={handleClose}
                  className="px-6 py-2.5 rounded-lg text-sm font-semibold border border-slate-200 hover:bg-slate-50 transition-colors">
                  Close
                </button>
              </div>
            ) : (
              <>
                {/* Job description preview */}
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

          {!submitSuccess && profileLoaded && !(isPro && step === 'preparing') && (
            <div className="flex gap-3 px-6 pb-5 border-t border-slate-100 pt-4">
              <button type="button" onClick={handleClose}
                className="flex-1 py-3 rounded-lg text-sm font-semibold border border-slate-200 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                className="flex-1 py-3 rounded-lg text-sm font-bold text-white transition-colors disabled:opacity-50"
                style={{ background: BRAND }}>
                {submitting
                  ? <span className="flex items-center justify-center gap-2"><Spinner /> Submitting…</span>
                  : isPro && cvPdfUrl ? 'Submit & Download PDFs' : 'Submit Application'}
              </button>
            </div>
          )}

          {applyUrl && !submitSuccess && (
            <div className="px-6 pb-5">
              <a href={applyUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 w-full text-sm text-slate-400 hover:text-[#57C7E3] transition-colors">
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
