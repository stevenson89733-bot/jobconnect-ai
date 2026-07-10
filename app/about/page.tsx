function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">{title}</h2>
      <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{children}</div>
    </div>
  )
}

export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">About JobConnect AI</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">AI-powered remote job platform connecting top candidates with leading companies worldwide.</p>
      </div>

      <div className="card space-y-2">
        <Section title="Our mission">
          <p>
            Remote hiring is still harder than it should be — candidates spend hours reformatting
            resumes for every application, and employers dig through profiles that don&apos;t tell
            them what they need to know. JobConnect AI exists to close that gap: helping candidates
            put their best foot forward with AI-assisted tools, and giving employers a clear, honest
            view of who they&apos;re hiring, remotely, from anywhere.
          </p>
        </Section>

        <Section title="What we do">
          <p>
            Candidates can browse remote job listings, build a real profile — skills, experience,
            location, availability — and use AI tools to draft a tailored resume or cover letter for
            a specific role in seconds. Employers get a straightforward way to post jobs and browse
            candidate profiles without wading through noise, while candidates keep control over what
            stays private (like their email and phone number).
          </p>
        </Section>

        <Section title="Where we are today">
          <p>
            JobConnect AI is early — we&apos;re building it in the open, one feature at a time, and
            actively shaping it based on what actually works rather than chasing a polished-looking
            launch. If something feels rough around the edges, that&apos;s because it&apos;s a young
            product, not a finished one.
          </p>
        </Section>

        <Section title="Who's behind it">
          <p>
            JobConnect AI is built by a solo founder/developer, end to end — product, design, and
            engineering. That means decisions get made quickly, but it also means we&apos;re a small
            team of one for now. If you run into something that doesn&apos;t work, or have an idea
            for what would make this more useful to you, reaching out actually reaches someone.
          </p>
        </Section>

        <Section title="Get in touch">
          <p>
            Questions, feedback, or just want to say hello? Visit our Contact page — we read
            everything.
          </p>
        </Section>
      </div>
    </div>
  )
}
