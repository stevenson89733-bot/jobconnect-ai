import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'How It Works — JobConnect AI Methodology',
  description:
    'Understand how JobConnect AI calculates match scores, detects cross-border eligibility, sources its job database, and defines its platform statistics.',
}

function Section({
  icon,
  title,
  children,
}: {
  icon: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{icon}</span>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
      </div>
      <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        {children}
      </div>
    </section>
  )
}

function Pill({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
      <span className="text-[13px] font-semibold text-slate-900 dark:text-white whitespace-nowrap">{label}</span>
      <span className="text-[13px] text-slate-500 dark:text-slate-400">{sub}</span>
    </div>
  )
}

export default function MethodologyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">

      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#57C7E3' }}>Transparency</p>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">How JobConnect AI Works</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xl">
          Every score, signal, and statistic on this platform has a real definition. This page explains exactly how we calculate them — no black boxes.
        </p>
      </div>

      {/* 1. Match Score */}
      <Section icon="🎯" title="How We Calculate Match Score">
        <p>
          Each job listing is given a <strong>Match Score from 0 to 100</strong> relative to your candidate profile. The score reflects how well the role fits you — not just on title, but across five weighted dimensions:
        </p>
        <div className="space-y-2 mt-2">
          <Pill label="Skills alignment" sub="How much overlap exists between your listed skills and the skills the job description explicitly or implicitly requires." />
          <Pill label="Location & timezone compatibility" sub="Whether your location and working hours are compatible with the role's timezone restrictions, if any are stated." />
          <Pill label="Cross-border eligibility signals" sub="Whether the job description contains work-authorization requirements, residency restrictions, or payroll limitations that would apply to you." />
          <Pill label="Language match" sub="Whether your profile language and the job's required language(s) are aligned." />
          <Pill label="Experience level fit" sub="Whether your stated years of experience and seniority level match the role's expectations." />
        </div>
        <p className="mt-3">
          Match Scores are computed using <strong>OpenAI language models</strong> that analyze both the job description and your profile in full context — not just keyword matching. A score of 80+ indicates a strong fit. Scores below 50 are surfaced only when no better matches are available for your search.
        </p>
      </Section>

      {/* Divider */}
      <hr className="border-slate-200 dark:border-slate-800 mb-10" />

      {/* 2. Cross-Border Eligibility */}
      <Section icon="🌍" title="How We Detect Cross-Border Eligibility">
        <p>
          Not every &ldquo;remote&rdquo; job is truly open to international candidates. Our <strong>Remote-Friendly Detector</strong> reads each job description and flags roles that include restrictive language that disqualifies cross-border applicants.
        </p>
        <p>We scan for four categories of restriction:</p>
        <div className="space-y-2 mt-2">
          <Pill label="Work authorization requirements" sub='Phrases like "must have US work authorization", "EU citizen only", or "right to work in UK required".' />
          <Pill label="Timezone restrictions" sub='Hard constraints like "must work US Eastern hours" or "must overlap at least 4h with CET" that may exclude certain regions.' />
          <Pill label="Residency clauses" sub='Requirements to be physically present in a specific country, state, or city — even for a "remote" role.' />
          <Pill label="Payroll limitations" sub='Mentions of US-only payroll, W-2 employment, or restrictions on contractor arrangements that affect non-resident applicants.' />
        </div>
        <p className="mt-3">
          Jobs that pass all four checks are labeled <strong>Cross-Border Eligible</strong>. Jobs with partial restrictions are labeled <strong>Restricted</strong> with an explanation. This classification is a signal, not a legal guarantee — always verify eligibility directly with the employer.
        </p>
      </Section>

      <hr className="border-slate-200 dark:border-slate-800 mb-10" />

      {/* 3. Job Database */}
      <Section icon="🗄️" title="Our Job Database">
        <p>
          JobConnect AI aggregates listings from <strong>four verified job data sources</strong>:
        </p>
        <div className="space-y-2 mt-2">
          <Pill label="Adzuna" sub="Global job aggregator covering 16+ countries with direct employer postings and structured salary data." />
          <Pill label="We Work Remotely" sub="Curated remote-first job board used by distributed companies worldwide." />
          <Pill label="Himalayas" sub="Remote job board focused on fully remote, async-friendly roles at modern companies." />
          <Pill label="Jobicy" sub="Free remote job board with international listings across tech, marketing, and operations." />
        </div>
        <p className="mt-3">
          The database is <strong>refreshed every 6 hours</strong>. Duplicate listings (same role, same company, sourced from multiple providers) are removed automatically using title + company + description fingerprinting. Expired listings are removed within 24 hours of the source removing them.
        </p>
      </Section>

      <hr className="border-slate-200 dark:border-slate-800 mb-10" />

      {/* 4. Our Numbers */}
      <Section icon="📊" title="Our Numbers — What They Actually Mean">
        <p>We surface three headline stats across the platform. Here is exactly how each one is defined:</p>

        <div className="space-y-4 mt-4">
          <div className="rounded-xl p-5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">969+ daily matches</div>
            <p className="text-[13px] text-slate-600 dark:text-slate-400">
              The number of live jobs in our database that match at least one active candidate profile on any given day. This is not the total number of jobs in the database — it is the subset that generated at least one match above our minimum relevance threshold. The number is recalculated every 6 hours alongside the job refresh.
            </p>
          </div>
          <div className="rounded-xl p-5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">63 countries</div>
            <p className="text-[13px] text-slate-600 dark:text-slate-400">
              The number of distinct countries represented in registered candidate profiles. This reflects where our users are based — not the number of countries where jobs are available (which is broader).
            </p>
          </div>
          <div className="rounded-xl p-5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">11 languages</div>
            <p className="text-[13px] text-slate-600 dark:text-slate-400">
              The number of languages in which the JobConnect AI interface and content are fully translated: English, French, Spanish, Haitian Creole, German, Portuguese, Vietnamese, Chinese (Simplified), Japanese, Korean, and Arabic. Job listings themselves are not translated — they appear in the language posted by the employer.
            </p>
          </div>
        </div>
      </Section>

      {/* Footer note */}
      <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[13px] text-slate-500 dark:text-slate-400">
        Questions about our methodology?{' '}
        <Link href="/contact" className="underline hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
          Contact us
        </Link>{' '}
        — we are happy to go into more detail.
      </div>
    </div>
  )
}
