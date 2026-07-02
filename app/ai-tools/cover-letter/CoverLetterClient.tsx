'use client'
import { useState } from 'react'
import Link from 'next/link'

type ScoreBreakdown = { relevance: number; impact: number; tone: number; structure: number }
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
        <div className="text-xs text-slate-400">Quality Score</div>
      </div>
    </div>
  )
}

function downloadLetter(data: CoverLetterData, targetRole: string, company: string) {
  const { letter } = data
  const fullLetter = [letter.greeting, '', letter.opening, '', letter.body, '', letter.closing, '', letter.signature].join('\n')
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Cover Letter — ${targetRole} at ${company}</title>
<style>
  body { font-family: Georgia, serif; max-width: 680px; margin: 60px auto; color: #1e293b; font-size: 14px; line-height: 1.8; }
  .subject { font-size: 12px; color: #64748b; margin-bottom: 32px; }
  .score { background: #f1f5f9; border-radius: 6px; padding: 6px 12px; display: inline-block; font-size: 11px; font-family: Arial; margin-bottom: 32px; }
  p { margin: 0 0 16px; }
  pre { white-space: pre-wrap; font-family: Georgia, serif; font-size: 14px; line-height: 1.8; margin: 0; }
</style>
</head>
<body>
<div class="subject">${letter.subject}</div>
<div class="score">Quality Score: <strong>${data.score}/100</strong></div>
<pre>${fullLetter}</pre>
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Cover_Letter_${company.replace(/\s+/g, '_')}_${targetRole.replace(/\s+/g, '_')}.html`
  a.click()
  URL.revokeObjectURL(url)
}

export default function CoverLetterClient({ isPremium }: { isPremium: boolean }) {
  const [targetRole, setTargetRole] = useState('')
  const [company, setCompany] = useState('')
  const [strengths, setStrengths] = useState('')
  const [tone, setTone] = useState('Professional and enthusiastic')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CoverLetterData | null>(null)
  const [error, setError] = useState('')

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    if (!isPremium) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/ai/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRole, company, strengths, tone }),
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
          <span className="text-slate-300">AI Cover Letter Generator</span>
        </div>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white mb-1">
              AI Cover Letter Generator <span className="text-accent">✦</span>
            </h1>
            <p className="text-slate-400">Generate a personalized, compelling cover letter for any role using GPT-4o.</p>
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
            <h2 className="text-xl font-bold text-white mb-2">Unlock AI Cover Letter Generator</h2>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Generate personalized cover letters for any job in seconds — tailored to the company and role, powered by GPT-4o.
            </p>
            <div className="flex flex-wrap gap-3 justify-center mb-8 text-sm text-slate-300">
              {['Unlimited cover letters', 'Quality Score (0–100)', 'PDF download', 'Company-specific tone', 'Improvement tips'].map(f => (
                <span key={f} className="flex items-center gap-1.5 bg-slate-800 rounded-full px-3 py-1">
                  <span className="text-green-400">✓</span> {f}
                </span>
              ))}
            </div>
            <Link href="/pricing" className="btn-primary px-8 py-3 text-base">
              Upgrade to Premium — $19/mo
            </Link>
          </div>

          {/* Blurred preview */}
          <div className="mt-6 relative select-none pointer-events-none">
            <div className="absolute inset-0 z-10 backdrop-blur-sm bg-background/60 rounded-2xl" />
            <div className="grid md:grid-cols-2 gap-6 opacity-40">
              <div className="card space-y-4">
                <div className="h-4 bg-slate-700 rounded w-1/2" />
                <div className="h-10 bg-slate-800 rounded" />
                <div className="h-4 bg-slate-700 rounded w-1/3" />
                <div className="h-10 bg-slate-800 rounded" />
                <div className="h-4 bg-slate-700 rounded w-2/5" />
                <div className="h-24 bg-slate-800 rounded" />
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

      {/* Main form — premium only */}
      {isPremium && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Input form */}
          <form onSubmit={handleGenerate} className="card space-y-5">
            <h2 className="font-semibold text-white text-lg">Job Details</h2>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Target Job Title <span className="text-red-400">*</span></label>
              <input
                value={targetRole} onChange={e => setTargetRole(e.target.value)}
                required placeholder="e.g. Senior Product Designer"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Company Name <span className="text-red-400">*</span></label>
              <input
                value={company} onChange={e => setCompany(e.target.value)}
                required placeholder="e.g. Figma"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Your Key Strengths & Highlights</label>
              <textarea
                value={strengths} onChange={e => setStrengths(e.target.value)}
                rows={5} placeholder="e.g. 5 years of product design at B2B SaaS companies, led redesign that increased conversions by 40%, strong Figma and design systems experience..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Tone</label>
              <select
                value={tone} onChange={e => setTone(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
              >
                <option>Professional and enthusiastic</option>
                <option>Confident and direct</option>
                <option>Warm and conversational</option>
                <option>Formal and precise</option>
              </select>
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
              ) : '✦ Generate Cover Letter'}
            </button>
          </form>

          {/* Results panel */}
          <div className="space-y-5">
            {!result && !loading && (
              <div className="card flex flex-col items-center justify-center py-16 text-center text-slate-500">
                <div className="text-4xl mb-3">✉️</div>
                <p className="text-sm">Fill in the job details and click Generate to get your personalized cover letter.</p>
              </div>
            )}

            {loading && (
              <div className="card flex flex-col items-center justify-center py-16 text-center gap-3">
                <svg className="animate-spin w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                <p className="text-sm text-slate-400">GPT-4o is writing your cover letter…</p>
              </div>
            )}

            {result && (
              <>
                {/* Score card */}
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-white">Quality Score</h2>
                    <button
                      onClick={() => downloadLetter(result, targetRole, company)}
                      className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                    >
                      ⬇ Download
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

                {/* Letter preview */}
                <div className="card">
                  <h2 className="font-semibold text-white mb-4">Generated Cover Letter</h2>
                  <div className="bg-slate-900 rounded-xl p-5 text-sm space-y-4">
                    <p className="text-slate-500 text-xs">{result.letter.subject}</p>
                    <div className="border-t border-slate-800 pt-4 space-y-4 text-slate-300 leading-relaxed">
                      <p>{result.letter.greeting}</p>
                      <p>{result.letter.opening}</p>
                      {result.letter.body.split('\n\n').map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                      <p>{result.letter.closing}</p>
                      <p className="whitespace-pre-line text-slate-400">{result.letter.signature}</p>
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
