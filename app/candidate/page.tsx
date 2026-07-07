import Link from 'next/link'

const METRICS = [
  { label: 'Applications Sent', value: '24', delta: '+3 this week', icon: '📤', color: 'text-primary' },
  { label: 'Profile Views', value: '142', delta: '+18% this month', icon: '👁', color: 'text-green-600 dark:text-green-400' },
  { label: 'AI Match Score', value: '94%', delta: 'Top 5% of candidates', icon: '🤖', color: 'text-orange-600 dark:text-accent' },
  { label: 'Interviews Scheduled', value: '3', delta: '2 this week', icon: '📅', color: 'text-purple-600 dark:text-purple-400' },
]

const RECENT_APPLICATIONS = [
  { company: 'Anthropic', role: 'Senior AI Engineer', status: 'Interview', date: 'Jun 28', statusColor: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' },
  { company: 'Vercel', role: 'Staff Frontend Engineer', status: 'Applied', date: 'Jun 25', statusColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' },
  { company: 'Linear', role: 'Backend Engineer', status: 'Viewed', date: 'Jun 22', statusColor: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400' },
  { company: 'Stripe', role: 'Growth Engineer', status: 'Applied', date: 'Jun 20', statusColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' },
  { company: 'Notion', role: 'DevRel Engineer', status: 'Rejected', date: 'Jun 15', statusColor: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' },
]

const AI_MATCHES = [
  { company: 'Figma', role: 'Senior Product Engineer', match: 97, salary: '$170k–$210k', location: 'Remote · US' },
  { company: 'Vercel', role: 'Developer Experience', match: 93, salary: '$160k–$190k', location: 'Remote · Worldwide' },
  { company: 'Anthropic', role: 'ML Safety Engineer', match: 91, salary: '$190k–$250k', location: 'Remote · USA' },
]

const SKILLS = [
  { name: 'TypeScript', level: 95 },
  { name: 'React', level: 90 },
  { name: 'Node.js', level: 82 },
  { name: 'PostgreSQL', level: 75 },
  { name: 'Python', level: 68 },
]

export default function CandidateDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white text-xl font-bold">
            JD
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back, Jane 👋</h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Your career snapshot · Updated just now</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href="/jobs" className="btn-outline text-sm">Browse Jobs</Link>
          <Link href="/profile" className="btn-primary text-sm">Edit Profile</Link>
        </div>
      </div>

      {/* AI Tools */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          <span className="text-orange-600 dark:text-accent">✦</span> AI Tools
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/ai-tools/resume-builder" className="card hover:border-primary/50 transition-all group flex items-start gap-4">
            <div className="text-3xl">📄</div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors mb-0.5">AI Resume Builder</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Generate an ATS-optimized resume with GPT-4o and a resume score.</p>
            </div>
          </Link>
          <Link href="/ai-tools/cover-letter" className="card hover:border-accent/50 transition-all group flex items-start gap-4">
            <div className="text-3xl">✉️</div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-accent transition-colors mb-0.5">AI Cover Letter</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Write a personalized cover letter tailored to any company and role.</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {METRICS.map((m) => (
          <div key={m.label} className="card">
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{m.icon}</span>
              <span className="text-xs text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">{m.delta}</span>
            </div>
            <div className={`text-3xl font-extrabold ${m.color} mb-1`}>{m.value}</div>
            <div className="text-xs text-slate-600 dark:text-slate-500">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="grid xl:grid-cols-3 gap-6 mb-6">
        {/* Applications table */}
        <div className="xl:col-span-2 card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-900 dark:text-white">Recent Applications</h2>
            <Link href="/applications" className="text-xs text-primary hover:text-blue-500 dark:hover:text-blue-400">View all →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-600 dark:text-slate-500 border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left pb-3 font-medium">Company</th>
                  <th className="text-left pb-3 font-medium">Role</th>
                  <th className="text-left pb-3 font-medium">Status</th>
                  <th className="text-left pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {RECENT_APPLICATIONS.map((app) => (
                  <tr key={app.company + app.role} className="hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 font-medium text-slate-800 dark:text-slate-200">{app.company}</td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">{app.role}</td>
                    <td className="py-3">
                      <span className={`badge ${app.statusColor}`}>{app.status}</span>
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-500">{app.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Skills */}
        <div className="card">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-5">Skill Strength</h2>
          <div className="space-y-4">
            {SKILLS.map((skill) => (
              <div key={skill.name}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-700 dark:text-slate-300">{skill.name}</span>
                  <span className="text-slate-600 dark:text-slate-500">{skill.level}%</span>
                </div>
                <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <Link href="/profile#skills" className="mt-5 block text-center text-xs text-primary hover:text-blue-500 dark:hover:text-blue-400">
            Update skills →
          </Link>
        </div>
      </div>

      {/* AI Matches */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">AI-Matched Jobs for You</h2>
            <p className="text-xs text-slate-600 dark:text-slate-500 mt-0.5">Based on your profile and preferences</p>
          </div>
          <Link href="/jobs" className="text-xs text-primary hover:text-blue-500 dark:hover:text-blue-400">See all matches →</Link>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {AI_MATCHES.map((job) => (
            <div key={job.role} className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="w-9 h-9 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-700 dark:text-slate-300">
                  {job.company[0]}
                </div>
                <div className="flex items-center gap-1 bg-primary/10 dark:bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs font-semibold">
                  <span>🤖</span> {job.match}% match
                </div>
              </div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white mt-3 mb-0.5">{job.role}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-0.5">{job.company}</p>
              <p className="text-xs text-slate-600 dark:text-slate-500 mb-3">{job.location}</p>
              <p className="text-xs font-semibold text-orange-700 dark:text-accent mb-3">{job.salary}</p>
              <button className="w-full text-xs btn-primary py-2">Apply Now</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
