'use client'
import Link from 'next/link'

export default function AutoApplyCard({ isPro }: { isPro: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-700/60 bg-gradient-to-br from-[#10152A] via-[#0f1a35] to-[#0c1628] p-6 shadow-xl">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-blue-600/10 blur-3xl" />

      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-0.5 text-xs font-semibold text-cyan-400">
              ⭐ Pro Feature · New
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mb-1">Auto-Apply</h2>
          <p className="text-sm text-slate-400 leading-relaxed max-w-lg">
            Upload your CV once — JobConnect AI matches you to verified remote jobs daily and sends personalized applications on your behalf.
          </p>
        </div>

        <div className="flex-shrink-0">
          {isPro ? (
            <Link
              href="/auto-apply"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold text-sm px-5 py-2.5 transition-colors shadow-lg shadow-cyan-500/25"
            >
              <span className="text-base">✦</span> Enable Auto-Apply
            </Link>
          ) : (
            <div className="flex flex-col items-start sm:items-end gap-1.5">
              <button
                disabled
                className="inline-flex items-center gap-2 rounded-xl bg-slate-700 text-slate-500 font-semibold text-sm px-5 py-2.5 cursor-not-allowed"
              >
                Auto-Apply — Pro Feature
              </button>
              <Link
                href="/pricing"
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
              >
                Upgrade to Pro →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
