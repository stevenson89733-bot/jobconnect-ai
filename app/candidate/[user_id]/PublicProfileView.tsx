import Link from 'next/link'

type Profile = Record<string, string | number | null>

function Section({ title, value }: { title: string; value: string | number | null }) {
  const text = typeof value === 'number' ? String(value) : value?.trim()
  if (!text) return null
  return (
    <div>
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">{title}</h2>
      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{text}</p>
    </div>
  )
}

export default function PublicProfileView({ profile }: { profile: Profile }) {
  const str = (key: string) => (typeof profile[key] === 'string' ? (profile[key] as string).trim() : '')

  const name = str('full_name') || 'Candidate'
  const initial = name.charAt(0).toUpperCase()
  const title = str('title')
  const location = str('location')
  const avatarUrl = str('avatar_url')
  const linkedinUrl = str('linkedin_url')
  const githubUrl = str('github_url')
  const portfolioUrl = str('portfolio_url')
  const availability = str('availability')
  const workPreference = str('work_preference')
  const yearsExperience = typeof profile.years_experience === 'number' ? profile.years_experience : null

  const hasMeta = yearsExperience != null || !!workPreference || !!availability
  const hasLinks = !!linkedinUrl || !!githubUrl || !!portfolioUrl

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
        <Link href="/recruiter" className="hover:text-slate-900 dark:hover:text-white transition-colors">Employer Dashboard</Link>
        <span>/</span>
        <span className="text-slate-700 dark:text-slate-300">Candidate Profile</span>
      </div>

      {/* Header card */}
      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white text-2xl font-bold shrink-0">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              initial
            )}
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white truncate">{name}</h1>
            {title && <p className="text-slate-600 dark:text-slate-400">{title}</p>}
            {location && (
              <p className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {location}
              </p>
            )}
          </div>
        </div>

        {hasMeta && (
          <div className="flex flex-wrap gap-2 mb-6">
            {yearsExperience != null && (
              <span className="badge bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 text-xs">
                {yearsExperience} yr{yearsExperience === 1 ? '' : 's'} experience
              </span>
            )}
            {workPreference && (
              <span className="badge bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 text-xs">
                {workPreference}
              </span>
            )}
            {availability && (
              <span className="badge bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs">
                Available: {availability}
              </span>
            )}
          </div>
        )}

        <div className="space-y-6">
          <Section title="Bio" value={profile.bio} />
          <Section title="Experience" value={profile.experience} />
          <Section title="Skills" value={profile.skills} />
          <Section title="Education" value={profile.education} />

          {hasLinks && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">Links</h2>
              <div className="flex flex-wrap gap-3">
                {linkedinUrl && (
                  <a href={linkedinUrl} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-primary dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 underline underline-offset-2 break-all">
                    LinkedIn
                  </a>
                )}
                {githubUrl && (
                  <a href={githubUrl} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-primary dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 underline underline-offset-2 break-all">
                    GitHub
                  </a>
                )}
                {portfolioUrl && (
                  <a href={portfolioUrl} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-primary dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 underline underline-offset-2 break-all">
                    Portfolio
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
