'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { sanitizeTargetRole, stripTargetRoleNewlines, MAX_TARGET_ROLE_LENGTH } from '@/lib/ai/resumeGuard'
import type { LinkedInAnalysis, LinkedInGeneration } from '@/lib/ai/linkedinOptimizer'

type Mode = 'analyze' | 'generate'

function PremiumSkeleton() {
  return <div className="max-w-5xl mx-auto px-6 py-10 animate-pulse h-96" />
}

export default function LinkedInOptimizerClient({
  isPremium,
  initialTargetRole = '',
  initialExperience = '',
  initialSkills = '',
  initialSummary = '',
}: {
  isPremium: boolean
  initialTargetRole?: string
  initialExperience?: string
  initialSkills?: string
  initialSummary?: string
}) {
  const t = useTranslations('linkedinOptimizer')
  const [mounted, setMounted] = useState(false)
  const [mode, setMode] = useState<Mode>('analyze')

  // Mode 1 — Analyze
  const [headline, setHeadline] = useState('')
  const [about, setAbout] = useState('')
  const [experienceText, setExperienceText] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState('')
  const [analysis, setAnalysis] = useState<LinkedInAnalysis | null>(null)

  // Mode 2 — Generate
  const [targetRole, setTargetRole] = useState(initialTargetRole)
  const [experience] = useState(initialExperience)
  const [skills] = useState(initialSkills)
  const [summary] = useState(initialSummary)
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState('')
  const [generation, setGeneration] = useState<LinkedInGeneration | null>(null)

  useEffect(() => setMounted(true), [])

  if (!mounted) return <PremiumSkeleton />

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault()
    if (!isPremium) return
    setAnalyzing(true)
    setAnalyzeError('')
    setAnalysis(null)
    try {
      const res = await fetch('/api/ai/linkedin-optimizer/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headline, about, experience: experienceText }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('generationFailed'))
      setAnalysis(data.analysis)
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : t('somethingWentWrong'))
    } finally {
      setAnalyzing(false)
    }
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    if (!isPremium) return
    setGenerating(true)
    setGenerateError('')
    setGeneration(null)
    try {
      const res = await fetch('/api/ai/linkedin-optimizer/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRole, experience, skills, summary }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('generationFailed'))
      setGeneration(data.generation)
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : t('somethingWentWrong'))
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
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
          <span className="inline-flex items-center gap-1.5 bg-accent/10 text-orange-700 dark:text-accent border border-accent/30 rounded-full px-3 py-1 text-xs font-semibold">
            {t('premiumFeature')}
          </span>
        </div>
      </div>

      {!isPremium && (
        <div className="card border-accent/40 bg-gradient-to-br from-accent/5 to-white dark:to-card text-center py-12 px-6">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('unlockTitle')}</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">{t('unlockDesc')}</p>
          <Link href="/pricing" className="btn-primary px-8 py-3 text-base">{t('upgradeCta')}</Link>
        </div>
      )}

      {isPremium && (
        <div className="space-y-6">
          <div className="flex gap-2">
            <button
              onClick={() => setMode('analyze')}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
                mode === 'analyze'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:border-primary/50'
              }`}
            >
              {t('modeAnalyze')}
            </button>
            <button
              onClick={() => setMode('generate')}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
                mode === 'generate'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:border-primary/50'
              }`}
            >
              {t('modeGenerate')}
            </button>
          </div>

          {mode === 'analyze' && (
            <>
              <form onSubmit={handleAnalyze} className="card space-y-5">
                <p className="text-sm text-slate-600 dark:text-slate-400">{t('analyzeIntro')}</p>

                <div>
                  <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1.5">{t('headlineLabel')}</label>
                  <input
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder={t('headlinePlaceholder')}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1.5">{t('aboutLabel')}</label>
                  <textarea
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    rows={5}
                    placeholder={t('aboutPlaceholder')}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1.5">{t('experienceLabel')}</label>
                  <textarea
                    value={experienceText}
                    onChange={(e) => setExperienceText(e.target.value)}
                    rows={6}
                    placeholder={t('experiencePlaceholder')}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary resize-none"
                  />
                </div>

                {analyzeError && <p className="text-red-600 dark:text-red-400 text-sm">{analyzeError}</p>}

                <button type="submit" disabled={analyzing} className="btn-primary w-full py-3 text-sm font-semibold disabled:opacity-50">
                  {analyzing ? t('analyzingButton') : t('analyzeButton')}
                </button>
              </form>

              {analysis && (
                <div className="card space-y-5">
                  <div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-3xl font-extrabold text-primary dark:text-blue-400">{analysis.profileScore.score}</span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">/ 100 — {t('profileScore')}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{analysis.profileScore.explanation}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{t('headlineLabel')}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{analysis.headlineFeedback}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{t('aboutLabel')}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{analysis.aboutFeedback}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{t('experienceLabel')}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{analysis.experienceFeedback}</p>
                  </div>

                  {analysis.keywordSuggestions.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">{t('keywordSuggestions')}</h3>
                      <div className="flex flex-wrap gap-2">
                        {analysis.keywordSuggestions.map((kw, i) => (
                          <span key={i} className="text-xs bg-primary/10 dark:bg-primary/20 text-blue-700 dark:text-blue-400 rounded-full px-2.5 py-1">{kw}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysis.improvementSuggestions.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">{t('improvementSuggestions')}</h3>
                      <ul className="space-y-1.5">
                        {analysis.improvementSuggestions.map((s, i) => (
                          <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex gap-2">
                            <span className="text-primary dark:text-blue-400">•</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {mode === 'generate' && (
            <>
              <form onSubmit={handleGenerate} className="card space-y-5">
                <p className="text-sm text-slate-600 dark:text-slate-400">{t('generateIntro')}</p>

                <div>
                  <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1.5">
                    {t('targetJobTitle')} <span className="text-red-500 dark:text-red-400">*</span>
                  </label>
                  <input
                    value={targetRole}
                    onChange={(e) => setTargetRole(stripTargetRoleNewlines(e.target.value))}
                    onBlur={(e) => setTargetRole(sanitizeTargetRole(e.target.value))}
                    maxLength={MAX_TARGET_ROLE_LENGTH}
                    required
                    placeholder={t('targetJobTitlePlaceholder')}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary"
                  />
                </div>

                {!experience.trim() && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">{t('notEnoughExperienceWarning')}</p>
                )}

                {generateError && <p className="text-red-600 dark:text-red-400 text-sm">{generateError}</p>}

                <button type="submit" disabled={generating} className="btn-primary w-full py-3 text-sm font-semibold disabled:opacity-50">
                  {generating ? t('generatingButton') : t('generateButton')}
                </button>
              </form>

              {generation && (
                <div className="card space-y-5">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{t('resultHeadline')}</h3>
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{generation.headline}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{t('resultAbout')}</h3>
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line">{generation.about}</p>
                  </div>
                  {generation.experienceHighlights.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">{t('resultExperienceHighlights')}</h3>
                      <ul className="space-y-1.5">
                        {generation.experienceHighlights.map((h, i) => (
                          <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex gap-2">
                            <span className="text-primary dark:text-blue-400">•</span> {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
