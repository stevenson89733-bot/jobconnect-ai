'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, Send } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { APPLICATION_STATUS_VARIANT, type ApplicationStatus } from '@/lib/applicationStatus'
import { Badge } from '@/components/ui/badge'
import type { CopilotSignal } from '@/app/api/copilot/signals/route'

const REFRESH_INTERVAL_MS = 5 * 60 * 1000
const MAX_MESSAGE_LENGTH = 500

// One line + one link per signal — reads real numbers/statuses already
// computed elsewhere (Career Progress, AI Match %, application status,
// profile completeness) into a plain sentence. Never invents an activity
// to fill a quiet day; 'idle' is a genuine, honest state.
function SignalRow({ signal }: { signal: CopilotSignal }) {
  const t = useTranslations('copilot')
  const tStatus = useTranslations('applicationStatus')

  switch (signal.type) {
    case 'appStatus':
      return (
        <div className="py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
          <p className="text-sm text-slate-700 dark:text-slate-300 mb-1.5">
            {t('appStatus', { company: signal.company, status: tStatus(signal.status as ApplicationStatus) })}
          </p>
          <div className="flex items-center justify-between">
            <Badge variant={APPLICATION_STATUS_VARIANT[signal.status as ApplicationStatus] ?? 'default'}>
              {tStatus(signal.status as ApplicationStatus)}
            </Badge>
            <Link href="/candidate" className="text-xs text-primary dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
              {t('viewApplications')}
            </Link>
          </div>
        </div>
      )
    case 'atsDelta':
      return (
        <div className="py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
          <p className="text-sm text-slate-700 dark:text-slate-300 mb-1.5">{t('atsDelta', signal)}</p>
          <Link href="/candidate/analytics" className="text-xs text-primary dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
            {t('viewProgress')}
          </Link>
        </div>
      )
    case 'newMatches':
      return (
        <div className="py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
          <p className="text-sm text-slate-700 dark:text-slate-300 mb-1.5">{t('newMatches', signal)}</p>
          <Link href="/jobs" className="text-xs text-primary dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
            {t('viewMatches')}
          </Link>
        </div>
      )
    case 'profileGap':
      return (
        <div className="py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
          <p className="text-sm text-slate-700 dark:text-slate-300 mb-1.5">
            {t(signal.field === 'title' ? 'profileGapTitle' : signal.field === 'skills' ? 'profileGapSkills' : 'profileGapGeneric')}
          </p>
          <Link href="/profile" className="text-xs text-primary dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
            {t('completeProfile')}
          </Link>
        </div>
      )
    case 'idle':
      return (
        <div className="py-3 text-center">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('idleTitle')}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{t('idleDesc')}</p>
        </div>
      )
  }
}

type ChatMessage = {
  role: 'user' | 'assistant'
  message: string
  intent?: string | null
  redirect_url?: string | null
}

// Mirrors lib/ai/copilot.ts's buildRedirect() labelKeys — kept as a small,
// duplicated, type-only-linked map rather than importing that module
// directly, since it pulls in the `openai` package (server-only weight
// that has no business in the client bundle).
const INTENT_LABEL_KEY: Record<string, string> = {
  improve_resume: 'redirectImproveResume',
  write_cover_letter: 'redirectCoverLetter',
  find_jobs: 'redirectFindJobs',
  career_analysis: 'redirectCareerAnalysis',
  view_applications: 'redirectViewApplications',
}

function ChatBubble({ msg }: { msg: ChatMessage }) {
  const t = useTranslations('copilot')
  const isUser = msg.role === 'user'
  const labelKey = msg.intent ? INTENT_LABEL_KEY[msg.intent] : undefined

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2.5`}>
      <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${
        isUser
          ? 'bg-primary text-white'
          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
      }`}>
        <p className="whitespace-pre-wrap">{msg.message}</p>
        {!isUser && msg.redirect_url && labelKey && (
          <Link
            href={msg.redirect_url}
            className="mt-2 inline-block text-xs font-medium text-primary dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 underline underline-offset-2"
          >
            {t(labelKey)}
          </Link>
        )}
      </div>
    </div>
  )
}

