import Link from 'next/link'

type Profile = Record<string, string | null>

function Section({ title, value }: { title: string; value: string | null }) {
  if (!value || !value.trim()) return null
  return (
    <div>
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">{title}</h2>
      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{value.trim()}</p>
    </div>
  )
}

export default function PublicProfileView({ profile }: { profile: Profile }) {
  const name = profile.full_name?.trim() || 'Candidate'
  const initial = name.charAt(0).toUpperCase()

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-500 mb-6">
        <Link href="/recruiter" className="hover:text-slate-900 dark:hover:text-white transition-colors">Employer Dashboard</Link>
        <span>/</span>
        <span className="text-slate-700 dark:text-slate-300">Candidate Profile</span>
      </div>

      {/* Header card */}
      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white text-2xl font-bold shrink-0">
            {initial}
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white truncate">{name}</h1>
            {profile.title?.trim() && (
              <p className="text-slate-600 dark:text-slate-400">{profile.title.trim()}</p>
            )}
            {profile.location?.trim() && (
              <p className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-500 mt-0.5">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {profile.location.trim()}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <Section title="Bio" value={profile.bio} />
          <Section title="Experience" value={profile.experience} />
          <Section title="Skills" value={profile.skills} />
          <Section title="Education" value={profile.education} />

          {(profile.linkedin_url?.trim() || profile.github_url?.trim()) && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Links</h2>
              <div className="flex flex-wrap gap-3">
                {profile.linkedin_url?.trim() && (
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-primary hover:text-blue-500 dark:hover:text-blue-400 underline underline-offset-2 break-all">
                    LinkedIn
                  </a>
                )}
                {profile.github_url?.trim() && (
                  <a href={profile.github_url} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-primary hover:text-blue-500 dark:hover:text-blue-400 underline underline-offset-2 break-all">
                    GitHub
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
