import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import AutoApplyJoinButton from './AutoApplyJoinButton'

export const dynamic = 'force-dynamic'

export default async function AutoApplyPage() {
  const supabase = createClient()

  let isPro = false
  let isSignedIn = false

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      isSignedIn = true
      const { data } = await supabase
        .from('profiles')
        .select('is_admin, is_premium')
        .eq('user_id', user.id)
        .single()
      isPro = data?.is_admin === true || data?.is_premium === true
    }
  } catch { /* render as signed-out */ }

  let waitlistCount = 0
  try {
    const { count } = await supabase
      .from('auto_apply_waitlist')
      .select('*', { count: 'exact', head: true })
    waitlistCount = count ?? 0
  } catch { /* ignore */ }

  return (
    <div className="min-h-screen bg-[#10152A]">
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background glows */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-cyan-500/8 blur-3xl" />
        <div className="pointer-events-none absolute top-40 right-0 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl" />

        <div className="relative max-w-3xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-sm font-semibold text-cyan-400 mb-8">
            ⭐ Pro · Beta
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6">
            Auto-Apply —<br />
            <span className="text-cyan-400">Let AI apply for you daily</span>
          </h1>

          <p className="text-lg text-slate-400 leading-relaxed max-w-xl mx-auto mb-10">
            Upload your CV once. JobConnect AI finds verified remote jobs and sends personalized
            applications on your behalf — every day.
          </p>

          {isPro ? (
            <AutoApplyJoinButton />
          ) : isSignedIn ? (
            <div className="flex flex-col items-center gap-3">
              <button
                disabled
                className="inline-flex items-center gap-2 rounded-xl bg-slate-700 text-slate-500 font-semibold text-base px-8 py-3.5 cursor-not-allowed"
              >
                Auto-Apply — Pro Feature
              </button>
              <Link
                href="/pricing"
                className="text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
              >
                Upgrade to Pro →
              </Link>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold text-base px-8 py-3.5 transition-colors shadow-lg shadow-cyan-500/30"
            >
              Sign in to join Beta
            </Link>
          )}

          {waitlistCount > 0 && (
            <p className="mt-6 text-sm text-slate-500">
              <span className="text-slate-300 font-semibold">{waitlistCount}</span> candidate{waitlistCount > 1 ? 's' : ''} already on the waitlist
            </p>
          )}
        </div>
      </section>

      {/* ── 3 Steps ────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              icon: '📄',
              title: 'Upload your CV once',
              desc: 'Your profile and CV are saved securely. No repeat uploads — we use what you already have.',
            },
            {
              step: '02',
              icon: '🤖',
              title: 'AI matches you daily',
              desc: 'JobConnect AI scans verified remote job listings every day and selects the best matches for your profile.',
            },
            {
              step: '03',
              icon: '✉️',
              title: 'Applications sent for you',
              desc: 'A personalized CV and cover letter are generated and sent automatically — tailored to each job.',
            },
          ].map(({ step, icon, title, desc }) => (
            <div
              key={step}
              className="relative rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6 backdrop-blur-sm"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 text-2xl">{icon}</div>
                <div>
                  <span className="text-xs font-bold text-cyan-500/60 tracking-widest uppercase mb-1 block">{step}</span>
                  <h3 className="font-bold text-white text-base mb-2">{title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        {!isPro && (
          <div className="mt-12 text-center">
            <p className="text-slate-500 text-sm mb-4">Available exclusively for Pro members.</p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 font-semibold text-sm px-6 py-2.5 transition-colors"
            >
              View Pro plans →
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
