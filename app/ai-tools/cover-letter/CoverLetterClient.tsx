'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Markdown } from '@/lib/docExport'
import RewriteSuggestion from '@/components/resume-builder/RewriteSuggestion'
import StyleSelector, { type CoverLetterStyle } from '@/components/cover-letter/StyleSelector'
import { sanitizeTargetRole, stripTargetRoleNewlines, MAX_TARGET_ROLE_LENGTH } from '@/lib/ai/resumeGuard'
import { saveCoverLetterDraft } from '@/app/actions/coverLetters'
import { copyToClipboard } from '@/lib/clipboard'

type ScoreBreakdown = { relevance: number; impact: number; tone: number; structure: number }
type LetterSection = 'opening' | 'body' | 'closing'
type LetterSuggestion = { section: LetterSection; suggestion: string }
type CoverLetterData = {
  score: number
  scoreBreakdown: ScoreBreakdown
  improvements: string[]
  letter: {
    subject: string
    greeting: string
    opening: string
    body: string
    closing: string
    signature: string
  }
  suggestions: LetterSuggestion[]
  companyResearch?: { used: boolean; sources?: { title: string; url: string }[] }
}

function ScoreRing({ score, label }: { score: number; label: string }) {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f97316' : '#ef4444'
  const r = 52
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  return (
    <div className="relative flex items-center justify-center w-36 h-36">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" className="stroke-slate-200 dark:stroke-slate-700" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div className="text-center">
        <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{score}</div>
        <div className="text-xs text-slate-600 dark:text-slate-400">{label}</div>
      </div>
    </div>
  )
}

// Downloads the cover letter as a real PDF/DOCX file rendered server-side
// (see app/api/cover-letter/export/route.ts) from the exact same content
// shown in the preview — including the date line and any accepted
// suggestion edits — never a separately reconstructed version.
async function downloadCoverLetterFile(
  letter: CoverLetterData['letter'],
  dateLine: string,
  companyName: string,
  format: 'pdf' | 'docx',
  exportFailedMsg: string
) {
  const res = await fetch('/api/cover-letter/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      letter: { ...letter, dateLine },
      companyName,
      format,
    }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || exportFailedMsg)
  }
  const disposition = res.headers.get('Content-Disposition') ?? ''
  const match = disposition.match(/filename="([^"]+)"/)
  const filename = match?.[1] ?? `CoverLetter.${format}`
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function PremiumSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10 animate-pulse">
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-48 mb-6" />
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-72 mb-2" />
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-96 mb-8" />
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
              <div className="h-10 bg-slate-300 dark:bg-slate-700 rounded" />
            </div>
          ))}
        </div>
        <div className="card flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-slate-300 dark:border-slate-700" />
        </div>
      </div>
    </div>
  )
}

