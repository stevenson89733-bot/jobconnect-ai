'use client'
import { useState, useRef, useEffect } from 'react'
import { X, MoreHorizontal, Download, RefreshCw, Minus, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react'

const FAQ_THEMES = [
  {
    emoji: '🚀',
    label: 'Getting Started',
    items: [
      {
        q: 'What is JobConnect AI?',
        a: 'JobConnect AI is a career copilot built for international professionals seeking remote jobs across borders. AI-powered tools + a curated remote job board — all in one place.',
      },
      {
        q: 'Who is JobConnect AI for?',
        a: "JobConnect AI is built for ambitious professionals who refuse to let geography limit their career. Whether you're a developer in Vietnam targeting a Berlin startup, or a finance professional in Southeast Asia eyeing a Canadian firm — if you're chasing a remote career that crosses borders, this platform was built for you.",
      },
      {
        q: 'What makes JobConnect AI different from LinkedIn or Indeed?',
        a: 'LinkedIn and Indeed are built country by country. International professionals fall through the cracks. JobConnect AI is built from the ground up for the cross-border job seeker — every tool, every feature designed for someone applying across borders.',
      },
      {
        q: 'Is it free?',
        a: 'Yes! Browsing jobs and applying is free forever. Premium AI tools (Resume Builder, Cover Letter, Interview Prep and more) start at $19/month.',
      },
      {
        q: 'Do you offer a free trial?',
        a: "Our free plan gives you job browsing, applications, and your candidate dashboard — indefinitely. Upgrade to Premium when you're ready. No trial period needed.",
      },
    ],
  },
  {
    emoji: '💼',
    label: 'AI Tools',
    items: [
      {
        q: 'What does Premium include?',
        a: 'Unlimited AI resumes & cover letters, ATS scoring, Interview Prep, Skill Gap Analysis, Career Coach, and country-specific formatting for US, UK, Canada, Germany and France — powered by GPT-4o.',
      },
      {
        q: 'How does the AI Resume Builder work?',
        a: "Tell us your target role, experience, and skills. Our AI generates an ATS-optimized resume tailored to the specific country you're targeting. A resume for Germany looks very different from one for the US — we handle those differences automatically.",
      },
      {
        q: 'What is the Remote-Friendly Detector?',
        a: 'Our Remote-Friendly Detector analyzes every job listing to determine whether it genuinely welcomes international candidates — displaying a Likely / Unclear / Unlikely badge so you never waste time on the wrong applications.',
      },
      {
        q: 'How does the Skill Gap Analysis work?',
        a: "Enter your target role and country. Our AI identifies your missing skills, relevant certifications recognized in that market, language expectations, and cultural norms. Market-specific intelligence, not generic advice.",
      },
      {
        q: 'What is the AI Cover Letter Generator?',
        a: "It creates personalized cover letters tailored to the company, role, and target country's professional tone. A cover letter for a German company sounds very different from one for a British firm. Our AI knows the difference.",
      },
      {
        q: 'What is Interview Prep?',
        a: 'Your personal AI interview coach. Get realistic interview questions — behavioral, technical, situational — with instant detailed feedback on your answers. Available 24/7, from anywhere.',
      },
      {
        q: 'What is the Career Coach?',
        a: 'A comprehensive analysis of your professional profile: ATS score, skill gaps, salary benchmarks, and a personalized roadmap to your next career milestone. A senior career advisor available 24/7.',
      },
      {
        q: 'How does the Copilot work?',
        a: 'Just type what you need in plain language — "Improve my resume for Amazon" or "Find remote jobs in France." Our AI Copilot understands your intent and takes you directly to the right tool, pre-filled. No menus, no friction.',
      },
    ],
  },
  {
    emoji: '🌍',
    label: 'International',
    items: [
      {
        q: 'What countries are supported?',
        a: 'Our AI tools are fully optimized for five major job markets: United States, United Kingdom, Canada, Germany, and France. Support for additional markets is coming soon.',
      },
      {
        q: 'Can I apply from anywhere?',
        a: 'Absolutely. JobConnect AI is built for professionals based anywhere in the world targeting remote roles internationally. Your location is not a barrier.',
      },
      {
        q: 'Can I apply to jobs from outside my country?',
        a: "Absolutely. Whether you're based in Asia, Africa, Latin America, or Eastern Europe — you can browse, apply, and land remote roles with top companies worldwide. Your location is not a barrier.",
      },
    ],
  },
  {
    emoji: '💳',
    label: 'Billing & Account',
    items: [
      {
        q: 'How does billing work?',
        a: 'Premium is billed monthly at $19/month. Cancel anytime — no contracts, no cancellation fees. If you cancel, you keep access until the end of your billing period.',
      },
      {
        q: 'How do I cancel my subscription?',
        a: 'Go to your account settings and cancel in one click. No phone calls, no forms. You keep full Premium access until the end of your billing cycle.',
      },
    ],
  },
  {
    emoji: '🔒',
    label: 'Security & Support',
    items: [
      {
        q: 'Is my data secure?',
        a: 'Your data is protected by enterprise-grade security with Row Level Security. Your information is only accessible by you — we never sell your data or share it with third parties.',
      },
      {
        q: 'How do I contact support?',
        a: 'Email us at contact@jobconnect-ai.com — we typically respond within 24 hours.',
      },
    ],
  },
]

type Message = { type: 'user' | 'bot'; text: string; time: string }

function now() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function makeWelcome(): Message[] {
  const t = now()
  return [
    { type: 'bot', text: "👋 Hi there! I'm the JobConnect AI assistant. How can I help you today?", time: t },
    { type: 'bot', text: 'Choose a topic below or type your question.', time: t },
  ]
}

export default function FaqWidget() {
  const [isOpen, setIsOpen]           = useState(false)
  const [visible, setVisible]         = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [dropdownOpen, setDropdown]   = useState(false)
  const [showBadge, setShowBadge]     = useState(true)
  const [conversation, setConvo]      = useState<Message[]>(makeWelcome)

  // Separate scroll containers: messages scroll independently from chips
  const msgsRef    = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Scroll messages to bottom after every new message
  useEffect(() => {
    const el = msgsRef.current
    if (!el) return
    // Use scrollTop = scrollHeight — reliable, always shows latest message at bottom
    setTimeout(() => { el.scrollTop = el.scrollHeight }, 60)
  }, [conversation])

  // Close dropdown on outside click
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
    setTimeout(() => { setIsOpen(false); setIsCollapsed(false) }, 280)
  }

  function handleQuestion(q: string, a: string) {
    const t = now()
    setConvo(prev => [...prev, { type: 'user', text: q, time: t }, { type: 'bot', text: a, time: t }])
  }

  function handleDownload() {
    setDropdown(false)
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    const lines = [
      'JobConnect AI - Chat Transcript',
      `Date: ${date}`,
      '---',
      '',
      ...conversation.map(m => `[${m.time}] ${m.type === 'user' ? 'You' : 'JobConnect AI'}: ${m.text}`),
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
          style={{ width: '360px', maxWidth: 'calc(100vw - 48px)' }}
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
                  <span className="text-green-300 text-[10px] font-semibold">Online</span>
                </div>
                <p className="text-white/65 text-[11px] mt-0.5 leading-tight">Typically replies instantly</p>
              </div>
            </div>

            <div className="flex items-center gap-0.5 flex-shrink-0 ml-2">
              <button
                onClick={e => { e.stopPropagation(); setIsCollapsed(c => !c); setDropdown(false) }}
                className="text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                aria-label={isCollapsed ? 'Expand chat' : 'Collapse chat'}
              >
                {isCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

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
                      Minimize chat
                    </button>
                    <button
                      onClick={() => { setDropdown(false); setIsCollapsed(c => !c) }}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors text-left"
                    >
                      {isCollapsed
                        ? <ChevronUp size={14} className="text-slate-400 flex-shrink-0" />
                        : <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />}
                      {isCollapsed ? 'Expand view' : 'Collapse view'}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors text-left"
                    >
                      <Download size={14} className="text-slate-400 flex-shrink-0" />
                      Download transcript
                    </button>
                    <div className="h-px bg-slate-100 dark:bg-slate-700 mx-2 my-1" />
                    <button
                      onClick={() => { setDropdown(false); setConvo(makeWelcome()) }}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors text-left"
                    >
                      <RefreshCw size={14} className="text-slate-400 flex-shrink-0" />
                      New conversation
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
            style={{ maxHeight: isCollapsed ? '0px' : '456px', transition: 'max-height 0.3s ease-in-out' }}
          >
            {/*
             * MESSAGES — own scroll zone, grows to fill available space.
             * New messages are always appended at the bottom.
             * scrollTop = scrollHeight in useEffect keeps latest message visible.
             * min-h-0 is required for flex-1 to shrink when chips section is tall.
             */}
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

            {/*
             * CHIPS — separate fixed-height zone below messages.
             * Never shifts existing messages. User always sees latest message
             * at bottom of the messages zone; chips are always reachable below.
             */}
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

            {/* Footer */}
            <div className="flex-shrink-0 px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 text-center bg-white dark:bg-slate-900">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 tracking-wide">
                Powered by <span className="font-semibold text-slate-500 dark:text-slate-400">JobConnect AI</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
