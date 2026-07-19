// Shared by the candidate dashboard's ProfileCompletionCard and the Career
// Copilot widget — one completion calculation, not two that could quietly
// disagree on a candidate's real percentage.

export type CompletionProfile = {
  full_name?: string | null
  title?: string | null
  location?: string | null
  bio?: string | null
  skills?: string | null
  experience?: string | null
  avatar_url?: string | null
  portfolio_url?: string | null
  availability?: string | null
  work_preference?: string | null
  years_experience?: number | null
}

// phone is intentionally excluded: optional and private, not a signal of
// "profile completeness" for employers to see.
const TEXT_FIELDS = [
  'full_name', 'title', 'location', 'bio', 'skills', 'experience',
  'avatar_url', 'portfolio_url', 'availability', 'work_preference',
] as const

export function computeProfileCompletion(profile: CompletionProfile | null): number {
  const filledCount =
    TEXT_FIELDS.filter((f) => !!profile?.[f]?.toString().trim()).length +
    (profile?.years_experience != null ? 1 : 0)
  return Math.round((filledCount / (TEXT_FIELDS.length + 1)) * 100)
}

// The single highest-priority missing field, real (not guessed) — used by
// the Copilot to name one concrete next step instead of a vague nudge.
// null when nothing (or nothing prioritized) is missing.
export function findPriorityGap(profile: CompletionProfile | null): 'title' | 'skills' | 'generic' | null {
  if (!profile?.title?.trim()) return 'title'
  if (!profile?.skills?.trim()) return 'skills'
  const completion = computeProfileCompletion(profile)
  return completion < 100 ? 'generic' : null
}
