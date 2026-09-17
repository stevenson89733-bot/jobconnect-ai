'use client'

import { useState } from 'react'

const TIPS = [
  { icon: '🎯', text: 'Apply to roles where you match 75%+ — quality over quantity improves your response rate.' },
  { icon: '📅', text: 'Limit to 3–5 quality applications per day. Rushed applications rarely convert.' },
  { icon: '👁️', text: 'Always review your cover letter before sending — small personalizations make a big difference.' },
  { icon: '🌍', text: "Focus on cross-border eligible roles — they're legally set up to hire internationally." },
]

export default function AtsEducationWidget() {
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem('ats_edu_dismissed') === '1' } catch { return false }
  })

  if (dismissed) return null

  return (
    <div className="rounded-2xl border border-blue-200 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-900/10 p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">💡</span>
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Safe Application Patterns</h3>
        </div>
        <button
          onClick={() => {
            try { localStorage.setItem('ats_edu_dismissed', '1') } catch { /* ignore */ }
            setDismissed(true)
          }}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors text-lg leading-none"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {TIPS.map((tip, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <span className="text-base shrink-0 mt-0.5">{tip.icon}</span>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{tip.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
