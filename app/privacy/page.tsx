import Link from 'next/link'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">{title}</h2>
      <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{children}</div>
    </div>
  )
}

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">Privacy Policy</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">Last updated: July 2026</p>
      </div>

      <div className="mb-8 p-4 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-800/50 text-sm text-yellow-800 dark:text-yellow-400">
        <strong>Draft — not yet legally reviewed.</strong> This page describes our current data
        practices in plain language, but has not yet been finalized with legal counsel. It will be
        reviewed and finalized before public launch.
      </div>

      <div className="card space-y-2">
        <Section title="Overview">
          <p>
            JobConnect AI is a remote job platform that connects candidates with employers using
            AI-assisted tools. This policy explains what information we collect, how it&apos;s used,
            and who can see it.
          </p>
        </Section>

        <Section title="Information we collect">
          <p><strong className="text-slate-900 dark:text-white">Account information:</strong> your email address and password (used only for authentication), and whether you signed up as a candidate or an employer.</p>
          <p><strong className="text-slate-900 dark:text-white">Candidate profile:</strong> full name, professional title, bio, work experience, skills, education, location, years of experience, availability, work preference, LinkedIn/GitHub/portfolio links, and a profile photo, if you choose to add them.</p>
          <p><strong className="text-slate-900 dark:text-white">Phone number:</strong> optional, and kept private — it is never shown to employers or other users.</p>
          <p><strong className="text-slate-900 dark:text-white">Applications:</strong> the jobs you apply to and any message you include are shared with the employer who posted that job.</p>
          <p><strong className="text-slate-900 dark:text-white">Employer information:</strong> company name and job postings, if you have an employer account.</p>
          <p><strong className="text-slate-900 dark:text-white">Payment information:</strong> if you subscribe to Premium, payments are processed by Stripe. We do not store your card details.</p>
        </Section>

        <Section title="AI-powered tools">
          <p>
            The AI Resume Builder and AI Cover Letter Generator send the information you enter into
            those tools (target role, experience, skills, etc.) to a third-party AI provider to
            generate content — OpenAI for Premium accounts, or Mistral AI for free accounts. This
            data is used only to generate your requested content and is not used to train these
            providers&apos; models on our behalf.
          </p>
        </Section>

        <Section title="Who can see your information">
          <p>
            Employers with an account can view your candidate profile — name, title, bio, skills,
            experience, education, location, links, photo, availability, and years of experience.
            <strong className="text-slate-900 dark:text-white"> Your email and phone number are never shown to employers.</strong> An
            employer only sees your application message if you apply to one of their job postings.
          </p>
          <p>
            Your profile photo, if you upload one, is stored in cloud storage that is reachable via
            a direct link — treat it like any other public profile picture, and avoid uploading
            anything you wouldn&apos;t want to be publicly viewable.
          </p>
        </Section>

        <Section title="Data storage and security">
          <p>
            Your data is stored with Supabase, our database and infrastructure provider, and is
            protected by row-level access rules that restrict most information to your own account
            unless explicitly shared as described above (e.g. with an employer you applied to).
          </p>
        </Section>

        <Section title="Your rights">
          <p>
            You can review and update most of your information at any time from your{' '}
            <Link href="/profile" className="text-primary dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 underline underline-offset-2">profile settings</Link>.
            To request a copy of your data or to delete your account, contact us using the details
            below.
          </p>
        </Section>

        <Section title="Changes to this policy">
          <p>
            We may update this policy as JobConnect AI evolves. Material changes will be reflected
            by updating the date at the top of this page.
          </p>
        </Section>

        <Section title="Contact us">
          <p>
            Questions about this policy or your data? Reach out via our{' '}
            <Link href="/contact" className="text-primary dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 underline underline-offset-2">Contact page</Link>.
          </p>
        </Section>
      </div>
    </div>
  )
}
