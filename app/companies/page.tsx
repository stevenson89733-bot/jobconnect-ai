import Link from 'next/link'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">{title}</h2>
      <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{children}</div>
    </div>
  )
}

export default function Companies() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">For Companies</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">Hire remote talent with a clear, honest view of who you&apos;re bringing on.</p>
      </div>

      <div className="card space-y-2">
        <Section title="Post jobs, browse real profiles">
          <p>
            Create an employer account to post remote job listings and browse candidate profiles —
            skills, experience, education, location, availability, and links to their work. No
            noise, no filler: just what candidates have chosen to share about themselves.
          </p>
        </Section>

        <Section title="Candidate privacy, by design">
          <p>
            A candidate&apos;s email address and phone number are never shown to employers. When you
            want to reach someone, you do it through the application they&apos;ve submitted to your job
            posting — their contact details stay theirs to control.
          </p>
        </Section>

        <Section title="Where we are today">
          <p>
            JobConnect AI is a young, actively developed product — not a large, established
            platform. That also means feedback goes directly to the person building it, and changes
            based on what employers actually need happen fast, not after months of process.
          </p>
        </Section>

        <div className="pt-2">
          <Link
            href="/register?role=employer"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-blue-600 transition-colors"
          >
            Post a Job
          </Link>
        </div>
      </div>
    </div>
  )
}
