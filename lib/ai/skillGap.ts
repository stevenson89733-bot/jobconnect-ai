import { createPremiumOpenAIClient, AiConfigError } from './openaiClient'
import { getPromptLanguageName } from './promptLocale'

/**
 * Mobility Skill-Gap (A→B) — stateless, premium-only GPT-4o call. Point A is
 * always the candidate's real profile. Point B is either a real job listing
 * (kind: 'job') or a freely-typed role name with no real source text (kind:
 * 'role') — these two are deliberately NOT treated the same by the prompt:
 * only 'job' can ground specific "requirement" claims in real text (title/
 * tags/description). 'role' has no real posting behind it, so the model is
 * instructed to surface only widely-recognized generic skills for that kind
 * of role, never a fabricated employer-specific requirement. The output's
 * "basis" field lets the UI honestly label which kind of answer this is.
 */

export class SkillGapError extends Error {
  status: number
  constructor(message: string, status = 500) {
    super(message)
    this.status = status
  }
}

export type GapContext =
  | { kind: 'job'; title: string; tags: string[]; description: string }
  | { kind: 'role'; targetRole: string }

export type SkillGapInput = {
  candidateSkills: string
  candidateExperience: string
  context: GapContext
}

export type SkillGapAnalysis = {
  basis: 'real_job' | 'general_estimate'
  matchScore: { score: number; explanation: string }
  skillsAlreadyHave: string[]
  skillsToDevelop: string[]
  suggestedNextSteps: string[]
}

function buildPrompt(input: SkillGapInput, languageName: string): string {
  const { context } = input

  const destinationBlock =
    context.kind === 'job'
      ? `Destination — a REAL job listing:
Job title: ${context.title}
Tags: ${context.tags.length > 0 ? context.tags.join(', ') : '(none)'}
Description: ${context.description || '(empty)'}`
      : `Destination — a role name only, NO real job listing exists for this:
Target role: ${context.targetRole}`

  const groundingRules =
    context.kind === 'job'
      ? `- This is a REAL job listing. You may only describe a skill as relevant/expected/required if it is actually present in the job title, tags, or description above — never invent a requirement not written there.
- Set "basis" to exactly "real_job".`
      : `- This is ONLY a role name — there is no real job listing behind it. You do NOT know what any specific employer requires for this role.
- NEVER state or imply that a skill is "required" or "expected" by an employer. Only surface skills that are widely and generically recognized across the industry for this kind of role — phrase everything as a general, typical estimate, never as a verified requirement.
- Set "basis" to exactly "general_estimate".`

  return `You are a career mobility advisor. Compare the candidate's REAL profile (point A) against the destination below (point B) and identify which skills they already have and which they'd genuinely benefit from developing. Base point A ONLY on the real skills/experience given — never invent a skill or achievement the candidate didn't state.

LANGUAGE: Write every string value below entirely in ${languageName}, regardless of what language the input is written in.

Candidate's real skills:
${input.candidateSkills || 'Not provided'}

Candidate's real experience:
${input.candidateExperience || 'Not provided'}

${destinationBlock}

STRICT RULES:
${groundingRules}
- "skillsAlreadyHave" must only list skills genuinely present in the candidate's real skills/experience above that are also relevant to the destination — never invent one they didn't state.
- "skillsToDevelop" is the gap: relevant skills for the destination that are absent from the candidate's real skills/experience above.
- "suggestedNextSteps" must be concrete and actionable, grounded only in the information above.

Return a JSON object with EXACTLY this structure:
{
  "basis": "${context.kind === 'job' ? 'real_job' : 'general_estimate'}",
  "matchScore": { "score": <integer 0-100, how well the candidate's real profile currently matches the destination>, "explanation": "<1-2 sentences>" },
  "skillsAlreadyHave": [<3-8 short strings>],
  "skillsToDevelop": [<3-8 short strings>],
  "suggestedNextSteps": [<3-5 short strings>]
}`
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

// "basis" is trusted from our own context.kind, never the model's output —
// defends against a malformed/hallucinated value flipping the UI's honesty
// label.
function normalizeAnalysis(raw: unknown, contextKind: GapContext['kind']): SkillGapAnalysis {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  return {
    basis: contextKind === 'job' ? 'real_job' : 'general_estimate',
    matchScore: coerceScoreBlock(obj.matchScore),
    skillsAlreadyHave: coerceStringArray(obj.skillsAlreadyHave, 8),
    skillsToDevelop: coerceStringArray(obj.skillsToDevelop, 8),
    suggestedNextSteps: coerceStringArray(obj.suggestedNextSteps, 5),
  }
}

export async function generateSkillGapAnalysis(input: SkillGapInput): Promise<SkillGapAnalysis> {
  let client
  try {
    client = createPremiumOpenAIClient()
  } catch (err) {
    if (err instanceof AiConfigError) throw new SkillGapError(err.message, err.status)
    throw err
  }

  let raw: unknown
  try {
    const res = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: buildPrompt(input, getPromptLanguageName()) }],
      max_tokens: 1200,
      response_format: { type: 'json_object' },
    })
    raw = JSON.parse(res.choices?.[0]?.message?.content ?? '{}')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Skill-gap analysis failed'
    throw new SkillGapError(message, 502)
  }

  return normalizeAnalysis(raw, input.context.kind)
}
