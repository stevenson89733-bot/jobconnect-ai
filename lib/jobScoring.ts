import { parseSkillSet } from './jobMatching'

export type ScoreDetail = { label: string; matched: boolean }

export type JobMatchScore = {
  score: number
  details: ScoreDetail[]
}

// Keywords that signal a candidate's profile aligns with each DB category
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Engineering: ['engineer', 'developer', 'dev', 'backend', 'frontend', 'fullstack', 'software', 'devops', 'sre', 'mobile', 'ios', 'android', 'platform', 'infrastructure'],
  Design: ['design', 'designer', 'ux', 'ui', 'figma', 'creative', 'visual'],
  Data: ['data', 'analyst', 'analytics', 'science', 'scientist', 'ml', 'machine learning', 'intelligence', 'dbt', 'tableau', 'spark'],
  Research: ['research', 'researcher', 'scientist', 'academic'],
  'Developer Relations': ['devrel', 'developer relations', 'advocacy', 'advocate', 'community'],
  Content: ['content', 'writer', 'writing', 'copywriter', 'documentation', 'editorial'],
}

type ScoringProfile = {
  skills: string | null
  title: string | null
  work_preference: string | null
}

type ScoringJob = {
  tags: string[] | null
  category: string
  work_type: string
  created_at: string
}

// Scoring breakdown (max 100):
//   Skills overlap  → 0-30  (how many job tags the candidate's skills cover)
//   Category match  → 0-25  (job category vs candidate title/skills keywords)
//   Work type fit   → 0-20  (remote preference vs job.work_type)
//   Job recency     → 0-25  (fresh postings are more actionable)
export function calculateJobScore(
  job: ScoringJob,
  profile: ScoringProfile | null
): JobMatchScore | null {
  if (!profile || (!profile.skills && !profile.title)) return null

  const skillSet = parseSkillSet(profile.skills)
  const tags = job.tags ?? []

  // 1. Skills (0-30)
  const matched = skillSet.size > 0 && tags.length > 0
    ? tags.filter((t) => skillSet.has(t.trim().toLowerCase())).length
    : 0
  const skillsPoints = tags.length > 0 && matched > 0
    ? Math.round((matched / tags.length) * 30)
    : 0

  // 2. Category (0-25)
  const kws = CATEGORY_KEYWORDS[job.category] ?? []
  const haystack = `${profile.title ?? ''} ${profile.skills ?? ''}`.toLowerCase()
  const categoryMatched = kws.length > 0 && kws.some((kw) => haystack.includes(kw))
  const categoryPoints = categoryMatched ? 25 : 0

  // 3. Work type (0-20)
  const pref = profile.work_preference
  const isRemote = job.work_type === 'remote'
  let workPoints = 0
  let workMatched = false
  if (!pref) {
    workMatched = isRemote
    workPoints = isRemote ? 12 : 5
  } else if (pref === 'remote') {
    workMatched = isRemote
    workPoints = isRemote ? 20 : 0
  } else if (pref === 'hybrid') {
    workMatched = isRemote || job.work_type === 'hybrid'
    workPoints = workMatched ? 15 : 0
  } else {
    workMatched = job.work_type === pref
    workPoints = workMatched ? 20 : 5
  }

  // 4. Recency (0-25)
  const ageDays = Math.floor((Date.now() - new Date(job.created_at).getTime()) / 86400000)
  const recencyPoints = ageDays < 3 ? 25 : ageDays < 7 ? 20 : ageDays < 14 ? 13 : ageDays < 30 ? 6 : 0
  const recencyMatched = recencyPoints >= 13

  const score = Math.min(100, skillsPoints + categoryPoints + workPoints + recencyPoints)

  return {
    score,
    details: [
      { label: matched > 0 ? `Skills (${matched}/${tags.length})` : 'Skills', matched: matched > 0 },
      { label: `Category · ${job.category}`, matched: categoryMatched },
      { label: isRemote ? 'Remote' : job.work_type, matched: workMatched },
      { label: 'Recent posting', matched: recencyMatched },
    ],
  }
}
