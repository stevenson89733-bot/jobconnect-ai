'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { sanitizeTargetRole, stripTargetRoleNewlines, MAX_TARGET_ROLE_LENGTH } from '@/lib/ai/resumeGuard'

type QaState = {
  question: string
  answer: string
  feedback: string | null
  feedbackError: string
  loadingFeedback: boolean
}

function PremiumSkeleton() {
  return <div className="max-w-5xl mx-auto px-6 py-10 animate-pulse h-96" />
}

export default function InterviewPrepClient({
  isPremium,
  initialTargetRole = '',
  initialCompany = '',
  initialJobDescription = '',
  initialExperience = '',
  initialSkills = '',
}: {
  isPremium: boolean
  initialTargetRole?: string
  initialCompany?: string
  initialJobDescription?: string
  initialExperience?: string
  initialSkills?: string
}) {
  const t = useTranslations('interviewPrep')
  const [mounted, setMounted] = useState(false)
  const [targetRole, setTargetRole] = useState(initialTargetRole)
  const [company, setCompany] = useState(initialCompany)
  const [jobDescription, setJobDescription] = useState(initialJobDescription)
  // Silent fallback context — never rendered as an editable field, same real
  // profile data already shown on /profile, just reused here without asking
  // the candidate to re-type it. Only sent to the server when no job
  // description is provided (job context always takes priority when present).
  const [experience] = useState(initialExperience)
  const [skills] = useState(initialSkills)

  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState('')
  const [qas, setQas] = useState<QaState[] | null>(null)

  useEffect(() => setMounted(true), [])

  if (!mounted) return <PremiumSkeleton />

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    if (!isPremium) return
    setGenerating(true)
    setGenerateError('')
    setQas(null)
    try {
      const res = await fetch('/api/ai/interview-prep/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRole, company, jobDescription, experience, skills }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('generationFailed'))
      setQas((data.questions ?? []).map((q: string) => ({
        question: q, answer: '', feedback: null, feedbackError: '', loadingFeedback: false,
      })))
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : t('somethingWentWrong'))
    } finally {
      setGenerating(false)
    }
  }

  function setAnswer(index: number, value: string) {
    setQas((prev) => prev && prev.map((qa, i) => (i === index ? { ...qa, answer: value, feedback: null, feedbackError: '' } : qa)))
  }

  async function handleGetFeedback(index: number) {
    const qa = qas?.[index]
    if (!qa) return
    setQas((prev) => prev && prev.map((q, i) => (i === index ? { ...q, loadingFeedback: true, feedbackError: '' } : q)))
    try {
      const res = await fetch('/api/ai/interview-prep/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: qa.question, answer: qa.answer }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('feedbackFailed'))
      setQas((prev) => prev && prev.map((q, i) => (i === index ? { ...q, feedback: data.feedback, loadingFeedback: false } : q)))
    } catch (err) {
      const message = err instanceof Error ? err.message : t('feedbackFailed')
      setQas((prev) => prev && prev.map((q, i) => (i === index ? { ...q, feedbackError: message, loadingFeedback: false } : q)))
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
          <form onSubmit={handleGenerate} className="card space-y-5">
            <h2 className="font-semibold text-slate-900 dark:text-white text-lg">{t('roleDetails')}</h2>

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

            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1.5">
                {t('companyName')} <span className="text-slate-400 dark:text-slate-400">{t('optional')}</span>
              </label>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder={t('companyNamePlaceholder')}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1.5">
                {t('jobDescription')} <span className="text-slate-400 dark:text-slate-400">{t('jobDescriptionHint')}</span>
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={6}
                placeholder={t('jobDescriptionPlaceholder')}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary resize-none"
              />
            </div>

            {generateError && <p className="text-red-600 dark:text-red-400 text-sm">{generateError}</p>}

            <button type="submit" disabled={generating} className="btn-primary w-full py-3 text-sm font-semibold disabled:opacity-50">
              {generating ? t('generatingButton') : t('generateButton')}
            </button>
          </form>

          {qas && (
            <div className="space-y-5">
              {qas.map((qa, i) => (
                <div key={i} className="card space-y-3">
                  <p className="font-medium text-slate-900 dark:text-white">
                    <span className="text-primary dark:text-blue-400">{i + 1}.</span> {qa.question}
                  </p>
                  <textarea
                    value={qa.answer}
                    onChange={(e) => setAnswer(i, e.target.value)}
                    rows={4}
                    placeholder={t('answerPlaceholder')}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary resize-none"
                  />
                  <button
                    onClick={() => handleGetFeedback(i)}
                    disabled={qa.loadingFeedback || !qa.answer.trim()}
                    className="btn-outline text-sm px-4 py-2 disabled:opacity-50"
                  >
                    {qa.loadingFeedback ? t('gettingFeedback') : t('getFeedback')}
                  </button>
                  {qa.feedbackError && <p className="text-red-600 dark:text-red-400 text-sm">{qa.feedbackError}</p>}
                  {qa.feedback && (
                    <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-lg px-4 py-3">
                      <p className="text-xs font-semibold text-primary dark:text-blue-400 mb-1">{t('feedbackLabel')}</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{qa.feedback}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
