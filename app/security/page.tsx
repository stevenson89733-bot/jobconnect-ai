import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Security & Compliance — JobConnect AI',
  description: 'How JobConnect AI protects candidate and employer data: infrastructure security, GDPR compliance, candidate rights, and B2B trust statements.',
}

function Section({ id, icon, title, children }: { id: string; icon: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl" aria-hidden="true">{icon}</span>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
      </div>
      <div className="space-y-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
        {children}
      </div>
    </section>
  )
}

function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <span className="mt-0.5 text-cyan-500 shrink-0">▸</span>
      <p><span className="font-semibold text-slate-700 dark:text-slate-300">{label} —</span>{' '}{children}</p>
    </div>
  )
}

function NumItem({ n, label, children }: { n: number; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="shrink-0 w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold flex items-center justify-center mt-0.5">{n}</span>
      <p><span className="font-semibold text-slate-700 dark:text-slate-300">{label} —</span>{' '}{children}</p>
    </div>
  )
}

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#0c1830]">
      <div className="max-w-3xl mx-auto px-6 py-16 sm:py-24">

        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-500 mb-3">SJL Technologies LLC</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">
            Security &amp; Compliance
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Updated October 2026</p>
        </div>

        {/* Jump links */}
        <nav aria-label="Page sections" className="mb-12 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {[
              ['#infrastructure', 'Infrastructure Security'],
              ['#gdpr', 'Data Privacy & GDPR'],
              ['#candidate-rights', 'Candidate Rights'],
              ['#b2b', 'B2B Trust Statements'],
            ].map(([href, label]) => (
              <li key={href}>
                <a href={href} className="text-cyan-600 dark:text-cyan-400 hover:underline">{label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-14">

          {/* 1 — Infrastructure Security */}
          <Section id="infrastructure" icon="🔒" title="Infrastructure Security">
            <Item label="HTTPS / TLS in transit">
              All data exchanged between the browser and servers is encrypted end-to-end. Enforced by default on Vercel.
            </Item>
            <Item label="Encryption at rest (AES-256)">
              All data stored in our PostgreSQL database (Supabase) is encrypted at rest.
            </Item>
            <Item label="Row-Level Security (RLS)">
              Each employer client accesses only its own data. Supabase RLS policies enforce strict tenant isolation: Company A cannot access Company B's candidates or analyses.
            </Item>
            <Item label="Secure authentication">
              Candidate and recruiter accounts are protected via JWT-based tokens and secure session management (Supabase Auth).
            </Item>
          </Section>

          {/* 2 — Data Privacy & GDPR */}
          <Section id="gdpr" icon="🇪🇺" title="Data Privacy & GDPR">
            <p className="mb-1">JobConnect AI is designed in accordance with GDPR principles:</p>
            <Item label="Data minimisation">
              We collect only what is strictly necessary to connect candidates with employers.
            </Item>
            <Item label="Purpose limitation">
              Candidate data is used solely for recruitment matching. It is never sold, rented, or shared with third parties.
            </Item>
            <Item label="Retention policy">
              Candidate profiles and assessments are retained only for the duration of active use, with automatic deletion after 12 months of inactivity (planned).
            </Item>
            <Item label="Consent on import">
              Recruiters confirm they hold the necessary consent before uploading candidate CVs.
            </Item>
          </Section>

          {/* 3 — Candidate Rights */}
          <Section id="candidate-rights" icon="👤" title="Candidate Rights">
            <Item label="Right to erasure (Art. 17 GDPR)">
              Candidates may request permanent deletion of their profile, applications, uploaded CVs, and all associated data at any time. This is enforced via a self-service "Delete my account" function in the candidate dashboard, which triggers a full cascade deletion including Storage files and the authentication record.
            </Item>
            <Item label="Data portability">
              Candidates can export their profile data on request.
            </Item>
            <Item label="No third-party sharing">
              Candidate data is never passed to employers beyond what the candidate explicitly applies with.
            </Item>
          </Section>

          {/* 4 — B2B Trust Statements */}
          <Section id="b2b" icon="🏢" title="B2B Trust Statements">
            <p className="mb-3">
              The following statements can be included verbatim in B2B proposals, RFPs, and sales presentations:
            </p>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-5 space-y-4">
              <p className="font-semibold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-widest">
                JobConnect AI — Security &amp; Data Protection Summary
              </p>
              <NumItem n={1} label="Tenant isolation">
                Each client's data is strictly isolated via Row-Level Security. No cross-client data access is possible at the database level.
              </NumItem>
              <NumItem n={2} label="Encrypted everywhere">
                Data in transit (TLS/HTTPS) and at rest (AES-256) at all times.
              </NumItem>
              <NumItem n={3} label="GDPR-aligned">
                Data minimisation, purpose limitation, and candidate right to erasure are built into the platform, not bolted on.
              </NumItem>
              <NumItem n={4} label="No data monetisation">
                Candidate profiles and CV data are never sold, shared, or used for any purpose other than the recruitment process.
              </NumItem>
              <NumItem n={5} label="Hosted on enterprise-grade infrastructure">
                Vercel (SOC 2 Type II) and Supabase (SOC 2 Type II, ISO 27001 in progress).
              </NumItem>
            </div>
          </Section>

          {/* Contact */}
          <div className="rounded-xl border border-cyan-200 dark:border-cyan-800/50 bg-cyan-50 dark:bg-cyan-900/10 p-5 text-sm text-slate-600 dark:text-slate-400">
            <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Security questionnaires & DPA requests</p>
            <p>
              For security questionnaires or Data Processing Agreement requests,{' '}
              <Link href="/contact" className="text-cyan-600 dark:text-cyan-400 hover:underline font-medium">
                contact us via the app
              </Link>
              .
            </p>
          </div>

        </div>
      </div>
    </main>
  )
}