function ChatPanel() {
  const t = useTranslations('copilot')
  const [messages, setMessages] = useState<ChatMessage[] | null>(null)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messages !== null) return
    let cancelled = false
    fetch('/api/copilot/chat')
      .then((res) => (res.ok ? res.json() : { messages: [] }))
      .then((data) => { if (!cancelled) setMessages(data.messages ?? []) })
      .catch(() => { if (!cancelled) setMessages([]) })
    return () => { cancelled = true }
  }, [messages])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages, sending])

  async function send() {
    const text = input.trim().slice(0, MAX_MESSAGE_LENGTH)
    if (!text || sending) return
    setInput('')
    setError(null)
    setMessages((prev) => [...(prev ?? []), { role: 'user', message: text }])
    setSending(true)
    try {
      const res = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('chatFailed'))
      setMessages((prev) => [
        ...(prev ?? []),
        { role: 'assistant', message: data.reply, intent: data.intent, redirect_url: data.redirect?.url ?? null },
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : t('chatFailed'))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-96">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
        {messages === null ? (
          <p className="text-xs text-slate-500 dark:text-slate-500 text-center mt-4">{t('loadingHistory')}</p>
        ) : messages.length === 0 ? (
          <p className="text-xs text-slate-600 dark:text-slate-400 text-center mt-4">{t('chatIntro')}</p>
        ) : (
          messages.map((msg, i) => <ChatBubble key={i} msg={msg} />)
        )}
        {sending && <p className="text-xs text-slate-500 dark:text-slate-500 ms-1">{t('thinking')}</p>}
        {error && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>}
      </div>
      <div className="flex items-center gap-2 px-3 py-2.5 border-t border-slate-100 dark:border-slate-800">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder={t('chatPlaceholder')}
          maxLength={MAX_MESSAGE_LENGTH}
          disabled={sending}
          className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
        />
        <button
          onClick={send}
          disabled={sending || !input.trim()}
          aria-label={t('sendLabel')}
          className="w-9 h-9 shrink-0 rounded-full bg-primary hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-primary text-white flex items-center justify-center transition-colors"
        >
          <Send className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}

export default function CopilotWidget() {
  const pathname = usePathname()
  const t = useTranslations('copilot')
  const [signals, setSignals] = useState<CopilotSignal[] | null>(null)
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'signals' | 'chat'>('signals')

  const fetchSignals = useCallback(async () => {
    try {
      const res = await fetch('/api/copilot/signals')
      if (!res.ok) return
      const data = await res.json()
      setSignals(data.signals ?? [])
    } catch {
      // Silent — the widget just doesn't appear rather than erroring the page.
    }
  }, [])

  useEffect(() => {
    fetchSignals()
    const id = setInterval(fetchSignals, REFRESH_INTERVAL_MS)
    return () => clearInterval(id)
  }, [fetchSignals])

  // Not on the public landing page, and nothing to show yet (still loading,
  // or the API said this isn't a candidate). The signals endpoint always
  // returns at least an 'idle' entry for a real candidate, so this only
  // actually hides the widget during the initial load flicker and for
  // non-candidates/signed-out visitors. Deliberately no permanent
  // "dismissed" state anymore (previously a sessionStorage flag) — it used
  // to hide the whole widget, including the Chat tab, for the rest of the
  // browser tab's life with no way to bring it back short of closing the
  // tab. The header's close button now only closes the panel (see below).
  if (pathname === '/' || !signals || signals.length === 0) return null

  const hasRealUpdate = signals.some((s) => s.type !== 'idle')

  // start-5 (not end-5) deliberately — Crisp's own chat launcher (loaded
  // independently, see components/CrispChat.tsx) sits at its default
  // bottom-end corner too, and visually overlapped/covered this button
  // there, capturing clicks meant for it (confirmed via
  // document.elementFromPoint in production). Keeping this on the opposite
  // corner is fully within our own control, rather than depending on
  // Crisp's own (less predictable) runtime repositioning API.
  return (
    <div className="fixed bottom-5 start-5 z-40">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-16 start-0 w-80 max-w-[calc(100vw-2.5rem)] rounded-2xl border border-slate-200 dark:border-slate-700/50 bg-white/95 dark:bg-card/95 backdrop-blur-md shadow-2xl dark:shadow-black/40 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary dark:text-blue-400" strokeWidth={1.75} />
                <span className="font-semibold text-sm text-slate-900 dark:text-white">{t('title')}</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label={t('closeLabel')}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </div>

            <div className="flex border-b border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setTab('signals')}
                className={`flex-1 text-xs font-medium py-2.5 transition-colors ${
                  tab === 'signals'
                    ? 'text-primary dark:text-blue-400 border-b-2 border-primary dark:border-blue-400'
                    : 'text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {t('signalsTab')}
              </button>
              <button
                onClick={() => setTab('chat')}
                className={`flex-1 text-xs font-medium py-2.5 transition-colors ${
                  tab === 'chat'
                    ? 'text-primary dark:text-blue-400 border-b-2 border-primary dark:border-blue-400'
                    : 'text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {t('chatTab')}
              </button>
            </div>

            {tab === 'signals' ? (
              <div className="px-4 max-h-96 overflow-y-auto">
                {signals.map((signal, i) => (
                  <SignalRow key={i} signal={signal} />
                ))}
              </div>
            ) : (
              <ChatPanel />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((o) => !o)}
        aria-label={t('openLabel')}
        className="relative w-14 h-14 rounded-full bg-primary hover:bg-blue-700 text-white shadow-lg dark:shadow-black/40 flex items-center justify-center transition-colors"
      >
        <Sparkles className="w-6 h-6" strokeWidth={1.75} />
        {hasRealUpdate && !open && (
          <span className="absolute top-1 end-1 w-3 h-3 rounded-full bg-accent border-2 border-white dark:border-background" />
        )}
      </motion.button>
    </div>
  )
}
