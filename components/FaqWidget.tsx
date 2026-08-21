'use client'
import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { X, MoreHorizontal, Download, RefreshCw, Minus, ChevronDown, ChevronUp, MessageCircle, Maximize2, Minimize2 } from 'lucide-react'

type Message = { type: 'user' | 'bot'; text: string; time: string }

function now() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function makeWelcome(g1: string, g2: string): Message[] {
  const t = now()
  return [
    { type: 'bot', text: g1, time: t },
    { type: 'bot', text: g2, time: t },
  ]
}

export default function FaqWidget() {
  const t = useTranslations('chatWidget')

  const FAQ_THEMES = [
    {
      emoji: '🚀',
      label: t('themeGettingStarted'),
      items: [
        { q: t('q_whatIs'),    a: t('a_whatIs') },
        { q: t('q_whoFor'),    a: t('a_whoFor') },
        { q: t('q_different'), a: t('a_different') },
        { q: t('q_free'),      a: t('a_free') },
        { q: t('q_trial'),     a: t('a_trial') },
      ],
    },
    {
      emoji: '💼',
      label: t('themeAiTools'),
      items: [
        { q: t('q_premium'),      a: t('a_premium') },
        { q: t('q_resumeBuilder'), a: t('a_resumeBuilder') },
        { q: t('q_detector'),     a: t('a_detector') },
        { q: t('q_skillGap'),     a: t('a_skillGap') },
        { q: t('q_coverLetter'),  a: t('a_coverLetter') },
        { q: t('q_interviewPrep'), a: t('a_interviewPrep') },
        { q: t('q_careerCoach'),  a: t('a_careerCoach') },
        { q: t('q_copilot'),      a: t('a_copilot') },
      ],
    },
    {
      emoji: '🌍',
      label: t('themeInternational'),
      items: [
        { q: t('q_countries'),   a: t('a_countries') },
        { q: t('q_anywhere'),    a: t('a_anywhere') },
        { q: t('q_fromOutside'), a: t('a_fromOutside') },
      ],
    },
    {
      emoji: '💳',
      label: t('themeBilling'),
      items: [
        { q: t('q_billing'), a: t('a_billing') },
        { q: t('q_cancel'),  a: t('a_cancel') },
      ],
    },
    {
      emoji: '🔒',
      label: t('themeSecurity'),
      items: [
        { q: t('q_secure'),  a: t('a_secure') },
        { q: t('q_support'), a: t('a_support') },
      ],
    },
  ]

  const [isOpen, setIsOpen]           = useState(false)
  const [visible, setVisible]         = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isExpanded, setIsExpanded]   = useState(false)
  const [dropdownOpen, setDropdown]   = useState(false)
  const [showBadge, setShowBadge]     = useState(true)
  const [conversation, setConvo]      = useState<Message[]>(() => makeWelcome(t('greeting1'), t('greeting2')))

  const msgsRef     = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = msgsRef.current
    if (!el) return
    setTimeout(() => { el.scrollTop = el.scrollHeight }, 60)
  }, [conversation])

  useEffect(() => {
    if (!dropdownOpen) return
    function onDown(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdown(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [dropdownOpen])

  function handleOpen() {
    setIsOpen(true)
    setShowBadge(false)
    setIsCollapsed(false)
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
  }

  function handleClose() {
    setVisible(false)
    setDropdown(false)
    setTimeout(() => { setIsOpen(false); setIsCollapsed(false); setIsExpanded(false) }, 280)
  }

  function handleQuestion(q: string, a: string) {
    const time = now()
    setConvo(prev => [...prev, { type: 'user', text: q, time }, { type: 'bot', text: a, time }])
  }

  function handleDownload() {
    setDropdown(false)
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    const lines = [
      t('transcriptTitle'),
      `${t('transcriptDate')}: ${date}`,
      '---',
      '',
      ...conversation.map(m => `[${m.time}] ${m.type === 'user' ? t('transcriptYou') : 'JobConnect AI'}: ${m.text}`),
      '',
      '---',
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `jobconnect-ai-transcript-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const panelWidth   = isExpanded ? '520px' : '360px'
  const bodyMaxHeight = isExpanded ? '636px' : '456px'

  return (
    <>
      {/* ── Floating button ── */}
      <button
        onClick={handleOpen}
        aria-label="Open chat"
        className={`fixed bottom-24 right-6 z-40 w-14 h-14 rounded-full bg-primary text-white shadow-xl flex items-center justify-center transition-all duration-200 ${
          isOpen
            ? 'opacity-0 pointer-events-none scale-90'
            : 'opacity-100 scale-100 hover:scale-110 hover:shadow-2xl'
        }`}
      >
        <MessageCircle size={24} />
        {showBadge && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-white text-[10px] font-bold items-center justify-center">
              1
            </span>
          </span>
        )}
      </button>

      {/* ── Panel ── */}
      {isOpen && (
        <div
          className={`fixed bottom-24 right-6 z-50 flex flex-col rounded-2xl shadow-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 transition-all duration-300 ease-out ${
            visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`}
          style={{ width: panelWidth, maxWidth: 'calc(100vw - 48px)', transition: 'width 0.2s ease-out, opacity 0.3s ease-out, transform 0.3s ease-out' }}
        >
          {/* ── Header ── */}
          <div
            className="relative flex items-center justify-between px-4 py-3 flex-shrink-0 cursor-pointer select-none"
            style={{ background: 'linear-gradient(135deg, #2E5CF6 0%, #1E3FCC 100%)' }}
            onClick={() => isCollapsed && setIsCollapsed(false)}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-white/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="JobConnect AI" className="w-8 h-8 object-contain" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-sm leading-tight">JobConnect AI</span>
                  <span className="relative flex h-2 w-2 flex-shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                  </span>
                  <span className="text-green-300 text-[10px] font-semibold">{t('online')}</span>
                </div>
                <p className="text-white/65 text-[11px] mt-0.5 leading-tight">{t('repliesInstantly')}</p>
              </div>
            </div>

            <div className="flex items-center gap-0.5 flex-shrink-0 ml-2">
              {/* Expand / Restore button */}
              <button
                onClick={e => { e.stopPropagation(); setIsExpanded(x => !x); setDropdown(false) }}
                className="text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                aria-label={isExpanded ? t('reduceChat') : t('expandChat')}
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>

              {/* Collapse chevron */}
              <button
                onClick={e => { e.stopPropagation(); setIsCollapsed(c => !c); setDropdown(false) }}
                className="text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                aria-label={isCollapsed ? t('expand') : t('collapse')}
              >
                {isCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {/* ⋯ dropdown */}
              <div ref={dropdownRef} className="relative" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => setDropdown(d => !d)}
                  className="text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  aria-label="More options"
                >
                  <MoreHorizontal size={16} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-1.5 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 py-1.5 w-52 z-[60]">
                    <button
                      onClick={() => { setDropdown(false); handleClose() }}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors text-left"
                    >
                      <Minus size={14} className="text-slate-400 flex-shrink-0" />
                      {t('minimize')}
                    </button>
                    <button
                      onClick={() => { setDropdown(false); setIsExpanded(x => !x) }}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors text-left"
                    >
                      {isExpanded
                        ? <Minimize2 size={14} className="text-slate-400 flex-shrink-0" />
                        : <Maximize2 size={14} className="text-slate-400 flex-shrink-0" />}
                      {isExpanded ? t('reduceChat') : t('expand')}
                    </button>
                    <button
                      onClick={() => { setDropdown(false); setIsCollapsed(c => !c) }}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors text-left"
                    >
                      {isCollapsed
                        ? <ChevronUp size={14} className="text-slate-400 flex-shrink-0" />
                        : <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />}
                      {isCollapsed ? t('expand') : t('collapse')}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors text-left"
                    >
                      <Download size={14} className="text-slate-400 flex-shrink-0" />
                      {t('download')}
                    </button>
                    <div className="h-px bg-slate-100 dark:bg-slate-700 mx-2 my-1" />
                    <button
                      onClick={() => { setDropdown(false); setConvo(makeWelcome(t('greeting1'), t('greeting2'))) }}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors text-left"
                    >
                      <RefreshCw size={14} className="text-slate-400 flex-shrink-0" />
                      {t('newConversation')}
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={e => { e.stopPropagation(); handleClose() }}
                className="text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close chat"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* ── Collapsible body ── */}
          <div
            className="flex flex-col overflow-hidden"
            style={{ maxHeight: isCollapsed ? '0px' : bodyMaxHeight, transition: 'max-height 0.3s ease-in-out' }}
          >
            <div
              ref={msgsRef}
              className="flex-1 min-h-0 overflow-y-auto"
              style={{ minHeight: '120px' }}
            >
              <div className="p-4 space-y-3">
                {conversation.map((msg, i) => (
                  <div key={i} className={`flex items-end gap-2 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                    {msg.type === 'bot' && (
                      <div className="w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logo.png" alt="" className="w-5 h-5 object-contain" />
                      </div>
                    )}
                    <div className={`flex flex-col gap-0.5 max-w-[78%] ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          msg.type === 'user'
                            ? 'bg-primary text-white rounded-br-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 px-1">{msg.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-shrink-0 border-t border-slate-100 dark:border-slate-800 overflow-y-auto" style={{ maxHeight: '200px' }}>
              <div className="p-3 space-y-2.5">
                {FAQ_THEMES.map(theme => (
                  <div key={theme.label}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-xs">{theme.emoji}</span>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        {theme.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {theme.items.map(item => (
                        <button
                          key={item.q}
                          onClick={() => handleQuestion(item.q, item.a)}
                          className="text-left text-xs px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary dark:hover:border-blue-500 hover:text-primary dark:hover:text-blue-400 hover:bg-primary/5 dark:hover:bg-blue-500/10 text-slate-600 dark:text-slate-300 transition-colors leading-snug"
                        >
                          {item.q}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-shrink-0 px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 text-center bg-white dark:bg-slate-900">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 tracking-wide">
                {t('poweredBy').split('JobConnect AI')[0]}
                <span className="font-semibold text-slate-500 dark:text-slate-400">JobConnect AI</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
