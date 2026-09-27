import OpenAI from 'openai'

export type MatchExplanation = {
  strengths: string[]  // max 3 — why they match
  gaps: string[]       // max 2 — points of attention
}

type CandidateProfile = {
  title?: string | null
  skills?: string | null
  years_experience?: number | null
  location?: string | null
  work_preference?: string | null
}

type JobInput = {
  title: string
  description?: string | null
  tags?: string[] | null
  job_type?: string | null
  cross_border_status?: string | null
}

function isProfileSufficient(profile: CandidateProfile): boolean {
  const hasTitle = !!profile.title?.trim()
  const hasSkills = !!profile.skills?.trim()
  return hasTitle && hasSkills
}

function buildPrompt(profile: CandidateProfile, job: JobInput): string {
  const profileSummary = [
    profile.title       ? `Current title: ${profile.title}` : null,
    profile.skills      ? `Skills: ${profile.skills}` : null,
    profile.years_experience != null ? `Years of experience: ${profile.years_experience}` : null,
    profile.location    ? `Location: ${profile.location}` : null,
    profile.work_preference ? `Work preference: ${profile.work_preference}` : null,
  ].filter(Boolean).join('\n')

  const jobSummary = [
    `Job title: ${job.title}`,
    job.job_type ? `Type: ${job.job_type}` : null,
    job.cross_border_status ? `Cross-border status: ${job.cross_border_status}` : null,
    Array.isArray(job.tags) && job.tags.length ? `Tags: ${job.tags.join(', ')}` : null,
    job.description ? `Description (first 1500 chars): ${job.description.slice(0, 1500)}` : null,
  ].filter(Boolean).join('\n')

  return `You are a career coach. Compare a candidate profile to a job posting and return ONLY what is explicitly supported by the data provided — never invent or assume anything.

CANDIDATE PROFILE:
${profileSummary}

JOB POSTING:
${jobSummary}

STRICT RULES:
- "strengths": up to 3 short strings (max 12 words each) explaining why this candidate is a good match, based ONLY on explicit overlaps between profile skills/title and job requirements.
- "gaps": up to 2 short strings (max 12 words each) flagging real points of attention, based ONLY on requirements mentioned in the job that are absent from the profile.
- If there is no clear strength or gap supported by the data, return an empty array for that field.
- NEVER fabricate, infer, or guess. Only cite what is explicitly present in the profile and job text.
- Write in English. Keep each item concise and factual.

Return a JSON object with exactly:
{
  "strengths": ["...", "..."],
  "gaps": ["...", "..."]
}`
}

function normalizeResult(raw: unknown): MatchExplanation {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const strengths = Array.isArray(obj.strengths)
    ? (obj.strengths as unknown[])
        .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
        .slice(0, 3)
        .map((s) => s.trim())
    : []
  const gaps = Array.isArray(obj.gaps)
    ? (obj.gaps as unknown[])
        .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
        .slice(0, 2)
        .map((s) => s.trim())
    : []
  return { strengths, gaps }
}

export async function matchExplanation(
  profile: CandidateProfile,
  job: JobInput,
  matchScore: number
): Promise<MatchExplanation | null> {
  if (matchScore < 30) return null
  if (!isProfileSufficient(profile)) return null

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null

  const client = new OpenAI({ apiKey })
  try {
    const res = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: buildPrompt(profile, job) }],
      max_tokens: 400,
      temperature: 0,
      response_format: { type: 'json_object' },
    })
    const raw = res.choices?.[0]?.message?.content ?? '{}'
    return normalizeResult(JSON.parse(raw))
  } catch (err) {
    console.error('[matchExplanation] error:', err instanceof Error ? err.message : 'unknown')
    return null
  }
}
