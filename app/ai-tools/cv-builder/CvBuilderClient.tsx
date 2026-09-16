'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import { Upload, Download, FileText, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import { improveCv, generateCv } from '@/app/actions/cvBuilder'
import type { CvImprovementResult, CvSection, CvGenerateInput, CvGenerateResult } from '@/lib/ai/cvBuilder'
import { COUNTRY_OPTIONS } from '@/lib/ai/countryProfiles'

type Mode = 'improve' | 'generate'

// ── Score ring ───────────────────────────────────────────────────────────────

function ScoreRing({ score, label }: { score: number; label: string }) {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f97316' : '#ef4444'
  const r = 44
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative flex items-center justify-center w-28 h-28">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" className="stroke-slate-200 dark:stroke-slate-700" strokeWidth="9" />
          <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="9"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.8s ease' }} />
        </svg>
        <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{score}</span>
      </div>
      <span className="text-xs text-slate-500 dark:text-slate-400 text-center">{label}</span>
    </div>
  )
}

// ── Section comparison card ──────────────────────────────────────────────────

function SectionCard({ section }: { section: CvSection }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/60 text-left"
      >
        <span className="font-semibold text-sm text-slate-900 dark:text-white">{section.name}</span>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {expanded && (
        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-700">
          {/* Original */}
          <div className="p-4 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Original</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {section.original || '(empty)'}
            </p>
            {section.suggestions.length > 0 && (
              <div className="mt-3 space-y-1.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-orange-500">Suggestions</p>
                <ul className="space-y-1">
                  {section.suggestions.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <span className="text-orange-500 shrink-0">→</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {/* Rewritten */}
          <div className="p-4 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#57C7E3' }}>Improved</p>
            {section.rewritten ? (
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {section.rewritten}
              </p>
            ) : (
              <p className="text-sm text-slate-400 dark:text-slate-500 italic">Already strong — no rewrite needed.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Premium gate ─────────────────────────────────────────────────────────────

function PremiumGate() {
  return (
    <div className="relative">
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/5 to-white dark:to-card text-center py-12 px-6">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">CV Builder is a Premium Feature</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
          Upgrade to Candidate Pro or Elite to analyze, improve, and generate professional CVs with AI.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mb-8 text-sm text-slate-700 dark:text-slate-300">
          {['CV Score & Analysis', 'Section-by-section rewrites', 'ATS compatibility check', 'PDF generation from profile', 'Tailored for your target markets'].map((f) => (
            <span key={f} className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-full px-3 py-1">
              <span className="text-green-500">✓</span> {f}
            </span>
          ))}
        </div>
        <Link href="/pricing" className="inline-flex items-center gap-2 font-semibold text-white rounded-full px-8 py-3 text-sm transition-all" style={{ background: '#57C7E3' }}>
          Upgrade to Pro →
        </Link>
      </div>
      {/* Blurred skeleton preview */}
      <div className="mt-6 relative select-none pointer-events-none">
        <div className="absolute inset-0 z-10 rounded-2xl backdrop-blur-sm bg-white/60 dark:bg-background/60" />
        <div className="grid md:grid-cols-2 gap-4 opacity-40">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-3">
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
            <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col items-center gap-4">
            <div className="w-28 h-28 rounded-full border-8 border-slate-200 dark:border-slate-700" />
            <div className="grid grid-cols-2 gap-3 w-full">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

type Props = {
  isPremium: boolean
  initialName: string
  initialTitle: string
  initialEmail: string
  initialPhone: string
  initialSkills: string
  initialEducation: string
  initialExperience: string
}

export default function CvBuilderClient({
  isPremium,
  initialName,
  initialTitle,
  initialEmail,
  initialPhone,
  initialSkills,
  initialEducation,
  initialExperience,
}: Props) {
  const [mode, setMode] = useState<Mode>('improve')

  // ── Mode 1 state ──────────────────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState('')
  const [improving, setImproving] = useState(false)
  const [improveError, setImproveError] = useState('')
  const [improveResult, setImproveResult] = useState<CvImprovementResult | null>(null)

  async function handleFile(file: File) {
    if (file.size > 5 * 1024 * 1024) { setImproveError('File too large. Max 5 MB.'); return }
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']
    if (!allowed.includes(file.type)) { setImproveError('Upload a PDF or DOCX file.'); return }

    setFileName(file.name)
    setImproveError('')
    setImproving(true)
    setImproveResult(null)

    // Extract text via existing parse endpoint
    const fd = new FormData()
    fd.append('file', file)
    const parseRes = await fetch('/api/cv/parse', { method: 'POST', body: fd })
    const parseJson = await parseRes.json() as { extracted?: { full_name?: string }; error?: string }

    if (!parseRes.ok) {
      setImproveError(parseJson.error ?? 'Failed to read file.')
      setImproving(false)
      return
    }

    // We need raw text, not structured extraction — but we can use the existing
    // parse route by reading its response. Actually let's just call improveCv
    // with a concatenated text representation built from the extracted fields.
    // For a true raw text pass we'd need a separate endpoint, but the structured
    // extraction gives us enough signal. Build a text representation:
    const extracted = parseJson.extracted as Record<string, unknown> | undefined ?? {}
    const textParts = [
      extracted.full_name && `Name: ${extracted.full_name}`,
      extracted.title && `Title: ${extracted.title}`,
      extracted.email && `Email: ${extracted.email}`,
      extracted.phone && `Phone: ${extracted.phone}`,
      extracted.years_experience && `Years of Experience: ${extracted.years_experience}`,
      extracted.skills && `Skills: ${Array.isArray(extracted.skills) ? (extracted.skills as string[]).join(', ') : extracted.skills}`,
      extracted.education && Array.isArray(extracted.education) && `Education:\n${(extracted.education as Record<string,string>[]).map(e => `${e.degree} — ${e.institution} (${e.year})`).join('\n')}`,
      extracted.experience && Array.isArray(extracted.experience) && `Experience:\n${(extracted.experience as Record<string,string>[]).map(e => `${e.title} at ${e.company} (${e.start}–${e.end})\n${e.description}`).join('\n\n')}`,
      extracted.languages && `Languages: ${Array.isArray(extracted.languages) ? (extracted.languages as string[]).join(', ') : extracted.languages}`,
    ].filter(Boolean)

    const cvText = textParts.join('\n\n')
    const res = await improveCv(cvText)

    if (!res.ok) {
      setImproveError(res.error)
    } else {
      setImproveResult(res.result)
    }
    setImproving(false)
  }

  // ── Mode 2 state ──────────────────────────────────────────────────────────
  const [genInput, setGenInput] = useState<CvGenerateInput>({
    fullName: initialName,
    email: initialEmail,
    phone: initialPhone,
    title: initialTitle,
    yearsExperience: '',
    skills: initialSkills,
    education: initialEducation,
    experience: initialExperience,
    languages: '',
    targetJobCategory: '',
    targetCountries: '',
  })
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState('')
  const [genResult, setGenResult] = useState<CvGenerateResult | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState('')

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    setGenError('')
    setGenerating(true)
    setGenResult(null)

    const res = await generateCv(genInput)
    if (!res.ok) {
      setGenError(res.error)
    } else {
      setGenResult(res.result)
    }
    setGenerating(false)
  }

  async function handleDownloadPdf() {
    if (!genResult) return
    setDownloading(true)
    setDownloadError('')

    const res = await fetch('/api/cv/export-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: genInput.fullName,
        title: genInput.title,
        contact: [genInput.email, genInput.phone].filter(Boolean).join(' · '),
        summary: genResult.summary,
        experience: genResult.experience,
        skills: genResult.skills,
        education: genResult.education,
        languages: genResult.languages,
        additionalSections: genResult.additionalSections,
      }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({})) as { error?: string }
      setDownloadError(data.error ?? 'Download failed. Please try again.')
      setDownloading(false)
      return
    }

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${genInput.fullName || 'CV'}_CV.pdf`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    setDownloading(false)
  }

  const labelClass = 'block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1'
  const inputClass = 'w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#57C7E3] focus:ring-1 focus:ring-[#57C7E3]'

  const JOB_CATEGORIES = ['Engineering', 'Design', 'Marketing', 'Sales', 'Finance', 'Operations', 'Data & Analytics', 'Product', 'Customer Success', 'Other']

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#57C7E3' }}>AI Tools</p>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">CV Builder</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl">
          Improve your existing CV with AI analysis and side-by-side rewrites, or generate a new ATS-ready CV directly from your profile.
        </p>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-2 mb-8 border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setMode('improve')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
            mode === 'improve'
              ? 'border-[#57C7E3] text-[#57C7E3]'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <FileText className="w-4 h-4" /> Improve My CV
        </button>
        <button
          type="button"
          onClick={() => setMode('generate')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
            mode === 'generate'
              ? 'border-[#57C7E3] text-[#57C7E3]'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Sparkles className="w-4 h-4" /> Generate New CV
        </button>
      </div>

      {/* Premium gate */}
      {!isPremium && <PremiumGate />}

      {/* ── MODE 1: Improve ── */}
      {isPremium && mode === 'improve' && (
        <div className="space-y-8">
          {/* Upload area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
            onClick={() => fileInputRef.current?.click()}
            className="rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-colors"
            style={{ borderColor: dragOver ? '#57C7E3' : undefined, background: dragOver ? 'rgba(87,199,227,0.05)' : undefined }}
          >
            {improving ? (
              <div className="flex flex-col items-center gap-3">
                <svg className="animate-spin w-8 h-8" style={{ color: '#57C7E3' }} fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <p className="text-sm text-slate-500 dark:text-slate-400">Analysing your CV with AI…</p>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 mx-auto mb-3 text-slate-400" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {fileName ? `Selected: ${fileName}` : 'Drop your CV here, or click to browse'}
                </p>
                <p className="text-xs text-slate-400">PDF or DOCX · Max 5 MB</p>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />
          {improveError && <p className="text-sm text-red-500 dark:text-red-400 text-center">{improveError}</p>}

          {/* Results */}
          {improveResult && (
            <div className="space-y-8">
              {/* Score overview */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">CV Score Overview</h2>
                <div className="flex flex-wrap gap-8 justify-center">
                  <ScoreRing score={improveResult.overallScore} label="Overall Score" />
                  <ScoreRing score={improveResult.scoreBreakdown.clarity} label="Clarity" />
                  <ScoreRing score={improveResult.scoreBreakdown.ats} label="ATS Compatibility" />
                  <ScoreRing score={improveResult.scoreBreakdown.impact} label="Impact Language" />
                  <ScoreRing score={improveResult.scoreBreakdown.keywords} label="Keyword Density" />
                </div>
              </div>

              {/* Side-by-side sections */}
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Section-by-Section Analysis</h2>
                <div className="space-y-3">
                  {improveResult.sections.map((section, i) => (
                    <SectionCard key={i} section={section} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MODE 2: Generate ── */}
      {isPremium && mode === 'generate' && (
        <div className="space-y-8">
          <form onSubmit={handleGenerate} className="grid md:grid-cols-2 gap-6">
            {/* Left column: personal info */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Your Information</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Pre-filled from your profile. Edit before generating.</p>

              <div>
                <label className={labelClass}>Full Name</label>
                <input className={inputClass} value={genInput.fullName} onChange={(e) => setGenInput({ ...genInput, fullName: e.target.value })} placeholder="John Smith" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Email</label>
                  <input type="email" className={inputClass} value={genInput.email} onChange={(e) => setGenInput({ ...genInput, email: e.target.value })} placeholder="john@example.com" />
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input className={inputClass} value={genInput.phone} onChange={(e) => setGenInput({ ...genInput, phone: e.target.value })} placeholder="+1 555 000 0000" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Current Title</label>
                  <input className={inputClass} value={genInput.title} onChange={(e) => setGenInput({ ...genInput, title: e.target.value })} placeholder="Software Engineer" />
                </div>
                <div>
                  <label className={labelClass}>Years of Experience</label>
                  <input type="number" min="0" className={inputClass} value={genInput.yearsExperience} onChange={(e) => setGenInput({ ...genInput, yearsExperience: e.target.value })} placeholder="5" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Skills</label>
                <input className={inputClass} value={genInput.skills} onChange={(e) => setGenInput({ ...genInput, skills: e.target.value })} placeholder="JavaScript, React, Node.js, SQL…" />
              </div>
              <div>
                <label className={labelClass}>Languages</label>
                <input className={inputClass} value={genInput.languages} onChange={(e) => setGenInput({ ...genInput, languages: e.target.value })} placeholder="English (Native), French (Fluent)…" />
              </div>
              <div>
                <label className={labelClass}>Education</label>
                <textarea rows={2} className={inputClass} value={genInput.education} onChange={(e) => setGenInput({ ...genInput, education: e.target.value })} placeholder="B.Sc. Computer Science — MIT (2018)" />
              </div>
              <div>
                <label className={labelClass}>Work Experience</label>
                <textarea rows={4} className={inputClass} value={genInput.experience} onChange={(e) => setGenInput({ ...genInput, experience: e.target.value })} placeholder="Senior Engineer at Stripe · 2021–Present…" />
              </div>
            </div>

            {/* Right column: targeting */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Targeting</h2>
                <div>
                  <label className={labelClass}>Target Job Category</label>
                  <select className={inputClass} value={genInput.targetJobCategory} onChange={(e) => setGenInput({ ...genInput, targetJobCategory: e.target.value })}>
                    <option value="">Select category…</option>
                    {JOB_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Target Countries</label>
                  <select
                    multiple
                    className={`${inputClass} h-40`}
                    value={genInput.targetCountries.split(',').filter(Boolean)}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions).map((o: HTMLOptionElement) => o.value)
                      setGenInput({ ...genInput, targetCountries: selected.join(',') })
                    }}
                  >
                    {COUNTRY_OPTIONS.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
                  </select>
                  <p className="text-xs text-slate-400 mt-1">Hold Ctrl/Cmd to select multiple</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={generating}
                className="w-full flex items-center justify-center gap-2 font-semibold text-white rounded-full px-8 py-3 text-sm transition-all disabled:opacity-60"
                style={{ background: '#57C7E3' }}
              >
                {generating ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Generating CV…
                  </>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Generate My CV</>
                )}
              </button>

              {genError && <p className="text-sm text-red-500 dark:text-red-400 text-center">{genError}</p>}
            </div>
          </form>

          {/* Generated result */}
          {genResult && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Generated CV Preview</h2>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={downloading}
                  className="flex items-center gap-2 font-semibold text-white rounded-full px-5 py-2 text-sm transition-all disabled:opacity-60"
                  style={{ background: '#57C7E3' }}
                >
                  {downloading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Preparing PDF…
                    </>
                  ) : (
                    <><Download className="w-4 h-4" /> Download PDF</>
                  )}
                </button>
              </div>
              {downloadError && <p className="text-sm text-red-500 dark:text-red-400 px-6 pt-3">{downloadError}</p>}
              <div className="p-6 space-y-6 font-mono text-sm">
                {/* Header */}
                <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{genInput.fullName || 'Candidate'}</p>
                  <p className="text-sm font-semibold" style={{ color: '#57C7E3' }}>{genInput.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{[genInput.email, genInput.phone].filter(Boolean).join(' · ')}</p>
                </div>

                {genResult.summary && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: '#57C7E3' }}>Professional Summary</p>
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{genResult.summary}</p>
                  </div>
                )}
                {genResult.experience && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: '#57C7E3' }}>Work Experience</p>
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{genResult.experience}</p>
                  </div>
                )}
                {genResult.skills && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: '#57C7E3' }}>Skills</p>
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{genResult.skills}</p>
                  </div>
                )}
                {genResult.education && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: '#57C7E3' }}>Education</p>
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{genResult.education}</p>
                  </div>
                )}
                {genResult.languages && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: '#57C7E3' }}>Languages</p>
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{genResult.languages}</p>
                  </div>
                )}
                {genResult.additionalSections && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: '#57C7E3' }}>Additional</p>
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{genResult.additionalSections}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
