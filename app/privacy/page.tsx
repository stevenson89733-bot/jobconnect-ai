import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — JobConnect AI',
  description: 'How JobConnect AI collects, uses, and protects your personal data. GDPR-compliant privacy policy by SJL Technologies LLC.',
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{title}</h2>
      <div className="space-y-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
        {children}
      </div>
    </section>
  )
}

function Item({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <span className="mt-0.5 text-cyan-500 shrink-0">▸</span>
      <p>{children}</p>
    </div>
  )
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#0c1830]">
      <div className="max-w-3xl mx-auto px-6 py-16 sm:py-24">

        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-500 mb-3">SJL Technologies LLC</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Last updated: October 2026</p>
        </div>

        {/* Jump links */}
        <nav aria-label="Page sections" className="mb-12 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {[
              ['#intro', 'Introduction'],
              ['#data-collected', 'Data Collected'],
              ['#purpose', 'Purpose'],
              ['#legal-basis', 'Legal Basis'],
              ['#retention', 'Retention'],
              ['#rights', 'Your Rights'],
              ['#security', 'Security'],
              ['#cookies', 'Cookies'],
              ['#contact', 'Contact'],
            ].map(([href, label]) => (
              <li key={href}>
                <a href={href} className="text-cyan-600 dark:text-cyan-400 hover:underline">{label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-12">

          {/* 1. Introduction */}
          <Section id="intro" title="1. Introduction">
            <p>
              JobConnect AI is a product of <span className="font-semibold text-slate-700 dark:text-slate-300">SJL Technologies LLC</span>, a limited liability company incorporated in Wyoming, United States of America. We operate the platform at{' '}
              <span className="font-medium">jobconnect-ai.com</span>.
            </p>
            <p>
              This Privacy Policy explains how we collect, use, store, and protect your personal data when you use our platform. By using JobConnect AI, you agree to the practices described here.
            </p>
            <p>
              This document may be provided in several languages for convenience. In the event of any conflict between the English version and a translated version, the English version prevails.
            </p>
          </Section>

          {/* 2. Data Collected */}
          <Section id="data-collected" title="2. Data We Collect">
            <p className="font-semibold text-slate-700 dark:text-slate-300">Candidate data:</p>
            <Item>Name, email address, location, work preferences, and account credentials</Item>
            <Item>CV / résumé, work history, skills, education, and cover letters</Item>
            <Item>Job applications submitted through the platform</Item>
            <Item>Profile photo (optional) and LinkedIn / GitHub profile links</Item>

            <p className="font-semibold text-slate-700 dark:text-slate-300 pt-2">Employer / recruiter data:</p>
            <Item>Company name, contact email, job postings, and billing details</Item>
            <Item>Candidate contacts imported via CSV (only with confirmed consent)</Item>

            <p className="font-semibold text-slate-700 dark:text-slate-300 pt-2">Technical data:</p>
            <Item>IP address, browser type, device identifiers, and usage telemetry (Vercel Analytics)</Item>
            <Item>Session tokens managed by Supabase Auth</Item>
          </Section>

          {/* 3. Purpose */}
          <Section id="purpose" title="3. Purpose of Processing">
            <Item>AI-powered job matching between candidates and employers</Item>
            <Item>Executing automated job applications (Auto-Apply) when explicitly authorised by the candidate</Item>
            <Item>Providing AI career tools: CV builder, cover letter generator, interview prep</Item>
            <Item>Processing payments and preventing fraud (via Stripe)</Item>
            <Item>Sending service notifications and support responses</Item>
            <p className="mt-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/40 font-medium text-emerald-700 dark:text-emerald-400">
              We do <strong>not</strong> sell, rent, or share your personal data with third parties. We do <strong>not</strong> use your data to train AI models.
            </p>
          </Section>

          {/* 4. Legal Basis */}
          <Section id="legal-basis" title="4. Legal Basis (GDPR Art. 6)">
            <Item>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Consent (Art. 6(1)(a))</span> — for optional features such as Auto-Apply and marketing communications. You may withdraw consent at any time.
            </Item>
            <Item>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Contract performance (Art. 6(1)(b))</span> — processing necessary to provide the platform services you signed up for.
            </Item>
            <Item>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Legitimate interest (Art. 6(1)(f))</span> — security monitoring, fraud prevention, and platform analytics.
            </Item>
          </Section>

          {/* 5. Retention */}
          <Section id="retention" title="5. Data Retention">
            <Item>Active accounts: data retained for the duration of your subscription or active use.</Item>
            <Item>Inactive accounts: profiles and associated data are scheduled for deletion after <span className="font-semibold text-slate-700 dark:text-slate-300">12 months of inactivity</span> (feature in progress).</Item>
            <Item>Account deletion: all data is permanently deleted within 30 days of account closure, including CV files and authentication records.</Item>
            <Item>Legal obligations may require us to retain certain billing records for up to 7 years.</Item>
          </Section>

          {/* 6. Rights */}
          <Section id="rights" title="6. Your Rights">
            <p>Under GDPR (EU/UK) and similar laws (CCPA for California residents), you have the right to:</p>
            <Item><span className="font-semibold text-slate-700 dark:text-slate-300">Access</span> — request a copy of the personal data we hold about you.</Item>
            <Item><span className="font-semibold text-slate-700 dark:text-slate-300">Rectification</span> — correct inaccurate or incomplete data via your profile settings.</Item>
            <Item>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Erasure (Right to be Forgotten)</span> — permanently delete your account and all associated data using the self-service{' '}
              <Link href="/profile" className="text-cyan-600 dark:text-cyan-400 hover:underline">
                Delete my account
              </Link>{' '}
              feature in your candidate dashboard, which triggers a full cascade deletion.
            </Item>
            <Item><span className="font-semibold text-slate-700 dark:text-slate-300">Data portability</span> — export your profile data on request.</Item>
            <Item><span className="font-semibold text-slate-700 dark:text-slate-300">Object to processing</span> — opt out of non-essential processing at any time.</Item>
            <Item><span className="font-semibold text-slate-700 dark:text-slate-300">Withdraw consent</span> — for any feature based on consent (e.g. Auto-Apply), without affecting prior processing.</Item>
            <p className="pt-1">
              To exercise any of these rights,{' '}
              <Link href="/contact" className="text-cyan-600 dark:text-cyan-400 hover:underline font-medium">
                contact us via the platform
              </Link>
              .
            </p>
          </Section>

          {/* 7. Security */}
          <Section id="security" title="7. Security">
            <Item><span className="font-semibold text-slate-700 dark:text-slate-300">HTTPS / TLS in transit</span> — all data between your browser and our servers is encrypted end-to-end.</Item>
            <Item><span className="font-semibold text-slate-700 dark:text-slate-300">AES-256 at rest</span> — all data stored in our PostgreSQL database (Supabase) is encrypted at rest.</Item>
            <Item><span className="font-semibold text-slate-700 dark:text-slate-300">Row-Level Security (RLS)</span> — Supabase RLS policies enforce strict tenant isolation. No cross-client data access is possible at the database level.</Item>
            <Item><span className="font-semibold text-slate-700 dark:text-slate-300">Enterprise infrastructure</span> — hosted on Vercel (SOC 2 Type II) and Supabase (SOC 2 Type II).</Item>
            <p className="pt-1">
              For more details, see our{' '}
              <Link href="/security" className="text-cyan-600 dark:text-cyan-400 hover:underline">
                Security & Compliance
              </Link>{' '}
              page.
            </p>
          </Section>

          {/* 8. Cookies */}
          <Section id="cookies" title="8. Cookies">
            <p>We use only essential cookies necessary to operate the platform:</p>
            <Item><span className="font-semibold text-slate-700 dark:text-slate-300">Authentication cookies</span> — managed by Supabase Auth to maintain your session.</Item>
            <Item><span className="font-semibold text-slate-700 dark:text-slate-300">Analytics</span> — Vercel Analytics collects anonymised usage data (page views, performance) with no personally identifiable information.</Item>
            <p>We do not use third-party advertising cookies or cross-site tracking cookies.</p>
          </Section>

          {/* 9. Contact */}
          <Section id="contact" title="9. Contact & DPA Requests">
            <p>
              For privacy inquiries, data subject requests, or Data Processing Agreement (DPA) requests,{' '}
              <Link href="/contact" className="text-cyan-600 dark:text-cyan-400 hover:underline font-medium">
                contact us via the platform
              </Link>
              .
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 pt-1">
              SJL Technologies LLC · Wyoming, United States of America
            </p>
          </Section>

        </div>
      </div>
    </main>
  )
}
