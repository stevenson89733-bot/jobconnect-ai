import Link from 'next/link'

export type CandidateCard = {
  user_id: string
  full_name: string | null
  title: string | null
  location: string | null
  bio: string | null
  skills: string | null
  avatar_url: string | null
  years_experience: number | null
  availability: string | null
  work_preference: string | null
}

const SKILLS_PREVIEW = 5

function skillTags(skills: string | null): string[] {
  return (skills ?? '').split(',').map(s => s.trim()).filter(Boolean)
}

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase())
    .join('') || '?'
}

function CandidateCardItem({ candidate }: { candidate: CandidateCard }) {
  const name = candidate.full_name?.trim() || 'Candidate'
  const title = candidate.title?.trim()
  const location = candidate.location?.trim()
  const bio = candidate.bio?.trim()
  const tags = skillTags(candidate.skills)
  const previewTags = tags.slice(0, SKILLS_PREVIEW)
  const hiddenCount = Math.max(0, tags.length - previewTags.length)

  return (
    <div className="card flex flex-col">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-full overflow-hidden bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white text-sm font-bold shrink-0">
          {candidate.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={candidate.avatar_url} alt={name} className="w-full h-full object-cover" />
          ) : (
            initialsOf(name)
          )}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">{name}</div>
          {title && <div className="text-xs text-slate-600 dark:text-slate-400 truncate">{title}</div>}
        </div>
      </div>

      {location && (
        <p className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 mb-3">
          <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {location}
        </p>
      )}

      {(candidate.years_experience != null || candidate.work_preference?.trim() || candidate.availability?.trim()) && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {candidate.years_experience != null && (
            <span className="badge bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs">
              {candidate.years_experience} yr{candidate.years_experience === 1 ? '' : 's'}
            </span>
          )}
          {candidate.work_preference?.trim() && (
            <span className="badge bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs">
              {candidate.work_preference}
            </span>
          )}
          {candidate.availability?.trim() && (
            <span className="badge bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs">
              {candidate.availability}
            </span>
          )}
        </div>
      )}

      {bio && (
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 mb-3">{bio}</p>
      )}

      {previewTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {previewTags.map((skill) => (
            <span key={skill} className="badge bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs">
              {skill}
            </span>
          ))}
          {hiddenCount > 0 && (
            <span className="text-xs text-slate-600 dark:text-slate-400 self-center">+{hiddenCount} more</span>
          )}
        </div>
      )}

      <Link href={`/candidate/${candidate.user_id}`} className="btn-outline text-xs py-2 text-center mt-auto">
        View Profile
      </Link>
    </div>
  )
}

export default function CandidatesListView({
  candidates,
  page,
  totalPages,
  total,
}: {
  candidates: CandidateCard[]
  page: number
  totalPages: number
  total: number
}) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-3">
          <Link href="/recruiter" className="hover:text-slate-900 dark:hover:text-white transition-colors">Employer Dashboard</Link>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-300">Candidates</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">Candidates</h1>
        <p className="text-slate-600 dark:text-slate-400">
          {total} candidate{total === 1 ? '' : 's'} on JobConnect AI
        </p>
      </div>

      {candidates.length === 0 ? (
        <div className="card text-center py-16 text-slate-600 dark:text-slate-400">
          <div className="text-4xl mb-3">🧑‍💻</div>
          <p className="text-sm">No candidates yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {candidates.map((c) => (
            <CandidateCardItem key={c.user_id} candidate={c} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Link
            href={`/candidates?page=${page - 1}`}
            aria-disabled={page <= 1}
            className={`btn-outline text-sm px-4 py-2 ${page <= 1 ? 'pointer-events-none opacity-40' : ''}`}
          >
            ← Previous
          </Link>
          <span className="text-sm text-slate-600 dark:text-slate-400">Page {page} of {totalPages}</span>
          <Link
            href={`/candidates?page=${page + 1}`}
            aria-disabled={page >= totalPages}
            className={`btn-outline text-sm px-4 py-2 ${page >= totalPages ? 'pointer-events-none opacity-40' : ''}`}
          >
            Next →
          </Link>
        </div>
      )}
    </div>
  )
}
