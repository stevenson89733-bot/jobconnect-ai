'use client'
import { useState } from 'react'
import Link from 'next/link'

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
        <circle cx="60" cy="60" r={r} fill="none" stroke="#1e293b" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div className="text-center">
        <div className="text-3xl font-extrabold text-white">{score}</div>
        <div className="text-xs text-slate-400">ATS Score</div>
      </div>
    </div>
  )
}

function downloadPDF(data: ResumeData) {
  const { resume } = data
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>${resume.name} — Resume</title>
<style>
  body { font-family: Arial, sans-serif; max-width: 760px; margin: 40px auto; color: #1e293b; font-size: 13px; line-height: 1.6; }
  h1 { font-size: 24px; margin: 0 0 2px; color: #1e293b; }
  .title { font-size: 14px; color: #2563eb; font-weight: 600; margin-bottom: 4px; }
  .contact { color: #64748b; font-size: 12px; margin-bottom: 18px; }
  h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; color: #2563eb; border-bottom: 1.5px solid #2563eb; padding-bottom: 3px; margin: 18px 0 8px; }
  p { margin: 0 0 6px; }
  .score { background: #f1f5f9; border-radius: 6px; padding: 8px 14px; display: inline-block; font-size: 12px; margin-bottom: 18px; }
  pre { white-space: pre-wrap; font-family: inherit; margin: 0; }
</style>
</head>
<body>
<h1>${resume.name}</h1>
<div class="title">${resume.title}</div>
<div class="contact">${resume.contact}</div>
<div class="score">ATS Score: <strong>${data.score}/100</strong></div>
<h2>Professional Summary</h2>
<p>${resume.summary}</p>
<h2>Experience</h2>
<pre>${resume.experience}</pre>
<h2>Skills</h2>
<p>${resume.skills}</p>
<h2>Education</h2>
<pre>${resume.education}</pre>
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${resume.name.replace(/\s+/g, '_')}_Resume.html`
  a.click()
  URL.revokeObjectURL(url)
}

export default function ResumeBuilderClient({ isPremium }: { isPremium: boolean }) {
  const [targetRole, setTargetRole] = useState('')
  const [experience, setExperience] = useState('')
  const [skills, setSkills] = useState('')
  const [education, setEducation] = useState('')
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ResumeData | null>(null)
  const [error, setError] = useState('')

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    if (!isPremium) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/ai/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRole, experience, skills, education, summary }),
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

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
          <Link href="/candidate" className="hover:text-white transition-colors">Dashboard</Link>
          <span>/</span>
          <span className="text-slate-300">AI Resume Builder</span>
        </div>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white mb-1">
              AI Resume Builder <span className="text-accent">✦</span>
            </h1>
            <p className="text-slate-400">Generate an ATS-optimized resume tailored to your target role using GPT-4o.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 bg-accent/10 text-accent border border-accent/30 rounded-full px-3 py-1 text-xs font-semibold">
            ✦ Premium Feature
          </span>
        </div>
      </div>

      {/* Premium gate */}
      {!isPremium && (
        <div className="relative mb-8">
          <div className="card border-accent/40 bg-gradient-to-br from-accent/5 to-card text-center py-12 px-6">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="text-xl font-bold text-white mb-2">Unlock AI Resume Builder</h2>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Generate unlimited ATS-optimized resumes, get your Resume Score, and download as PDF — all powered by GPT-4o.
            </p>
            <div className="flex flex-wrap gap-3 justify-center mb-8 text-sm text-slate-300">
              {['Unlimited AI resumes', 'ATS Score (0–100)', 'PDF download', 'Tailored to any job title', 'Improvement tips'].map(f => (
                <span key={f} className="flex items-center gap-1.5 bg-slate-800 rounded-full px-3 py-1">
                  <span className="text-green-400">✓</span> {f}
                </span>
              ))}
            </div>
            <Link href="/pricing" className="btn-primary px-8 py-3 text-base">
              Upgrade to Premium — $19/mo
            </Link>
          </div>

          {/* Blurred preview below the gate */}
          <div className="mt-6 relative select-none pointer-events-none">
            <div className="absolute inset-0 z-10 backdrop-blur-sm bg-background/60 rounded-2xl" />
            <div className="grid md:grid-cols-2 gap-6 opacity-40">
              <div className="card space-y-4">
                <div className="h-4 bg-slate-700 rounded w-1/2" />
                <div className="h-24 bg-slate-800 rounded" />
                <div className="h-4 bg-slate-700 rounded w-1/3" />
                <div className="h-20 bg-slate-800 rounded" />
              </div>
              <div className="card flex flex-col items-center justify-center gap-4 py-10">
                <div className="w-36 h-36 rounded-full border-8 border-slate-700" />
                <div className="h-4 bg-slate-700 rounded w-24" />
                <div className="h-3 bg-slate-800 rounded w-40" />
                <div className="h-3 bg-slate-800 rounded w-32" />
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
            <h2 className="font-semibold text-white text-lg">Your Information</h2>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Target Job Title <span className="text-red-400">*</span></label>
              <input
                value={targetRole} onChange={e => setTargetRole(e.target.value)}
                required placeholder="e.g. Senior Frontend Engineer"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Work Experience <span className="text-red-400">*</span></label>
              <textarea
                value={experience} onChange={e => setExperience(e.target.value)}
                required rows={5} placeholder="List your roles, companies, dates, and key achievements..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Skills</label>
              <input
                value={skills} onChange={e => setSkills(e.target.value)}
                placeholder="TypeScript, React, Node.js, PostgreSQL, AWS..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Education</label>
              <input
                value={education} onChange={e => setEducation(e.target.value)}
                placeholder="B.S. Computer Science, MIT, 2018"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Professional Summary (optional)</label>
              <textarea
                value={summary} onChange={e => setSummary(e.target.value)}
                rows={2} placeholder="Any specific angle or positioning you want emphasized..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary resize-none"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

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
            {!result && !loading && (
              <div className="card flex flex-col items-center justify-center py-16 text-center text-slate-500">
                <div className="text-4xl mb-3">📄</div>
                <p className="text-sm">Fill in your details and click Generate to get your ATS-optimized resume.</p>
              </div>
            )}

            {loading && (
              <div className="card flex flex-col items-center justify-center py-16 text-center gap-3">
                <svg className="animate-spin w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                <p className="text-sm text-slate-400">GPT-4o is crafting your resume…</p>
              </div>
            )}

            {result && (
              <>
                {/* Score card */}
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-white">Resume Score</h2>
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
                            <span className="capitalize text-slate-400">{key}</span>
                            <span className="text-slate-300">{val}/25</span>
                          </div>
                          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full" style={{ width: `${(val / 25) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Improvements */}
                <div className="card">
                  <h2 className="font-semibold text-white mb-3">How to Improve</h2>
                  <ul className="space-y-2">
                    {result.improvements.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="text-accent mt-0.5">→</span> {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Resume preview */}
                <div className="card">
                  <h2 className="font-semibold text-white mb-4">Generated Resume</h2>
                  <div className="bg-slate-900 rounded-xl p-5 text-sm space-y-4 font-mono">
                    <div>
                      <div className="text-white font-bold text-base">{result.resume.name}</div>
                      <div className="text-primary text-xs">{result.resume.title}</div>
                      <div className="text-slate-500 text-xs">{result.resume.contact}</div>
                    </div>
                    <div>
                      <div className="text-accent text-xs font-bold uppercase tracking-wider mb-1">Summary</div>
                      <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{result.resume.summary}</p>
                    </div>
                    <div>
                      <div className="text-accent text-xs font-bold uppercase tracking-wider mb-1">Experience</div>
                      <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{result.resume.experience}</p>
                    </div>
                    <div>
                      <div className="text-accent text-xs font-bold uppercase tracking-wider mb-1">Skills</div>
                      <p className="text-slate-300 leading-relaxed">{result.resume.skills}</p>
                    </div>
                    <div>
                      <div className="text-accent text-xs font-bold uppercase tracking-wider mb-1">Education</div>
                      <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{result.resume.education}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
