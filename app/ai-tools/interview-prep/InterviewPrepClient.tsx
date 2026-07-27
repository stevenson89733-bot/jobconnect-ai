'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { sanitizeTargetRole, stripTargetRoleNewlines, MAX_TARGET_ROLE_LENGTH } from '@/lib/ai/resumeGuard'
import { getSpeechLang } from '@/lib/speechLocale'
import type { Locale } from '@/lib/i18n/config'

type QaState = {
  question: string
  answer: string
  feedback: string | null
  feedbackError: string
  loadingFeedback: boolean
}

type Mode = 'text' | 'voice'

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
  const locale = useLocale() as Locale
  const speechLang = getSpeechLang(locale)

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

  // Voice mode — only ever offered if the browser's Web Speech API is
  // actually present AND the active locale has a real BCP-47 mapping (see
  // lib/speechLocale.ts — deliberately no mapping for 'ht'). Feature-detected
  // on mount rather than assumed, so Firefox/older Safari silently keep only
  // the text mode that already works, instead of a half-broken voice toggle.
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [mode, setMode] = useState<Mode>('text')
  const [voiceError, setVoiceError] = useState('')
  const [listeningIndex, setListeningIndex] = useState<number | null>(null)
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    setMounted(true)
    const hasRecognition = typeof window !== 'undefined' && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    const hasSynthesis = typeof window !== 'undefined' && 'speechSynthesis' in window
    setVoiceSupported(hasRecognition && hasSynthesis && !!speechLang)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop?.()
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel()
    }
  }, [])

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

  function speakQuestion(index: number, text: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    if (speechLang) utterance.lang = speechLang
    utterance.onstart = () => setSpeakingIndex(index)
    utterance.onend = () => setSpeakingIndex(null)
    utterance.onerror = () => setSpeakingIndex(null)
    window.speechSynthesis.speak(utterance)
  }

  function startListening(index: number) {
    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognitionCtor || !speechLang) return

    setVoiceError('')
    const recognition = new SpeechRecognitionCtor()
    recognition.lang = speechLang
    recognition.continuous = false
    recognition.interimResults = true

    recognition.onresult = (event: any) => {
      let transcript = ''
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      setAnswer(index, transcript)
    }

    recognition.onerror = (event: any) => {
      // Same reasoning as the initial feature-detection: a browser that
      // claims support but fails at runtime is treated exactly like one
      // with no support at all — fall back to text mode honestly rather
      // than leaving a broken voice toggle visible. Split into two distinct
      // messages rather than one generic one: "permission denied" (user
      // declined, or a Permissions-Policy header blocked the mic outright —
      // see next.config.js) is a very different fix from "language/service
      // not supported" (nothing to grant, this browser/language just can't
      // do it), and conflating them made this exact class of bug hard to
      // diagnose from a user report alone.
      const permissionErrors = ['not-allowed', 'service-not-allowed']
      const unsupportedErrors = ['language-not-supported']
      if (permissionErrors.includes(event.error)) {
        setVoiceSupported(false)
        setMode('text')
        setVoiceError(t('voicePermissionDeniedError'))
      } else if (unsupportedErrors.includes(event.error)) {
        setVoiceSupported(false)
        setMode('text')
        setVoiceError(t('voiceLanguageUnsupportedError'))
      }
      setListeningIndex(null)
    }

    recognition.onend = () => setListeningIndex(null)

    recognitionRef.current = recognition
    setListeningIndex(index)
    recognition.start()
  }

  function stopListening() {
    recognitionRef.current?.stop?.()
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
              {voiceSupported && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setMode('text')}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                      mode === 'text'
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:border-primary/50'
                    }`}
                  >
                    {t('modeText')}
                  </button>
                  <button
                    onClick={() => setMode('voice')}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                      mode === 'voice'
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:border-primary/50'
                    }`}
                  >
                    {t('modeVoice')}
                  </button>
                </div>
              )}

              {voiceError && <p className="text-amber-600 dark:text-amber-400 text-sm">{voiceError}</p>}

              {qas.map((qa, i) => (
                <div key={i} className="card space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-slate-900 dark:text-white">
                      <span className="text-primary dark:text-blue-400">{i + 1}.</span> {qa.question}
                    </p>
                    {mode === 'voice' && (
                      <button
                        type="button"
                        onClick={() => speakQuestion(i, qa.question)}
                        disabled={speakingIndex === i}
                        className="shrink-0 text-xs text-primary dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 disabled:opacity-50"
                      >
                        {speakingIndex === i ? t('speaking') : t('replayQuestion')}
                      </button>
                    )}
                  </div>

                  {mode === 'voice' ? (
                    <div className="space-y-2">
                      {qa.answer && (
                        <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 whitespace-pre-line">
                          {qa.answer}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {listeningIndex === i ? (
                          <button
                            type="button"
                            onClick={stopListening}
                            className="btn-outline text-sm px-4 py-2 border-red-400 text-red-600 dark:text-red-400"
                          >
                            {t('stopListening')}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => startListening(i)}
                            disabled={listeningIndex !== null}
                            className="btn-outline text-sm px-4 py-2 disabled:opacity-50"
                          >
                            {qa.answer ? t('redoAnswer') : t('startSpeaking')}
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <textarea
                      value={qa.answer}
                      onChange={(e) => setAnswer(i, e.target.value)}
                      rows={4}
                      placeholder={t('answerPlaceholder')}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary resize-none"
                    />
                  )}

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
