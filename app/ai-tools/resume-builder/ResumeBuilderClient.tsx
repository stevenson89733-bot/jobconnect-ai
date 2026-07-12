'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Gauge, FileCheck2, KeyRound, SpellCheck2, TrendingUp, Wand2, AlertTriangle, RefreshCw } from 'lucide-react'
import { mdToHtml, printAsPdf } from '@/lib/docExport'
import InsightCard from '@/components/career-coach/InsightCard'
import SkillTag from '@/components/career-coach/SkillTag'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import RewriteSuggestion from '@/components/resume-builder/RewriteSuggestion'
import ResumePreview, { type ResumeContent, type ResumeTemplateId } from '@/components/resume-builder/ResumePreview'
import TemplateSelector from '@/components/resume-builder/TemplateSelector'
import { analyzeResume } from '@/app/actions/resumeAnalysis'
import type { ResumeAnalysis, RewriteSection } from '@/lib/ai/resumeAnalysis'
import { hasEnoughExperience, stripTargetRoleNewlines, sanitizeTargetRole, MAX_TARGET_ROLE_LENGTH } from '@/lib/ai/resumeGuard'

type ScoreBreakdown = { keywords: number; formatting: number; experience: number; skills: number }
type ResumeData = {
  score: number
  scoreBreakdown: ScoreBreakdown
  improvements: string[]
  resume: {
    name: string
    title: string
    contact: string
    summary: string
    experience: string
    skills: string
    education: string
  }
}

function ScoreRing({ score }: { score: number }) {
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
        <div className="text-xs text-slate-600 dark:text-slate-400">ATS Score</div>
      </div>
    </div>
  )
}

function downloadPDF(data: ResumeData) {
  const { resume } = data
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const body = `
<h1>${esc(resume.name)}</h1>
<div class="title">${esc(resume.title)}</div>
<div class="contact">${esc(resume.contact)}</div>
<div class="score">ATS Score: <strong>${data.score}/100</strong></div>
<h2>Professional Summary</h2>
${mdToHtml(resume.summary)}
<h2>Experience</h2>
${mdToHtml(resume.experience)}
<h2>Skills</h2>
${mdToHtml(resume.skills)}
<h2>Education</h2>
${mdToHtml(resume.education)}`

  printAsPdf(body, `${resume.name.replace(/\s+/g, '_')}_Resume`)
}

function PremiumSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10 animate-pulse">
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-48 mb-6" />
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-72 mb-2" />
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-96 mb-8" />
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card space-y-4">
          {[...Array(5)].map((_, i) => (
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

export default function ResumeBuilderClient({
  isPremium,
  initialTargetRole = '',
  initialExperience = '',
  initialSkills = '',
  initialEducation = '',
  initialSummary = '',
  initialName = '',
  initialContact = '',
}: {
  isPremium: boolean
  initialTargetRole?: string
  initialExperience?: string
  initialSkills?: string
  initialEducation?: string
  initialSummary?: string
  initialName?: string
  initialContact?: string
}) {
  const [mounted, setMounted] = useState(false)
  // Pre-filled from the candidate's real saved profile (see page.tsx) —
  // still fully editable, this is a starting point, not a lockdown.
  const [targetRole, setTargetRole] = useState(initialTargetRole)
  const [experience, setExperience] = useState(initialExperience)
  const [skills, setSkills] = useState(initialSkills)
  const [education, setEducation] = useState(initialEducation)
  const [summary, setSummary] = useState(initialSummary)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ResumeData | null>(null)
  const [error, setError] = useState('')

  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [analysisError, setAnalysisError] = useState('')
  // Snapshot of the resume content at the moment analysis last ran, to
  // detect when the candidate has since edited it (e.g. accepted a rewrite
  // suggestion) — see isAnalysisStale below.
  const [analyzedSnapshot, setAnalyzedSnapshot] = useState<string | null>(null)

  const [template, setTemplate] = useState<ResumeTemplateId>('classic')

  useEffect(() => setMounted(true), [])

  // Real-time, client-only preview — no LLM call. Before the first
  // generation this reflects exactly what's typed in the form (plus the
  // candidate's real name/contact); after generation it shows the AI
  // output, still through the same template renderer. Templates never
  // alter this content, only how it's laid out.
  const draftContent: ResumeContent = {
    name: initialName,
    contact: initialContact,
    title: targetRole,
    summary,
    experience,
    skills,
    education,
  }
  const previewContent: ResumeContent = result ? result.resume : draftContent
  const resumeContentKey = JSON.stringify(previewContent)
  const isAnalysisStale = !!analysis && analyzedSnapshot !== null && analyzedSnapshot !== resumeContentKey

  if (!mounted) return <PremiumSkeleton />

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    if (!isPremium) return
    if (!hasEnoughExperience(experience)) {
      setError('Add a bit more detail to Work Experience — a few words isn\'t enough for a real resume, and we won\'t invent one for you.')
      return
    }
    const cleanTargetRole = sanitizeTargetRole(targetRole)
    setTargetRole(cleanTargetRole)
    setLoading(true)
    setError('')
    setResult(null)
    // A newly generated resume invalidates any prior analysis.
    setAnalysis(null)
    setAnalyzedSnapshot(null)
    setAnalysisError('')
    try {
      const res = await fetch('/api/ai/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRole: cleanTargetRole, experience, skills, education, summary }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleAnalyze() {
    if (!result) return
    setAnalysisLoading(true)
    setAnalysisError('')
    try {
      const res = await analyzeResume({
        targetRole,
        summary: result.resume.summary,
        experience: result.resume.experience,
        skills: result.resume.skills,
        education: result.resume.education,
      })
      if (res.ok) {
        setAnalysis(res.analysis)
        setAnalyzedSnapshot(resumeContentKey)
      } else {
        setAnalysisError(res.error)
      }
    } finally {
      setAnalysisLoading(false)
    }
  }

  function handleAcceptRewrite(section: RewriteSection, text: string) {
    setResult((prev) => prev && { ...prev, resume: { ...prev.resume, [section]: text } })
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-500 mb-3">
          <Link href="/candidate" className="hover:text-slate-900 dark:hover:text-white transition-colors">Dashboard</Link>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-300">AI Resume Builder</span>
        </div>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
              AI Resume Builder <span className="text-orange-600 dark:text-accent">✦</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400">Generate an ATS-optimized resume tailored to your target role using GPT-4o.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 bg-accent/10 text-orange-700 dark:text-accent border border-accent/30 rounded-full px-3 py-1 text-xs font-semibold">
            ✦ Premium Feature
          </span>
        </div>
      </div>

      {/* Premium gate */}
      {!isPremium && (
        <div className="relative mb-8">
          <div className="card border-accent/40 bg-gradient-to-br from-accent/5 to-white dark:to-card text-center py-12 px-6">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Unlock AI Resume Builder</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
              Generate unlimited ATS-optimized resumes, get your Resume Score, and download as PDF — all powered by GPT-4o.
            </p>
            <div className="flex flex-wrap gap-3 justify-center mb-8 text-sm text-slate-700 dark:text-slate-300">
              {['Unlimited AI resumes', 'ATS Score (0–100)', 'PDF download', 'Tailored to any job title', 'Improvement tips'].map(f => (
                <span key={f} className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-full px-3 py-1">
                  <span className="text-green-600 dark:text-green-400">✓</span> {f}
                </span>
              ))}
            </div>
            <Link href="/pricing" className="btn-primary px-8 py-3 text-base">
              Upgrade to Premium — $19/mo
            </Link>
          </div>

          {/* Blurred preview below the gate */}
          <div className="mt-6 relative select-none pointer-events-none">
            <div className="absolute inset-0 z-10 backdrop-blur-sm bg-white/60 dark:bg-background/60 rounded-2xl" />
            <div className="grid md:grid-cols-2 gap-6 opacity-40">
              <div className="card space-y-4">
                <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-1/2" />
                <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-1/3" />
                <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded" />
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

      {/* Main form — shown only for premium */}
      {isPremium && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Input form */}
          <form onSubmit={handleGenerate} className="card space-y-5">
            <h2 className="font-semibold text-slate-900 dark:text-white text-lg">Your Information</h2>

            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1.5">Target Job Title <span className="text-red-500 dark:text-red-400">*</span></label>
              <input
                value={targetRole} onChange={e => setTargetRole(stripTargetRoleNewlines(e.target.value))}
                required maxLength={MAX_TARGET_ROLE_LENGTH} placeholder="e.g. Senior Frontend Engineer"
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1.5">Work Experience <span className="text-red-500 dark:text-red-400">*</span></label>
              <textarea
                value={experience} onChange={e => setExperience(e.target.value)}
                required rows={5} placeholder="List your roles, companies, dates, and key achievements..."
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary resize-none"
              />
              {experience.trim().length > 0 && !hasEnoughExperience(experience) && (
                <p className="text-xs text-yellow-700 dark:text-yellow-500 mt-1.5">
                  A bit more detail will give you a real, non-fabricated resume instead of a generic one.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1.5">Skills</label>
              <input
                value={skills} onChange={e => setSkills(e.target.value)}
                placeholder="TypeScript, React, Node.js, PostgreSQL, AWS..."
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1.5">Education</label>
              <input
                value={education} onChange={e => setEducation(e.target.value)}
                placeholder="B.S. Computer Science, MIT, 2018"
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1.5">Professional Summary (optional)</label>
              <textarea
                value={summary} onChange={e => setSummary(e.target.value)}
                rows={2} placeholder="Any specific angle or positioning you want emphasized..."
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary resize-none"
              />
            </div>

            {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm font-semibold disabled:opacity-50">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Generating with GPT-4o…
                </span>
              ) : '✦ Generate AI Resume'}
            </button>
          </form>

          {/* Results panel */}
          <div className="space-y-5">
            {/* Live preview — pure client-side rendering, no LLM call. Shows
                the AI output once generated, the raw form content until then. */}
            <div className="card">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-semibold text-slate-900 dark:text-white">{result ? 'Generated Resume' : 'Live Preview'}</h2>
                <TemplateSelector value={template} onChange={setTemplate} />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-500 mb-4">
                {result
                  ? 'AI-polished with GPT-4o. Switching templates never changes this content.'
                  : 'Updates instantly as you type — click Generate for an AI-polished, ATS-optimized version.'}
              </p>
              <ResumePreview content={previewContent} template={template} />
            </div>

            {loading && (
              <div className="card flex flex-col items-center justify-center py-16 text-center gap-3">
                <svg className="animate-spin w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                <p className="text-sm text-slate-600 dark:text-slate-400">GPT-4o is crafting your resume…</p>
              </div>
            )}

            {result && (
              <>
                {/* Score card */}
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-slate-900 dark:text-white">Resume Score</h2>
                    <button
                      onClick={() => downloadPDF(result)}
                      className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                    >
                      ⬇ Download PDF
                    </button>
                  </div>
                  <div className="flex items-center gap-6">
                    <ScoreRing score={result.score} />
                    <div className="flex-1 space-y-2.5">
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

                {/* Improvements */}
                <div className="card">
                  <h2 className="font-semibold text-slate-900 dark:text-white mb-3">How to Improve</h2>
                  <ul className="space-y-2">
                    {result.improvements.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <span className="text-orange-600 dark:text-accent mt-0.5">→</span> {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Deep analysis — explicit action, not automatic */}
                <div className="card">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="font-semibold text-slate-900 dark:text-white">Deep Analysis</h2>
                    <Button variant="primary" size="sm" onClick={handleAnalyze} disabled={analysisLoading}>
                      <RefreshCw className={`w-3.5 h-3.5 ${analysisLoading ? 'animate-spin' : ''}`} />
                      {analysisLoading ? 'Analyzing…' : analysis ? 'Re-analyze' : 'Analyze Resume'}
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mb-4">
                    Score, keywords, grammar, achievements, and rewrite suggestions for this exact resume.
                  </p>
                  {isAnalysisStale && (
                    <p className="text-xs text-yellow-700 dark:text-yellow-500 mb-4 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
                      Analysis may be outdated — the resume changed since this was generated. Click Re-analyze to refresh.
                    </p>
                  )}

                  {analysisError && (
                    <Card className="border-red-300 dark:border-red-800/50 mb-4">
                      <CardContent className="p-3 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" strokeWidth={1.75} />
                        <p className="text-xs text-red-700 dark:text-red-400">{analysisError}</p>
                      </CardContent>
                    </Card>
                  )}

                  {analysisLoading && !analysis && (
                    <div className="flex flex-col items-center justify-center py-10 text-center gap-3 text-slate-600 dark:text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin text-primary" strokeWidth={1.75} />
                      <p className="text-sm">GPT-4o is analyzing your resume — this can take up to a minute.</p>
                    </div>
                  )}

                  {analysis && (
                    <div className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <InsightCard icon={Gauge} title="Resume Score"
                          badge={<span className="text-xl font-extrabold text-primary tabular-nums">{analysis.resumeScore.score}</span>}>
                          {analysis.resumeScore.explanation}
                        </InsightCard>
                        <InsightCard icon={FileCheck2} title="ATS Score"
                          badge={<span className="text-xl font-extrabold text-primary tabular-nums">{analysis.atsScore.score}</span>}>
                          {analysis.atsScore.explanation}
                        </InsightCard>
                      </div>

                      <InsightCard icon={KeyRound} title="Keyword Optimization">
                        {analysis.keywordOptimization.length === 0 ? (
                          <p className="text-slate-500 dark:text-slate-500">No significant gaps found.</p>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {analysis.keywordOptimization.map((k) => <SkillTag key={k} label={k} />)}
                          </div>
                        )}
                      </InsightCard>

                      <InsightCard icon={SpellCheck2} title="Grammar Suggestions">
                        {analysis.grammarSuggestions.length === 0 ? (
                          <p className="text-slate-500 dark:text-slate-500">No issues found.</p>
                        ) : (
                          <ul className="space-y-1.5 list-disc list-inside">
                            {analysis.grammarSuggestions.map((s, i) => <li key={i}>{s}</li>)}
                          </ul>
                        )}
                      </InsightCard>

                      <InsightCard icon={TrendingUp} title="Achievement Suggestions">
                        {analysis.achievementSuggestions.length === 0 ? (
                          <p className="text-slate-500 dark:text-slate-500">Nothing significant flagged.</p>
                        ) : (
                          <ul className="space-y-1.5 list-disc list-inside">
                            {analysis.achievementSuggestions.map((s, i) => <li key={i}>{s}</li>)}
                          </ul>
                        )}
                      </InsightCard>

                      {analysis.aiRewrite.length > 0 && (
                        <InsightCard icon={Wand2} title="AI Rewrite Suggestions">
                          <p className="text-xs text-slate-500 dark:text-slate-500 mb-3">
                            Review each suggestion — accepting updates the resume above, rejecting leaves it unchanged.
                          </p>
                          <div className="space-y-3">
                            {analysis.aiRewrite.map((r, i) => (
                              <RewriteSuggestion
                                key={`${r.section}-${i}`}
                                label={r.section}
                                suggestion={r.suggestion}
                                onAccept={(text) => handleAcceptRewrite(r.section, text)}
                              />
                            ))}
                          </div>
                        </InsightCard>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
