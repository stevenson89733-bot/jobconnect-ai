import type { Metadata } from 'next'
import Link from 'next/link'
import { absoluteUrl } from '@/lib/seo'
import FadeIn from '@/components/dashboard/FadeIn'
import { CountUpStat } from '@/components/landing/CountUpStat'

export const metadata: Metadata = {
  title: 'JobConnect AI — The career copilot for the cross-border generation',
  description: 'AI-powered remote jobs and career tools for international professionals targeting roles in the US, UK, Germany, France, and Canada.',
  alternates: { canonical: absoluteUrl('/') },
  openGraph: {
    title: 'JobConnect AI — The career copilot for the cross-border generation',
    description: 'AI-powered remote jobs and career tools for international professionals targeting roles in the US, UK, Germany, France, and Canada.',
    url: absoluteUrl('/'),
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JobConnect AI — The career copilot for the cross-border generation',
    description: 'AI-powered remote jobs and career tools for international professionals.',
  },
}

function OrganizationJsonLd() {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'JobConnect AI',
    url: absoluteUrl('/'),
    description: 'AI-powered remote job platform connecting cross-border candidates with real, verified remote opportunities.',
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />
}

// ── Decorative floating job card shown in the hero ──
function HeroJobCard() {
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-5 border border-slate-100 w-full max-w-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ background: '#1a1a2e' }}
          >
            A
          </div>
          <div>
            <div className="text-[13px] font-semibold text-slate-800">Anthropic</div>
            <div className="text-[11px] text-slate-400">AI Safety</div>
          </div>
        </div>
        <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
          ✓ Likely
        </span>
      </div>

      <h3 className="font-bold text-[17px] leading-snug mb-2" style={{ color: '#10152A' }}>
        Product Manager, Growth
      </h3>

      <span
        className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1 rounded-full mb-3 border"
        style={{ background: 'rgba(87,199,227,0.1)', color: '#57C7E3', borderColor: 'rgba(87,199,227,0.3)' }}
      >
        ✦ 94% match · AI ranked
      </span>

      <div className="flex items-center gap-2 text-[12px] text-slate-500 mb-4 flex-wrap">
        <span className="font-semibold text-slate-700">$120k – $180k</span>
        <span className="text-slate-300">·</span>
        <span>🇺🇸</span>
        <span>San Francisco, CA</span>
      </div>

      <Link
        href="/jobs"
        className="flex items-center justify-center gap-1.5 text-white text-[13px] font-semibold px-4 py-2 rounded-lg transition-colors w-full"
        style={{ background: '#57C7E3' }}
      >
        Apply now ↗
      </Link>
    </div>
  )
}

