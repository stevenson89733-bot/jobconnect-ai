import Link from 'next/link'
import HeroSearch from '@/components/HeroSearch'

const TRUSTED_COMPANIES = [
  { name: 'Anthropic', logo: '🤖' },
  { name: 'Vercel', logo: '▲' },
  { name: 'Linear', logo: '◆' },
  { name: 'Stripe', logo: 'S' },
  { name: 'Notion', logo: 'N' },
  { name: 'Figma', logo: 'F' },
]

const FEATURED_JOBS = [
  { title: 'Senior AI Engineer', company: 'Anthropic', location: 'Remote · USA', salary: '$180k–$240k', type: 'Full-time', tags: ['Python', 'ML', 'LLMs'] },
  { title: 'Staff Frontend Engineer', company: 'Vercel', location: 'Remote · Worldwide', salary: '$160k–$200k', type: 'Full-time', tags: ['React', 'Next.js', 'TypeScript'] },
  { title: 'Product Designer', company: 'Figma', location: 'Remote · US/EU', salary: '$140k–$180k', type: 'Full-time', tags: ['Figma', 'Design Systems', 'UX'] },
  { title: 'Backend Engineer', company: 'Linear', location: 'Remote · Worldwide', salary: '$150k–$190k', type: 'Full-time', tags: ['TypeScript', 'PostgreSQL', 'Go'] },
  { title: 'Growth Engineer', company: 'Stripe', location: 'Remote · USA', salary: '$155k–$195k', type: 'Full-time', tags: ['SQL', 'Python', 'A/B Testing'] },
  { title: 'DevRel Engineer', company: 'Notion', location: 'Remote · Worldwide', salary: '$130k–$160k', type: 'Contract', tags: ['APIs', 'Developer Docs', 'Community'] },
]

const STATS = [
  { value: '50K+', label: 'Remote Jobs' },
  { value: '12K+', label: 'Companies Hiring' },
  { value: '2.4M+', label: 'Candidates Placed' },
  { value: '94%', label: 'Match Accuracy' },
]

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Gradient blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute top-[100px] right-[-100px] w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white dark:bg-card border border-slate-200 dark:border-slate-700 rounded-full px-4 py-1.5 text-sm text-slate-600 dark:text-slate-400 mb-8">
            <span className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400 animate-pulse" />
            <span>AI-Powered Matching · 50,000+ Remote Jobs Available</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight mb-6">
            Find Your Next{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
              Remote Job
            </span>
            <br />
            with AI
          </h1>

          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Our AI matches your skills and experience with the best remote opportunities. Upload your resume, answer a few questions, and let AI do the heavy lifting.
          </p>

          {/* Search bar — live filtering via /jobs?q= */}
          <HeroSearch />
        </div>
      </section>

      {/* Trusted by */}
      <section className="border-y border-slate-200 dark:border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm text-slate-600 dark:text-slate-500 mb-6 uppercase tracking-widest">Trusted by teams at</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
            {TRUSTED_COMPANIES.map((c) => (
              <div key={c.name} className="flex items-center gap-2 text-slate-600 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 transition-colors">
                <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-bold">{c.logo}</span>
                <span className="font-semibold text-sm">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="card text-center">
              <div className="text-4xl font-extrabold text-primary mb-1">{s.value}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Featured Remote Jobs</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Hand-picked opportunities from top companies</p>
          </div>
          <Link href="/jobs" className="btn-outline text-sm hidden sm:flex">View all jobs →</Link>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {FEATURED_JOBS.map((job) => (
            <Link key={job.title + job.company} href="/jobs" className="card hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all group cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-lg font-bold text-slate-700 dark:text-slate-300">
                  {job.company[0]}
                </div>
                <span className={`badge ${job.type === 'Full-time' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400'}`}>
                  {job.type}
                </span>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors mb-1">{job.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{job.company}</p>
              <p className="text-xs text-slate-600 dark:text-slate-500 mb-4">{job.location}</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {job.tags.map((tag) => (
                  <span key={tag} className="badge bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-400">{tag}</span>
                ))}
              </div>
              <p className="text-sm font-semibold text-orange-700 dark:text-accent">{job.salary}</p>
            </Link>
          ))}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link href="/jobs" className="btn-outline">View all jobs →</Link>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 dark:bg-card border-y border-slate-200 dark:border-slate-800 py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">How JobConnect AI Works</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-14 max-w-xl mx-auto">Three steps to your next remote role</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: '📄', title: 'Upload Your Resume', desc: 'Our AI parses your resume and builds a comprehensive skills profile instantly.' },
              { step: '02', icon: '🤖', title: 'AI Matches You', desc: 'We surface the jobs that best fit your skills, experience level, and preferences.' },
              { step: '03', icon: '🚀', title: 'Apply in One Click', desc: 'Apply to multiple roles at once with your AI-optimized profile and cover letter.' },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="text-6xl mb-4">{item.icon}</div>
                <div className="text-xs font-mono text-primary mb-2">{item.step}</div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Ready to land your dream remote job?</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">Join 2.4 million candidates who found their next role through JobConnect AI.</p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link href="/register?role=candidate" className="btn-primary text-base px-8 py-3">Start as Candidate</Link>
          <Link href="/register?role=employer" className="btn-outline text-base px-8 py-3">Hire with AI</Link>
        </div>
      </section>
    </>
  )
}
