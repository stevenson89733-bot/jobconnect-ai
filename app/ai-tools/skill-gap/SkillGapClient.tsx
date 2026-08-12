'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { sanitizeTargetRole, stripTargetRoleNewlines, MAX_TARGET_ROLE_LENGTH } from '@/lib/ai/resumeGuard'
import { COUNTRY_OPTIONS } from '@/lib/ai/countryProfiles'
import { useAIToolsSession } from '@/lib/ai/aiToolsContext'
import type { SkillGapAnalysis } from '@/lib/ai/skillGap'

function PremiumSkeleton() {
  return <div className="max-w-5xl mx-auto px-6 py-10 animate-pulse h-96" />
}

export default function SkillGapClient({
  isPremium,
  initialSkills = '',
  initialExperience = '',
  initialTargetRoleFromParam = '',
  initialTargetRoleFromProfile = '',
  initialTargetCountryFromParam = '',
  jobId = null,
  jobTitle = null,
  jobCompany = null,
}: {
  isPremium: boolean
  initialSkills?: string
  initialExperience?: string
  initialTargetRoleFromParam?: string
  initialTargetRoleFromProfile?: string
  initialTargetCountryFromParam?: string
  jobId?: string | null
  jobTitle?: string | null
  jobCompany?: string | null
}) {
  const t = useTranslations('skillGap')
  const { lastTargetRole, lastTargetCountry, update } = useAIToolsSession()
  const [mounted, setMounted] = useState(false)
  // Priority: URL param (copilot/jobId) > AIToolsContext > Supabase profile
  const [targetRole, setTargetRole] = useState(initialTargetRoleFromParam || lastTargetRole || initialTargetRoleFromProfile)
  const [targetCountry, setTargetCountry] = useState(initialTargetCountryFromParam || lastTargetCountry)
  const [skills] = useState(initialSkills)
  const [experience] = useState(initialExperience)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [analysis, setAnalysis] = useState<SkillGapAnalysis | null>(null)

  const hasRealJob = !!jobId

  useEffect(() => setMounted(true), [])

  if (!mounted) return <PremiumSkeleton />

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault()
    if (!isPremium) return
    update(hasRealJob ? (jobTitle ?? '') : targetRole, targetCountry)
    setGenerating(true)
    setError('')
    setAnalysis(null)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30_000)
    try {
      const body = hasRealJob
        ? { jobId, skills, experience, targetCountry: targetCountry || undefined }
        : { targetRole, skills, experience, targetCountry: targetCountry || undefined }
      const res = await fetch('/api/ai/skill-gap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('generationFailed'))
      setAnalysis(data.analysis)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError(t('timeoutError'))
      } else {
        setError(err instanceof Error ? err.message : t('somethingWentWrong'))
      }
    } finally {
      clearTimeout(timeoutId)
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
          <form onSubmit={handleAnalyze} className="card space-y-5">
            {hasRealJob ? (
              <div>
                <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1.5">{t('destinationLabel')}</label>
                <div className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5 text-sm text-slate-900 dark:text-white">
                  <span className="font-medium">{jobTitle}</span>
                  {jobCompany && <span className="text-slate-600 dark:text-slate-400"> — {jobCompany}</span>}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1.5">{t('realJobHint')}</p>
              </div>
            ) : (
              <div>
                <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1.5">
                  {t('destinationLabel')} <span className="text-red-500 dark:text-red-400">*</span>
                </label>
                <input
                  value={targetRole}
                  onChange={(e) => setTargetRole(stripTargetRoleNewlines(e.target.value))}
                  onBlur={(e) => setTargetRole(sanitizeTargetRole(e.target.value))}
                  maxLength={MAX_TARGET_ROLE_LENGTH}
                  required
                  placeholder={t('targetRolePlaceholder')}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary"
                />
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1.5">{t('generalRoleHint')}</p>
              </div>
            )}

            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1.5">{t('targetCountry')}</label>
              <select
                value={targetCountry}
                onChange={(e) => setTargetCountry(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary"
              >
                <option value="">{t('targetCountryDefault')}</option>
                {COUNTRY_OPTIONS.map((c) => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
            </div>

            {!experience.trim() && (
              <p className="text-xs text-amber-600 dark:text-amber-400">{t('notEnoughExperienceWarning')}</p>
            )}

            {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}

            <button type="submit" disabled={generating} className="btn-primary w-full py-3 text-sm font-semibold disabled:opacity-50">
              {generating ? t('analyzingButton') : t('analyzeButton')}
            </button>
          </form>

          {generating && (
            <div className="card flex flex-col items-center justify-center py-16 text-center gap-3">
              <svg className="animate-spin w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              <p className="text-sm text-slate-600 dark:text-slate-400">{t('analyzingButton')}</p>
            </div>
          )}

          {analysis && (
            <div className="card space-y-5">
              <div className="flex flex-wrap gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                    analysis.basis === 'real_job'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {analysis.basis === 'real_job' ? t('basisRealJob') : t('basisGeneralEstimate')}
                </span>
                {targetCountry && (
                  <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                    🌍 {t('crossBorderNote', { country: targetCountry })}
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-extrabold text-primary dark:text-blue-400">{analysis.matchScore.score}</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">/ 100 — {t('matchScore')}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{analysis.matchScore.explanation}</p>
              </div>

              {analysis.skillsAlreadyHave.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">{t('skillsAlreadyHave')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.skillsAlreadyHave.map((s, i) => (
                      <span key={i} className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full px-2.5 py-1">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {analysis.skillsToDevelop.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">{t('skillsToDevelop')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.skillsToDevelop.map((s, i) => (
                      <span key={i} className="text-xs bg-accent/10 dark:bg-accent/20 text-orange-700 dark:text-accent rounded-full px-2.5 py-1">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {analysis.suggestedNextSteps.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">{t('suggestedNextSteps')}</h3>
                  <ul className="space-y-1.5">
                    {analysis.suggestedNextSteps.map((s, i) => (
                      <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex gap-2">
                        <span className="text-primary dark:text-blue-400">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
