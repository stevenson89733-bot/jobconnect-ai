import { createPremiumOpenAIClient, AiConfigError } from './openaiClient'

/**
 * AI Career Coach — single structured GPT-4o call per analysis.
 *
 * Premium-only (gated by the caller in app/actions/careerCoach.ts) — unlike
 * the Resume Builder / Cover Letter tools, there is no free-tier Mistral
 * fallback here; the whole feature is behind is_premium.
 */

export class CareerCoachError extends Error {
  status: number
  constructor(message: string, status = 500) {
    super(message)
    this.status = status
  }
}

export type CareerAnalysis = {
  atsScore: { score: number; explanation: string }
  profileStrength: { score: number; explanation: string }
  missingSkills: string[]
  missingKeywords: string[]
  resumeSuggestions: string[]
  interviewSuggestions: string[]
  careerRoadmap: { shortTerm: string[]; midTerm: string[]; longTerm: string[] }
  recommendedCertifications: { name: string; rationale: string }[]
  salaryPrediction: { range: string; explanation: string }
}

export type CandidateProfileInput = {
  title: string | null
  bio: string | null
  experience: string | null
  skills: string
  education: string | null
  location: string | null
  yearsExperience: number | null
  workPreference: string | null
}

function buildPrompt(profile: CandidateProfileInput): string {
  return `You are an expert career coach, resume/ATS specialist, and technical recruiter. Analyze this candidate's profile and produce an honest, specific career assessment. Do not invent facts about the candidate — base everything on what's given. If the candidate hasn't stated a target role, infer the most likely one from their experience/bio and make that assumption explicit in your explanations.

Candidate profile:
- Current/desired title: ${profile.title || 'Not specified — infer from experience/bio'}
- Bio: ${profile.bio || 'Not provided'}
- Work experience: ${profile.experience || 'Not provided'}
- Skills: ${profile.skills || 'Not provided'}
- Education: ${profile.education || 'Not provided'}
- Location: ${profile.location || 'Not specified'}
- Years of experience: ${profile.yearsExperience ?? 'Not specified'}
- Work preference: ${profile.workPreference || 'Not specified'}

Return a JSON object with EXACTLY this structure (no extra top-level keys):
{
  "atsScore": { "score": <integer 0-100>, "explanation": "<1-2 sentences, specific to this profile>" },
  "profileStrength": { "score": <integer 0-100>, "explanation": "<1-2 sentences>" },
  "missingSkills": [<3-6 short strings — skills this candidate likely lacks for their target role>],
  "missingKeywords": [<3-8 short strings — resume/ATS keywords missing for their target role>],
  "resumeSuggestions": [<3-5 short, actionable bullet strings>],
  "interviewSuggestions": [<3-5 short, actionable bullet strings>],
  "careerRoadmap": {
    "shortTerm": [<2-3 short strings, next 0-6 months>],
    "midTerm": [<2-3 short strings, 6 months-2 years>],
    "longTerm": [<2-3 short strings, 2+ years>]
  },
  "recommendedCertifications": [{ "name": "<cert name>", "rationale": "<1 short sentence>" } — 2-4 items],
  "salaryPrediction": { "range": "<e.g. \\"$95k-$120k USD/year\\">", "explanation": "<1-2 sentences noting this is an estimate based on the profile, not live market data>" }
}

All strings must be plain text (no markdown syntax like ** or #). Every array item must be a plain string except recommendedCertifications, which is an array of {name, rationale} objects.`
}

function coerceStringArray(value: unknown, max = 8): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((v): v is string => typeof v === 'string' && v.trim().length > 0).slice(0, max)
}

function coerceScoreBlock(value: unknown): { score: number; explanation: string } {
  const obj = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>
  const rawScore = typeof obj.score === 'number' ? obj.score : Number(obj.score)
  const score = Number.isFinite(rawScore) ? Math.max(0, Math.min(100, Math.round(rawScore))) : 0
  const explanation = typeof obj.explanation === 'string' ? obj.explanation : ''
  return { score, explanation }
}

// Defensive normalization — GPT-4o with response_format json_object is
// reliable, but this guarantees the UI never crashes on a slightly
// malformed shape (missing key, wrong type, extra nesting).
function normalizeAnalysis(raw: unknown): CareerAnalysis {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const roadmapObj = (obj.careerRoadmap && typeof obj.careerRoadmap === 'object' ? obj.careerRoadmap : {}) as Record<string, unknown>
  const certsRaw = Array.isArray(obj.recommendedCertifications) ? obj.recommendedCertifications : []

  return {
    atsScore: coerceScoreBlock(obj.atsScore),
    profileStrength: coerceScoreBlock(obj.profileStrength),
    missingSkills: coerceStringArray(obj.missingSkills, 6),
    missingKeywords: coerceStringArray(obj.missingKeywords, 8),
    resumeSuggestions: coerceStringArray(obj.resumeSuggestions, 5),
    interviewSuggestions: coerceStringArray(obj.interviewSuggestions, 5),
    careerRoadmap: {
      shortTerm: coerceStringArray(roadmapObj.shortTerm, 3),
      midTerm: coerceStringArray(roadmapObj.midTerm, 3),
      longTerm: coerceStringArray(roadmapObj.longTerm, 3),
    },
    recommendedCertifications: certsRaw
      .filter((c): c is Record<string, unknown> => !!c && typeof c === 'object')
      .map((c) => ({
        name: typeof c.name === 'string' ? c.name : '',
        rationale: typeof c.rationale === 'string' ? c.rationale : '',
      }))
      .filter((c) => c.name)
      .slice(0, 4),
    salaryPrediction: {
      range: typeof (obj.salaryPrediction as Record<string, unknown> | undefined)?.range === 'string'
        ? (obj.salaryPrediction as Record<string, unknown>).range as string
        : '',
      explanation: typeof (obj.salaryPrediction as Record<string, unknown> | undefined)?.explanation === 'string'
        ? (obj.salaryPrediction as Record<string, unknown>).explanation as string
        : '',
    },
  }
}

export async function generateCareerAnalysis(profile: CandidateProfileInput): Promise<CareerAnalysis> {
  let client
  try {
    client = createPremiumOpenAIClient()
  } catch (err) {
    if (err instanceof AiConfigError) throw new CareerCoachError(err.message, err.status)
    throw err
  }

  let raw: unknown
  try {
    const res = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: buildPrompt(profile) }],
      max_tokens: 2200,
      response_format: { type: 'json_object' },
    })
    raw = JSON.parse(res.choices?.[0]?.message?.content ?? '{}')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Career analysis generation failed'
    throw new CareerCoachError(message, 502)
  }

  return normalizeAnalysis(raw)
}