export default function CoverLetterClient({
  isPremium,
  initialTargetRole = '',
  initialCompany = '',
  initialJobDescription = '',
  initialStrengths = '',
}: {
  isPremium: boolean
  initialTargetRole?: string
  initialCompany?: string
  initialJobDescription?: string
  initialStrengths?: string
}) {
  const t = useTranslations('coverLetter')
  const SECTION_LABELS: Record<LetterSection, string> = {
    opening: t('sectionOpening'),
    body: t('sectionBody'),
    closing: t('sectionClosing'),
  }

  const [mounted, setMounted] = useState(false)
  const [targetRole, setTargetRole] = useState(initialTargetRole)
  const [company, setCompany] = useState(initialCompany)
  const [jobDescription, setJobDescription] = useState(initialJobDescription)
  const [strengths, setStrengths] = useState(initialStrengths)
  const [style, setStyle] = useState<CoverLetterStyle>('Formal')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CoverLetterData | null>(null)
  const [dateLine, setDateLine] = useState('')
  const [error, setError] = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [saveError, setSaveError] = useState('')
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'manual'>('idle')
  const [copyText, setCopyText] = useState('')
  const [exportingFormat, setExportingFormat] = useState<'pdf' | 'docx' | null>(null)
  const [exportError, setExportError] = useState('')
  useEffect(() => setMounted(true), [])

  if (!mounted) return <PremiumSkeleton />

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    if (!isPremium) return
    setLoading(true)
    setError('')
    setResult(null)
    setSaveStatus('idle')
    try {
      const res = await fetch('/api/ai/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRole, company, jobDescription, strengths, style }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('generationFailed'))
      // Real current date at generation time — never model-generated, never
      // a placeholder. Captured once here so it doesn't drift if the result
      // stays on screen across a day boundary.
      setDateLine(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))
      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('somethingWentWrong'))
    } finally {
      setLoading(false)
    }
  }

  // Same accept/reject pattern as the Resume Builder's rewrite suggestions —
  // accepting replaces the corresponding letter section with the suggested
  // text, which is itself grounded in the same real input (never separately
  // fabricated).
  function handleAcceptSuggestion(section: LetterSection, text: string) {
    setResult((prev) => prev && { ...prev, letter: { ...prev.letter, [section]: text } })
    setSaveStatus('idle')
  }

  // Plain-text version of exactly what's on screen — client-side only, no
  // server round-trip needed just to put text on the clipboard.
  async function handleCopy() {
    if (!result) return
    const { letter } = result
    const text = [dateLine, '', letter.greeting, '', letter.opening, '', letter.body, '', letter.closing, '', letter.signature]
      .join('\n')
    const res = await copyToClipboard(text)
    if (res.ok) {
      setCopyStatus('copied')
      setTimeout(() => setCopyStatus('idle'), 2000)
    } else {
      // Both copy mechanisms failed — surface the raw text so the candidate
      // can still copy it manually rather than just seeing an error.
      setCopyText(text)
      setCopyStatus('manual')
    }
  }

  // Saves exactly the letter currently on screen — including any accepted
  // suggestion edits — never a separately reconstructed version.
  async function handleSaveDraft() {
    if (!result) return
    setSaveStatus('saving')
    setSaveError('')
    const res = await saveCoverLetterDraft({
      companyName: company,
      targetRole,
      jobDescription,
      style,
      letterContent: result.letter,
    })
    if (res.ok) {
      setSaveStatus('saved')
    } else {
      setSaveStatus('error')
      setSaveError(res.error)
    }
  }

  async function handleExport(format: 'pdf' | 'docx') {
    if (!result) return
    setExportingFormat(format)
    setExportError('')
    try {
      await downloadCoverLetterFile(result.letter, dateLine, company, format, t('exportFailed'))
    } catch (err) {
      setExportError(err instanceof Error ? err.message : t('exportFailed'))
    } finally {
      setExportingFormat(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-3">
          <Link href="/candidate" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t('breadcrumbDashboard')}</Link>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-300">{t('breadcrumbCurrent')}</span>
        </div>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
              {t('title')} <span className="text-orange-600 dark:text-accent">✦</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400">{t('subtitle')}</p>
          </div>
          <div className="flex items-center gap-3">
            {isPremium && (
              <Link href="/ai-tools/cover-letter/history" className="text-sm text-primary hover:underline">
                {t('viewHistory')}
              </Link>
            )}
            <span className="inline-flex items-center gap-1.5 bg-accent/10 text-orange-700 dark:text-accent border border-accent/30 rounded-full px-3 py-1 text-xs font-semibold">
              {t('premiumFeature')}
            </span>
          </div>
        </div>
      </div>

      {/* Premium gate */}
      {!isPremium && (
        <div className="relative mb-8">
          <div className="card border-accent/40 bg-gradient-to-br from-accent/5 to-white dark:to-card text-center py-12 px-6">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('unlockTitle')}</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
              {t('unlockDesc')}
            </p>
            <div className="flex flex-wrap gap-3 justify-center mb-8 text-sm text-slate-700 dark:text-slate-300">
              {[t('featureUnlimitedLetters'), t('featureQualityScore'), t('featurePdfDownload'), t('featureCompanyTone'), t('featureImprovementTips')].map(f => (
                <span key={f} className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-full px-3 py-1">
                  <span className="text-green-600 dark:text-green-400">✓</span> {f}
                </span>
              ))}
            </div>
            <Link href="/pricing" className="btn-primary px-8 py-3 text-base">
              {t('upgradeCta')}
            </Link>
          </div>

          {/* Blurred preview */}
          <div className="mt-6 relative select-none pointer-events-none">
            <div className="absolute inset-0 z-10 backdrop-blur-sm bg-white/60 dark:bg-background/60 rounded-2xl" />
            <div className="grid md:grid-cols-2 gap-6 opacity-40">
              <div className="card space-y-4">
                <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-1/2" />
                <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-1/3" />
                <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-2/5" />
                <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
              <div className="card flex flex-col items-center justify-center gap-4 py-10">
                <div className="w-36 h-36 rounded-full border-8 border-slate-300 dark:border-slate-700" />
                <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-24" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-40" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-32" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main form — premium only */}
      {isPremium && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Input form */}
          <form onSubmit={handleGenerate} className="card space-y-5">
            <h2 className="font-semibold text-slate-900 dark:text-white text-lg">{t('jobDetails')}</h2>

            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1.5">{t('targetJobTitle')} <span className="text-red-500 dark:text-red-400">*</span></label>
              <input
                value={targetRole}
                onChange={e => setTargetRole(stripTargetRoleNewlines(e.target.value))}
                onBlur={e => setTargetRole(sanitizeTargetRole(e.target.value))}
                maxLength={MAX_TARGET_ROLE_LENGTH}
                required placeholder={t('targetJobTitlePlaceholder')}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1.5">{t('companyName')} <span className="text-red-500 dark:text-red-400">*</span></label>
              <input
                value={company} onChange={e => setCompany(e.target.value)}
                required placeholder={t('companyNamePlaceholder')}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1.5">{t('jobDescription')} <span className="text-slate-400 dark:text-slate-400">{t('jobDescriptionHint')}</span></label>
              <textarea
                value={jobDescription} onChange={e => setJobDescription(e.target.value)}
                rows={6} placeholder={t('jobDescriptionPlaceholder')}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1.5">{t('yourStrengths')}</label>
              <textarea
                value={strengths} onChange={e => setStrengths(e.target.value)}
                rows={5} placeholder={t('yourStrengthsPlaceholder')}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1.5">{t('writingStyle')}</label>
              <StyleSelector value={style} onChange={setStyle} />
            </div>

            {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm font-semibold disabled:opacity-50">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  {t('generatingButton')}
                </span>
              ) : t('generateButton')}
            </button>
          </form>

          {/* Results panel */}
          <div className="space-y-5">
            {!result && !loading && (
              <div className="card flex flex-col items-center justify-center py-16 text-center text-slate-600 dark:text-slate-400">
                <div className="text-4xl mb-3">✉️</div>
                <p className="text-sm">{t('emptyStatePrompt')}</p>
              </div>
            )}

            {loading && (
              <div className="card flex flex-col items-center justify-center py-16 text-center gap-3">
                <svg className="animate-spin w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                <p className="text-sm text-slate-600 dark:text-slate-400">{t('writingLetter')}</p>
              </div>
            )}

            {result && (
              <>
                {/* Score card */}
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-slate-900 dark:text-white">{t('qualityScore')}</h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopy}
                        className="btn-outline text-xs py-2 px-4 flex items-center gap-1.5"
                      >
                        {copyStatus === 'copied' ? t('copied') : t('copy')}
                      </button>
                      <button
                        onClick={handleSaveDraft}
                        disabled={saveStatus === 'saving'}
                        className="btn-outline text-xs py-2 px-4 flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {saveStatus === 'saving' ? t('saving') : saveStatus === 'saved' ? t('saved') : t('saveDraft')}
                      </button>
                      <button
                        onClick={() => handleExport('pdf')}
                        disabled={exportingFormat !== null}
                        className="btn-outline text-xs py-2 px-4 flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {exportingFormat === 'pdf' ? t('preparingPdf') : t('downloadPdf')}
                      </button>
                      <button
                        onClick={() => handleExport('docx')}
                        disabled={exportingFormat !== null}
                        className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {exportingFormat === 'docx' ? t('preparingDocx') : t('downloadDocx')}
                      </button>
                    </div>
                  </div>
                  {exportError && (
                    <p className="text-red-600 dark:text-red-400 text-xs mb-3">{exportError}</p>
                  )}
                  {saveStatus === 'error' && (
                    <p className="text-red-600 dark:text-red-400 text-xs mb-3">{saveError}</p>
                  )}
                  {copyStatus === 'manual' && (
                    <div className="mb-3">
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1.5">
                        {t('shareBlocked')}
                      </p>
                      <textarea
                        readOnly
                        value={copyText}
                        onFocus={(e) => e.currentTarget.select()}
                        ref={(el) => el?.focus()}
                        rows={4}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white resize-none"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-6">
                    <ScoreRing score={result.score} label={t('qualityScore')} />
                    <div className="flex-1 space-y-2.5">
                      {/* Score breakdown categories are the AI response's fixed
                          schema field names — left untranslated, same as Resume Builder. */}
                      {Object.entries(result.scoreBreakdown).map(([key, val]) => (
                        <div key={key}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="capitalize text-slate-600 dark:text-slate-400">{key}</span>
                            <span className="text-slate-700 dark:text-slate-300">{val}/25</span>
                          </div>
                          <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full" style={{ width: `${(val / 25) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Improvements — result.improvements is real AI-generated content */}
                <div className="card">
                  <h2 className="font-semibold text-slate-900 dark:text-white mb-3">{t('howToImprove')}</h2>
                  <ul className="space-y-2">
                    {result.improvements.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <span className="text-orange-600 dark:text-accent mt-0.5">→</span> {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Company research indicator — tells the candidate whether the
                    letter draws on real, sourced web search results or not */}
                {result.companyResearch && (
                  result.companyResearch.used ? (
                    <div className="card border-green-500/30 bg-green-50 dark:bg-green-500/5">
                      <p className="text-sm text-green-700 dark:text-green-400 flex items-center gap-1.5 font-medium">
                        {t('companyResearchUsed')}
                      </p>
                      {!!result.companyResearch.sources?.length && (
                        <ul className="mt-2 space-y-1">
                          {result.companyResearch.sources.map((s, i) => (
                            <li key={i} className="text-xs">
                              <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                                {s.title || s.url}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <div className="card">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {t('companyResearchNotUsed')}
                      </p>
                    </div>
                  )
                )}

                {/* Letter preview — result.letter.* is real AI-generated content, never translated */}
                <div className="card">
                  <h2 className="font-semibold text-slate-900 dark:text-white mb-4">{t('generatedCoverLetter')}</h2>
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-5 text-sm space-y-4">
                    <p className="text-slate-600 dark:text-slate-400 text-xs">{result.letter.subject}</p>
                    <p className="text-slate-600 dark:text-slate-400 text-xs">{dateLine}</p>
                    <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
                      <Markdown text={result.letter.greeting} />
                      <div className="space-y-4 text-justify">
                        <Markdown text={result.letter.opening} />
                        <Markdown text={result.letter.body} className="space-y-3" />
                        <Markdown text={result.letter.closing} />
                      </div>
                      <Markdown text={result.letter.signature} className="text-slate-600 dark:text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* AI suggestions — same accept/reject pattern as Resume Builder */}
                {result.suggestions.length > 0 && (
                  <div className="card">
                    <h2 className="font-semibold text-slate-900 dark:text-white mb-3">{t('suggestions')}</h2>
                    <div className="space-y-3">
                      {result.suggestions.map((s, i) => (
                        <RewriteSuggestion
                          key={`${s.section}-${i}`}
                          label={SECTION_LABELS[s.section]}
                          suggestion={s.suggestion}
                          onAccept={(text) => handleAcceptSuggestion(s.section, text)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
