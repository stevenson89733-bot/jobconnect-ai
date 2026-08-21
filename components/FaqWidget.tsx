'use client'
import { useState } from 'react'
import { MessageCircle, X, ArrowLeft } from 'lucide-react'

const FAQ_DATA = [
  {
    question: 'What is JobConnect AI?',
    answer: 'JobConnect AI is a career copilot built for international professionals seeking remote jobs across borders. AI-powered tools + a curated remote job board — all in one place.',
  },
  {
    question: 'Is it free?',
    answer: 'Yes! Browsing jobs and applying is free forever. Premium AI tools (Resume Builder, Cover Letter, Interview Prep and more) start at $19/month.',
  },
  {
    question: 'What does Premium include?',
    answer: 'Unlimited AI resumes & cover letters, ATS scoring, Interview Prep, Skill Gap Analysis, Career Coach, and country-specific formatting for US, UK, Canada, Germany and France — powered by GPT-4o.',
  },
  {
    question: 'Can I apply from anywhere?',
    answer: 'Absolutely. JobConnect AI is built for professionals based anywhere in the world targeting remote roles internationally. Your location is not a barrier.',
  },
  {
    question: 'How do I contact support?',
    answer: 'Email us at contact@jobconnect-ai.com — we typically respond within 24 hours.',
  },
]

export default function FaqWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const currentFaq = selectedIndex !== null ? FAQ_DATA[selectedIndex] : null

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-primary dark:bg-blue-600 text-white shadow-lg hover:shadow-xl transition-shadow hover:scale-110 transform duration-200"
          aria-label="Open FAQ chat"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat widget */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm flex flex-col bg-white dark:bg-card border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl max-h-[600px]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-primary/5 to-transparent dark:from-blue-600/10">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Help & Support</h3>
            <button
              onClick={() => {
                setIsOpen(false)
                setSelectedIndex(null)
              }}
              className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {currentFaq === null ? (
              <>
                {/* Welcome message */}
                <div className="flex justify-start">
                  <div className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-4 py-3 max-w-xs text-sm">
                    👋 Hi! How can I help you today?
                  </div>
                </div>

                {/* Quick questions */}
                <div className="space-y-2 pt-2">
                  {FAQ_DATA.map((faq, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedIndex(idx)}
                      className="w-full text-left p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-primary dark:hover:border-blue-600 transition-all text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium"
                    >
                      {faq.question}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* Answer view */}
                <div className="flex justify-start">
                  <div className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-4 py-3 text-sm leading-relaxed">
                    {currentFaq.answer}
                  </div>
                </div>

                {/* Back button */}
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => setSelectedIndex(null)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  >
                    <ArrowLeft size={16} />
                    Back
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
