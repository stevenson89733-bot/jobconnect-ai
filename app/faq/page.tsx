'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'

function Item({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-slate-200 dark:border-slate-800 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left flex items-center justify-between py-5 gap-4"
      >
        <span className="font-semibold text-slate-900 dark:text-white text-[15px] leading-snug">{q}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <p className="pb-5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{a}</p>
      )}
    </div>
  )
}

export default function FaqPage() {
  const t = useTranslations('faqPage')

  const items = Array.from({ length: 10 }, (_, i) => ({
    q: t(`q${i + 1}` as any),
    a: t(`a${i + 1}` as any),
  }))

  return (
    <main className="min-h-screen bg-white dark:bg-background">
      <section className="bg-[#10152A] py-16 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">{t('title')}</h1>
          <p className="text-slate-400">{t('subtitle')}</p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="card divide-y-0">
          {items.map(({ q, a }, i) => (
            <Item key={i} q={q} a={a} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-slate-500 dark:text-slate-400 mb-3">{t('stillHaveQuestions')}</p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#57C7E3] text-[#10152A] font-semibold hover:bg-[#3fb8d4] transition-colors"
          >
            {t('contactUs')}
          </Link>
        </div>
      </div>
    </main>
  )
}
