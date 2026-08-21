'use client'
import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X } from 'lucide-react'

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
        a: 'It creates personalized cover letters tailored to the company, role, and target country\'s professional tone. A cover letter for a German company sounds very different from one for a British firm. Our AI knows the difference.',
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

type Message = { type: 'user' | 'bot'; text: string }

export default function FaqWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  const [conversation, setConversation] = useState<Message[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (conversation.length > 0) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
  }, [conversation])

  function handleOpen() {
    setIsOpen(true)
    // Double RAF ensures the element is painted before transition starts
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
  }

  function handleClose() {
    setVisible(false)
    setTimeout(() => setIsOpen(false), 280)
  }

  function handleQuestion(q: string, a: string) {
    setConversation(prev => [...prev, { type: 'user', text: q }, { type: 'bot', text: a }])
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={handleOpen}
        className={`fixed bottom-24 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-primary dark:bg-blue-600 text-white shadow-lg transition-all duration-200 ${
          isOpen ? 'opacity-0 pointer-events-none scale-90' : 'opacity-100 scale-100 hover:scale-110 hover:shadow-xl'
        }`}
        aria-label="Open FAQ chat"
      >
        <MessageCircle size={24} />
      </button>

      {/* Panel */}
      {isOpen && (
        <div
          className={`fixed bottom-24 right-6 z-50 flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ease-out ${
            visible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
          }`}
          style={{ width: '360px', maxWidth: 'calc(100vw - 48px)', maxHeight: 'min(580px, calc(100vh - 120px))' }}
        >
          {/* Header */}
          <div className="bg-primary dark:bg-blue-700 px-4 py-3.5 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                JC
              </div>
              <div>
                <div className="text-white font-semibold text-sm leading-tight">JobConnect AI</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                  <span className="text-white/75 text-xs">Typically replies instantly</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white/70 hover:text-white transition-colors p-1"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages + Questions */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-4 space-y-3">

              {/* Welcome bot message */}
              <div className="flex items-end gap-2">
                <div className="w-6 h-6 rounded-full bg-primary dark:bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                  JC
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm max-w-[82%] leading-relaxed">
                  👋 Hi! How can I help you today?
                </div>
              </div>

              {/* Conversation history */}
              {conversation.map((msg, i) => (
                <div key={i} className={`flex items-end gap-2 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                  {msg.type === 'bot' && (
                    <div className="w-6 h-6 rounded-full bg-primary dark:bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                      JC
                    </div>
                  )}
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-sm max-w-[82%] leading-relaxed ${
                      msg.type === 'user'
                        ? 'bg-primary dark:bg-blue-600 text-white rounded-br-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Suggestion chips grouped by theme — always visible */}
              <div className="pt-2 space-y-3">
                {FAQ_THEMES.map(theme => (
                  <div key={theme.label}>
                    <div className="flex items-center gap-1.5 mb-2 px-0.5">
                      <span className="text-xs">{theme.emoji}</span>
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
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

              <div ref={bottomRef} />
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 flex-shrink-0 text-center bg-white dark:bg-slate-900">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 tracking-wide">
              Powered by <span className="font-medium text-slate-500 dark:text-slate-400">JobConnect AI</span>
            </span>
          </div>
        </div>
      )}
    </>
  )
}
