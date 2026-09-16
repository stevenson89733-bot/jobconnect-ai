import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Partner Tools | JobConnect AI',
  description: 'Recommended tools for international professionals — global payroll, employer of record, and cross-border payment solutions.',
}

const PARTNERS = [
  {
    name: 'Deel',
    logo: '🌍',
    tagline: 'Global payroll & compliance',
    description: 'Get paid in your local currency from employers anywhere in the world. Deel handles contracts, taxes, and compliance in 150+ countries — essential for remote workers hired internationally.',
    cta: 'Get Started with Deel →',
    href: 'https://www.deel.com/?ref=jobconnectai',
    accent: '#15d8a2',
  },
  {
    name: 'Remote.com',
    logo: '🏢',
    tagline: 'Employer of record for global teams',
    description: 'Remote.com lets companies hire full-time employees across borders without setting up local entities. If you land a job abroad, your employer can onboard you quickly and legally.',
    cta: 'Explore Remote.com →',
    href: 'https://remote.com/?ref=jobconnectai',
    accent: '#6b63ff',
  },
  {
    name: 'Wise',
    logo: '💸',
    tagline: 'International money transfers',
    description: 'Send and receive international salary payments at the real mid-market exchange rate. No hidden fees — save up to 8x compared to traditional bank transfers.',
    cta: 'Open a Wise Account →',
    href: 'https://wise.com/invite/jobconnectai',
    accent: '#00b9ff',
  },
  {
    name: 'Payoneer',
    logo: '💳',
    tagline: 'Global payment platform',
    description: 'Receive payments from international employers and marketplaces directly to a Payoneer account. Withdraw to your local bank or spend with the Payoneer card in 200+ countries.',
    cta: 'Join Payoneer →',
    href: 'https://www.payoneer.com/ref/jobconnectai',
    accent: '#ff4800',
  },
]

export default function PartnersPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="text-center mb-14">
        <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary dark:text-blue-400 mb-3">Recommended Tools</span>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Partner Tools for<br />International Professionals</h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Working across borders comes with unique challenges. These tools are trusted by thousands of remote workers to handle payroll, compliance, and cross-border payments — so you can focus on the work.
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-600 mt-3">
          Some links below are affiliate links. We may earn a small commission if you sign up — at no cost to you.
        </p>
      </div>

      {/* Partner Cards */}
      <div className="grid sm:grid-cols-2 gap-6">
        {PARTNERS.map((partner) => (
          <div
            key={partner.name}
            className="bg-white dark:bg-card rounded-2xl border border-slate-200 dark:border-slate-700/50 p-7 flex flex-col gap-4 hover:shadow-lg dark:hover:shadow-slate-900/40 transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="text-4xl">{partner.logo}</div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{partner.name}</h2>
                <p className="text-xs font-medium" style={{ color: partner.accent }}>{partner.tagline}</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-1">{partner.description}</p>
            <a
              href={partner.href}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: partner.accent }}
            >
              {partner.cta}
            </a>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-16 text-center border-t border-slate-200 dark:border-slate-800 pt-12">
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">Ready to find your next international role?</p>
        <Link href="/jobs" className="btn-primary px-8 py-3 text-sm">Browse Remote Jobs →</Link>
      </div>
    </div>
  )
}
