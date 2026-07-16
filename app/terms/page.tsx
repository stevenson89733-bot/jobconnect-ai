import Link from 'next/link'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">{title}</h2>
      <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{children}</div>
    </div>
  )
}

export default function TermsOfService() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">Terms of Service</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">Last updated: July 2026</p>
      </div>

      <div className="mb-8 p-4 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-800/50 text-sm text-yellow-800 dark:text-yellow-400">
        <strong>Draft — not yet legally reviewed.</strong> These terms describe our current
        practices in plain language, but have not yet been finalized with legal counsel. They will
        be reviewed and finalized before public launch.
      </div>

      <div className="card space-y-2">
        <Section title="Acceptance of terms">
          <p>
            By creating an account or using JobConnect AI, you agree to these terms. If you don&apos;t
            agree, please don&apos;t use the service.
          </p>
        </Section>

        <Section title="Description of service">
          <p>
            JobConnect AI is a remote job platform connecting candidates and employers, with
            AI-assisted tools for resume building, cover letter generation, and candidate discovery.
          </p>
        </Section>

        <Section title="Accounts">
          <p>
            You choose a candidate or employer account when you sign up. You&apos;re responsible for
            keeping your login credentials secure and for the accuracy of the information you
            provide — including your profile details and, for employers, your job postings.
          </p>
        </Section>

        <Section title="Candidate features">
          <p>
            Candidates can browse and apply to job postings, and use the AI Resume Builder and AI
            Cover Letter Generator to help draft application materials.
          </p>
        </Section>

        <Section title="Employer features">
          <p>
            Employers can post jobs and browse candidate profiles. Employers only see the
            professional information a candidate has chosen to add to their profile — never a
            candidate&apos;s email address or phone number.
          </p>
        </Section>

        <Section title="Premium subscription">
          <p>
            The Premium plan ($19/month) unlocks the AI Resume Builder and AI Cover Letter
            Generator with GPT-4o, and is billed through Stripe. You can cancel anytime; access
            continues until the end of the current billing period.
          </p>
        </Section>

        <Section title="AI-generated content">
          <p>
            Content produced by the AI Resume Builder and AI Cover Letter Generator is generated
            automatically and provided as a starting point. You&apos;re responsible for reviewing it
            for accuracy before using it in a real application — we don&apos;t guarantee the accuracy
            of AI-generated content or any job outcome.
          </p>
        </Section>

        <Section title="Acceptable use">
          <p>
            Don&apos;t use JobConnect AI to post fraudulent or discriminatory job listings, submit
            false information, spam other users, or attempt to scrape or misuse other users&apos; data.
          </p>
        </Section>

        <Section title="Your content">
          <p>
            You retain ownership of the profile information, applications, and job postings you
            submit. By using the service, you grant JobConnect AI the license needed to display
            that content to the other party it&apos;s intended for (e.g. showing your candidate
            profile to employers, or your job posting to candidates).
          </p>
        </Section>

        <Section title="Termination">
          <p>
            You may stop using JobConnect AI and request account deletion at any time. We may
            suspend or terminate accounts that violate these terms.
          </p>
        </Section>

        <Section title="Disclaimers and limitation of liability">
          <p>
            JobConnect AI is provided &quot;as is,&quot; without warranties of any kind. We&apos;re not liable
            for hiring decisions, job outcomes, or the accuracy of AI-generated or user-submitted
            content.
          </p>
        </Section>

        <Section title="Governing law">
          <p className="italic text-slate-600 dark:text-slate-400">
            [Governing law and jurisdiction to be specified by JobConnect AI.]
          </p>
        </Section>

        <Section title="Changes to these terms">
          <p>
            We may update these terms as JobConnect AI evolves. Material changes will be reflected
            by updating the date at the top of this page.
          </p>
        </Section>

        <Section title="Contact us">
          <p>
            Questions about these terms? Reach out via our{' '}
            <Link href="/contact" className="text-primary dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 underline underline-offset-2">Contact page</Link>.
          </p>
        </Section>
      </div>
    </div>
  )
}