// ── ATS resume mockup ──
function ATSMockup() {
  return (
    <div className="relative max-w-lg mx-auto">
      {/* Resume card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6">
        <div className="mb-4 pb-4 border-b border-slate-100">
          <div className="font-bold text-[18px] text-slate-900">Amara D.</div>
          <div className="text-[13px] font-medium" style={{ color: '#57C7E3' }}>Senior Product Manager</div>
          <div className="text-[12px] text-slate-400 mt-0.5">Lagos, Nigeria · Available immediately</div>
        </div>
        <div className="space-y-2 mb-4">
          <div className="text-[12px] text-slate-600">✦ Led cross-functional team of 12, shipped payments for 50M users</div>
          <div className="text-[12px] text-slate-600">✦ Increased conversion 34% via A/B-tested checkout redesign</div>
          <div className="text-[12px] text-slate-600">✦ Managed €2.4M product roadmap across 3 markets</div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['Product Strategy', 'Roadmapping', 'OKRs', 'A/B Testing', 'Stakeholder Mgmt'].map((s) => (
            <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">{s}</span>
          ))}
        </div>
      </div>

      {/* ATS overlay card */}
      <div
        className="absolute -bottom-6 -right-4 sm:-right-10 bg-white rounded-xl shadow-xl border border-slate-200 p-4 w-52"
      >
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">ATS Score</div>
        <div className="flex items-end gap-2 mb-1">
          <span className="text-3xl font-black" style={{ color: '#10152A' }}>87</span>
          <span className="text-sm text-slate-400 mb-1">/100</span>
        </div>
        <div className="text-[11px] font-semibold text-emerald-600 mb-2">Strong fit for Germany</div>
        <div>
          <div className="text-[10px] text-slate-400 mb-1">Skills matched</div>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div className="h-1.5 rounded-full" style={{ width: '87%', background: '#57C7E3' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function Home() {
  return (
    <>
      <OrganizationJsonLd />

      {/* ── 1. HERO ───────────────────────────────────────────── */}
      <section style={{ background: '#10152A' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

            {/* Left copy */}
            <div className="flex-1 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/15 text-[13px] text-slate-300 mb-8"
                   style={{ background: 'rgba(255,255,255,0.07)' }}>
                <span className="w-2 h-2 rounded-full animate-pulse shrink-0" style={{ background: '#57C7E3' }} />
                🌍 The #1 platform for cross-border remote jobs
              </div>

              {/* H1 */}
              <h1 className="font-bold text-white leading-tight tracking-tight mb-2"
                  style={{ fontSize: 'clamp(36px, 6vw, 64px)' }}>
                Your career has<br className="hidden sm:block" /> no borders.
              </h1>

              {/* Cyan italic sub */}
              <p className="text-base sm:text-lg font-medium italic mb-4" style={{ color: '#57C7E3' }}>
                Find work that travels with you.
              </p>

              {/* Description */}
              <p className="text-slate-400 mb-8 max-w-lg mx-auto lg:mx-0"
                 style={{ fontSize: '17px', lineHeight: '1.7' }}>
                AI-powered career tools for international professionals targeting remote roles in US, UK, Germany, France and Canada.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-8">
                <Link
                  href="/jobs"
                  className="inline-flex items-center gap-2 text-white font-bold rounded-full px-7 py-3.5 text-[15px] transition-all hover:brightness-110"
                  style={{ background: '#57C7E3' }}
                >
                  Find remote jobs →
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 border font-bold rounded-full px-7 py-3.5 text-[15px] text-white transition-colors hover:bg-white/10"
                  style={{ borderColor: 'rgba(255,255,255,0.3)' }}
                >
                  ▶ See how it works
                </Link>
              </div>

              {/* Flag row */}
              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <span className="flex gap-1 text-2xl">🇺🇸🇬🇧🇩🇪🇫🇷🇨🇦</span>
                <span className="text-[13px] text-slate-400">Jobs available in 5 markets</span>
              </div>
            </div>

            {/* Right — floating job card */}
            <div className="w-full lg:w-auto lg:flex-shrink-0 flex justify-center lg:justify-end">
              <HeroJobCard />
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. STATS ROW ──────────────────────────────────────── */}
      <section style={{ background: '#0c1020' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x divide-white/10">
            {[
              { value: '2,400+', label: 'Remote Jobs' },
              { value: '94%',    label: 'Match Accuracy' },
              { value: '5',      label: 'Target Markets' },
              { value: 'Free',   label: 'To Start' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center px-6">
                <div className="font-black text-4xl sm:text-5xl text-white mb-1">{value}</div>
                <div className="text-[12px] font-semibold uppercase tracking-widest text-slate-400">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. COPILOT SECTION ────────────────────────────────── */}
      <FadeIn>
        <section style={{ background: '#F7F9FD' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

              {/* Left copy */}
              <div className="flex-1 text-center lg:text-left">
                <p className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: '#57C7E3' }}>
                  Powered by Intent, Not Keywords
                </p>
                <h2 className="font-bold leading-tight mb-2" style={{ fontSize: 'clamp(32px, 4vw, 52px)', color: '#10152A' }}>
                  Don&apos;t search.
                </h2>
                <p className="text-3xl sm:text-4xl font-bold italic mb-6" style={{ color: '#57C7E3' }}>
                  Just ask.
                </p>
                <p className="text-slate-500 max-w-md mx-auto lg:mx-0" style={{ fontSize: '16px', lineHeight: '1.75' }}>
                  Traditional job boards make you translate your ambitions into filters. JobConnect understands what you mean — and finds the signal in the noise.
                </p>
              </div>

              {/* Right — chat mockup */}
              <div className="flex-1 w-full max-w-md mx-auto lg:mx-0">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                  {/* Header */}
                  <div className="px-5 py-4 border-b border-slate-100" style={{ background: '#10152A' }}>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
                      Your Personal Career Copilot
                    </div>
                    <div className="text-[13px] text-white">Ask anything about your next move</div>
                  </div>

                  {/* Chat messages */}
                  <div className="p-5 space-y-4">
                    {/* User message */}
                    <div className="flex justify-end">
                      <div className="bg-slate-100 rounded-xl rounded-tr-none px-4 py-2.5 text-[13px] text-slate-700 max-w-xs">
                        Find me a remote UX Designer role in Germany
                      </div>
                    </div>

                    {/* Bot response */}
                    <div className="flex gap-3 items-start">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5"
                        style={{ background: '#57C7E3' }}
                      >
                        AI
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-xl rounded-tl-none px-4 py-3 text-[13px] text-slate-700 flex-1">
                        <p className="mb-2">Found <strong>12 roles</strong> matching your profile.</p>
                        <p className="mb-2">
                          <span className="text-emerald-600 font-semibold">3 are Likely</span> to hire internationally.
                        </p>
                        <p>
                          Top match:{' '}
                          <span className="font-semibold" style={{ color: '#10152A' }}>Figma Berlin</span>
                          {' '}—{' '}
                          <span className="font-semibold" style={{ color: '#57C7E3' }}>91% match</span>
                        </p>
                      </div>
                    </div>

                    {/* Typing indicator */}
                    <div className="flex gap-3 items-start">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                        style={{ background: '#57C7E3' }}
                      >
                        AI
                      </div>
                      <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>

                  {/* Input bar */}
                  <div className="px-4 pb-4">
                    <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50">
                      <span style={{ color: '#57C7E3' }} className="text-base">✦</span>
                      <span className="text-[13px] text-slate-400 flex-1">Ask the AI Copilot...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* ── 4. ATS SCORE VISUAL ───────────────────────────────── */}
      <FadeIn>
        <section className="bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

              {/* Left — resume mockup */}
              <div className="flex-1 w-full">
                <ATSMockup />
              </div>

              {/* Right copy */}
              <div className="flex-1 text-center lg:text-left">
                <p className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: '#57C7E3' }}>
                  AI Resume Optimization
                </p>
                <h2 className="font-bold leading-tight mb-4" style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', color: '#10152A' }}>
                  Know your score<br /> before you apply.
                </h2>
                <p className="text-slate-500 mb-6 max-w-md mx-auto lg:mx-0" style={{ fontSize: '16px', lineHeight: '1.75' }}>
                  Our AI scores your resume against the target role and market — country-specific ATS expectations, skill gaps, and keyword density — so you apply with confidence.
                </p>
                <Link
                  href="/ai-tools/resume-builder"
                  className="inline-flex items-center gap-2 font-semibold text-[14px] transition-colors"
                  style={{ color: '#57C7E3' }}
                >
                  Try the Resume Builder ↗
                </Link>
              </div>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* ── 5. FEATURES ───────────────────────────────────────── */}
      <FadeIn>
        <section className="bg-white border-t border-slate-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
            {/* Heading */}
            <div className="text-center mb-14">
              <p className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: '#57C7E3' }}>
                Everything You Need to Move
              </p>
              <h2 className="font-bold leading-tight mb-4" style={{ fontSize: 'clamp(28px, 4vw, 48px)', color: '#10152A' }}>
                A smarter way to{' '}
                <span className="italic" style={{ color: '#57C7E3' }}>work abroad.</span>
              </h2>
              <p className="text-slate-500 max-w-xl mx-auto" style={{ fontSize: '16px', lineHeight: '1.75' }}>
                From your first search to your signed offer, every part of your cross-border career gets a little more intelligent.
              </p>
            </div>

            {/* Feature cards */}
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                {
                  num: '01',
                  icon: '📄',
                  title: 'AI Resume Builder',
                  desc: 'Build a resume that speaks the language of your target market with country-specific formats and signals.',
                  href: '/ai-tools/resume-builder',
                },
                {
                  num: '02',
                  icon: '🌍',
                  title: 'Remote-Friendly Detector',
                  desc: 'Know before you apply. Every role is scored Likely, Unclear, or Unlikely to hire internationally.',
                  href: '/jobs',
                },
                {
                  num: '03',
                  icon: '📊',
                  title: 'Skill Gap Analysis',
                  desc: 'Find out exactly what skills you need for your target market — before you apply.',
                  href: '/ai-tools',
                },
                {
                  num: '04',
                  icon: '🤖',
                  title: 'AI Copilot',
                  desc: 'Type what you want in plain language. We handle the rest.',
                  href: '/ai-tools',
                },
              ].map(({ num, icon, title, desc, href }) => (
                <div
                  key={num}
                  className="rounded-2xl border border-slate-200 p-7 hover:border-[#57C7E3]/50 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-2xl">{icon}</span>
                    <span className="font-black text-4xl text-slate-100 select-none">{num}</span>
                  </div>
                  <h3 className="font-bold text-[17px] mb-2" style={{ color: '#10152A' }}>{title}</h3>
                  <p className="text-slate-500 text-[14px] leading-relaxed mb-4">{desc}</p>
                  <Link
                    href={href}
                    className="text-[13px] font-semibold transition-colors group-hover:underline"
                    style={{ color: '#57C7E3' }}
                  >
                    Explore feature ↗
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeIn>

      {/* ── 6. TESTIMONIALS ───────────────────────────────────── */}
      <FadeIn>
        <section style={{ background: '#10152A' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
            {/* Heading */}
            <div className="text-center mb-12">
              <p className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: '#57C7E3' }}>
                A Global Community
              </p>
              <h2 className="font-bold leading-tight" style={{ fontSize: 'clamp(28px, 4vw, 48px)', color: 'white' }}>
                Trusted by professionals{' '}
                <span className="italic" style={{ color: '#57C7E3' }}>from 40+ countries.</span>
              </h2>
            </div>

            {/* Cards */}
            <div className="grid md:grid-cols-3 gap-5">
              {[
                {
                  initials: 'LM',
                  color: '#7c3aed',
                  quote: 'JobConnect helped me stop guessing which companies could actually hire me. I landed my first US remote role in six weeks.',
                  name: 'Laura M.',
                  role: 'Product Designer',
                  city: 'Berlin',
                },
                {
                  initials: 'AK',
                  color: '#2563eb',
                  quote: 'The skill gap analysis showed me exactly what I was missing for the German market. Three months later, I had an offer.',
                  name: 'Amara K.',
                  role: 'Data Analyst',
                  city: 'Lagos',
                },
                {
                  initials: 'JR',
                  color: '#059669',
                  quote: "Finally a platform that understands I'm not looking for a job near me — I'm looking for a job that works for me, wherever I am.",
                  name: 'James R.',
                  role: 'Software Engineer',
                  city: 'Manila',
                },
              ].map(({ initials, color, quote, name, role, city }) => (
                <div
                  key={initials}
                  className="rounded-2xl p-6"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <div className="text-[#57C7E3] text-sm mb-4">⭐⭐⭐⭐⭐</div>
                  <p className="text-slate-300 text-[14px] leading-relaxed mb-5 italic">&ldquo;{quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[12px] font-bold shrink-0"
                      style={{ background: color }}
                    >
                      {initials}
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-white">{name}</div>
                      <div className="text-[11px] text-slate-400">{role} · {city}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeIn>

      {/* ── 7. CTA BANNER ─────────────────────────────────────── */}
      <FadeIn>
        <section style={{ background: 'linear-gradient(135deg, #57C7E3 0%, #3ab5d1 50%, #2a9fc0 100%)' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
            <h2 className="font-bold text-white leading-tight mb-4" style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}>
              Start your cross-border career today.
            </h2>
            <p className="text-white/80 mb-8 max-w-lg mx-auto" style={{ fontSize: '17px' }}>
              Join thousands of international professionals finding remote work abroad.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 font-bold rounded-full px-8 py-4 text-[15px] transition-colors hover:bg-slate-50"
              style={{ background: 'white', color: '#10152A' }}
            >
              Get Started Free →
            </Link>
          </div>
        </section>
      </FadeIn>
    </>
  )
}
