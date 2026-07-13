import { createPublicClient } from '@/lib/supabase/public'

export type MatchedJob = {
  id: string
  title: string
  company_name: string
  location: string
  salary_label: string | null
  matchedTags: string[]
}

type RawJob = {
  id: string
  title: string
  company_name: string
  location: string
  salary_label: string | null
  tags: string[] | null
}

// Shared by matchJobsToSkills below and the Jobs page's "Match %" badge —
// one real computation, not a second matching system. Comma-separated,
// case-insensitive, same as the candidate's profile skills field.
export function parseSkillSet(skillsCsv: string | null | undefined): Set<string> {
  return new Set(
    (skillsCsv ?? '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
  )
}

// Real percentage: how many of THIS job's own stated tags the candidate's
// real skills cover. Returns null (never 0%) when there's nothing genuine
// to compare — no tags on the job, no skills on the profile, or zero
// overlap — so the UI can omit the badge entirely rather than show a
// technically-true-but-useless "0% Match", same precedent as
// JobRecommendations only rendering on a genuine match.
export function calculateMatchPercent(jobTags: string[] | null | undefined, skillSet: Set<string>): number | null {
  const tags = jobTags ?? []
  if (tags.length === 0 || skillSet.size === 0) return null
  const matched = tags.filter((tag) => skillSet.has(tag.trim().toLowerCase())).length
  if (matched === 0) return null
  return Math.round((matched / tags.length) * 100)
}

/**
 * Real overlap between a candidate's comma-separated skills string and each
 * active job's tags — no invented match score. Shared by the candidate
 * dashboard and the AI Career Coach so the matching logic lives in one
 * place. Returns [] (not an error) when there's nothing to show; callers
 * decide how to render that.
 */
export async function matchJobsToSkills(
  skillsCsv: string | null | undefined,
  excludeJobIds: Set<string>,
  limit = 4
): Promise<MatchedJob[]> {
  const skillSet = parseSkillSet(skillsCsv)
  if (skillSet.size === 0) return []

  const supabase = createPublicClient()
  const { data: activeJobs } = await supabase
    .from('jobs')
    .select('id, title, company_name, location, salary_label, tags')
    .eq('is_active', true)
    .limit(50)

  return ((activeJobs as RawJob[] | null) ?? [])
    .filter((job) => !excludeJobIds.has(job.id))
    .map((job) => ({
      id: job.id,
      title: job.title,
      company_name: job.company_name,
      location: job.location,
      salary_label: job.salary_label,
      matchedTags: (job.tags ?? []).filter((tag) => skillSet.has(tag.trim().toLowerCase())),
    }))
    .filter((job) => job.matchedTags.length > 0)
    .sort((a, b) => b.matchedTags.length - a.matchedTags.length)
    .slice(0, limit)
}
