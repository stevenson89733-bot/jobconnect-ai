import React from 'react'

/* ──────────────────────────────────────────────
   Shared components for blog article content
   ────────────────────────────────────────────── */

// Section heading: centered + cyan accent line
export function H2({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <div id={id} className="not-prose text-center mt-14 mb-7 scroll-mt-24">
      <h2 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white leading-snug">
        {children}
      </h2>
      <div className="mt-3 mx-auto w-14 h-[3px] bg-[#57C7E3] rounded-full" />
    </div>
  )
}

// Sub-section heading (H3)
export function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="not-prose text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-200 mt-8 mb-3 border-l-[3px] border-[#57C7E3] pl-3">
      {children}
    </h3>
  )
}

// Justified prose paragraph
export function P({ drop, children }: { drop?: boolean; children: React.ReactNode }) {
  return (
    <p
      className={`not-prose text-slate-700 dark:text-slate-300 leading-relaxed mb-6 text-[1.0625rem] text-justify max-w-[65ch] ${
        drop
          ? 'first-letter:float-left first-letter:text-[4rem] first-letter:font-extrabold first-letter:leading-none first-letter:mr-3 first-letter:mt-1 first-letter:text-[#57C7E3]'
          : ''
      }`}
    >
      {children}
    </p>
  )
}

// Highlighted Key Takeaway box
export function KeyTakeaway({ children }: { children: React.ReactNode }) {
  return (
    <div className="not-prose my-8 border-l-4 border-[#57C7E3] bg-sky-50 dark:bg-sky-950/30 rounded-r-xl p-6 text-center">
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-[#57C7E3] mb-2">
        Key Takeaway
      </p>
      <div className="text-slate-700 dark:text-slate-300 text-[0.9375rem] leading-relaxed">
        {children}
      </div>
    </div>
  )
}

// Styled blockquote
export function Quote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="not-prose my-8 border-l-4 border-[#F2A65A] pl-6 italic text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
      {children}
    </blockquote>
  )
}

// Table of Contents
export interface TOCItem { id: string; label: string }
export function TOC({ items }: { items: TOCItem[] }) {
  return (
    <div className="not-prose my-8 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 mb-3">
        In this article
      </p>
      <ol className="space-y-2">
        {items.map((item, i) => (
          <li key={item.id} className="flex items-start gap-2 text-sm">
            <span className="text-[#57C7E3] font-bold min-w-[1.5rem]">{i + 1}.</span>
            <a
              href={`#${item.id}`}
              className="text-slate-700 dark:text-slate-300 hover:text-[#57C7E3] dark:hover:text-[#57C7E3] transition-colors"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </div>
  )
}

// FAQ Section
export interface FAQItem { q: string; a: string }
export function FAQ({ items }: { items: FAQItem[] }) {
  return (
    <div className="not-prose mt-14">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white">
          Frequently Asked Questions
        </h2>
        <div className="mt-3 mx-auto w-14 h-[3px] bg-[#57C7E3] rounded-full" />
      </div>
      <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-700">
        {items.map((item, i) => (
          <div key={i} className="px-6 py-5">
            <p className="font-semibold text-slate-900 dark:text-white mb-2 text-[0.9375rem]">
              {item.q}
            </p>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// Stat highlight (opening hook)
export function StatHook({ children }: { children: React.ReactNode }) {
  return (
    <div className="not-prose mb-8 text-center py-6 px-4 bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-sky-950/30 dark:to-indigo-950/30 rounded-2xl border border-sky-100 dark:border-sky-900/40">
      <p className="text-2xl md:text-3xl font-extrabold text-[#57C7E3] leading-snug">{children}</p>
    </div>
  )
}

// Conclusion wrapper
export function Conclusion({ children }: { children: React.ReactNode }) {
  return (
    <div className="not-prose mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
      {children}
    </div>
  )
}
