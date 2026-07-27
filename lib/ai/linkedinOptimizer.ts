import { createPremiumOpenAIClient, AiConfigError } from './openaiClient'
import { getPromptLanguageName } from './promptLocale'

/**
 * LinkedIn Optimizer — two independent, stateless GPT-4o calls. No DB table:
 * same reasoning as lib/ai/resumeAnalysis.ts and lib/ai/interviewPrep.ts —
 * no history/chart need was expressed for either mode, unlike career_analysis.
 */

export class LinkedInOptimizerError extends Error {
  status: number
  constructor(message: string, status = 500) {
    super(message)
    this.status = status
  }
}

export const MIN_PROFILE_TEXT_LENGTH = 40

export function hasEnoughProfileText(text: string | null | undefined): boolean {
  return (text ?? '').trim().length >= MIN_PROFILE_TEXT_LENGTH
}

export type LinkedInAnalysisInput = {
  headline: string
  about: string
  experience: string
}

export type LinkedInAnalysis = {
  profileScore: { score: number; explanation: string }
  headlineFeedback: string
  aboutFeedback: string
  experienceFeedback: string
  keywordSuggestions: string[]
  improvementSuggestions: string[]
}

export type LinkedInGenerationInput = {
  targetRole: string
  experience: string
  skills: string
  summary: string
}

export type LinkedInGeneration = {
  headline: string
  about: string
  experienceHighlights: string[]
}

function buildAnalysisPrompt(input: LinkedInAnalysisInput, languageName: string): string {
  return `You are a LinkedIn profile optimization expert and technical recruiter. Critically analyze this SPECIFIC LinkedIn profile text (not the candidate in the abstract) — be specific to the actual text given, never invent an achievement, skill, or detail not present in it.

LANGUAGE: Write every string value below entirely in ${languageName}, regardless of what language the profile text is written in — always output in ${languageName}, never default to English unless ${languageName} IS English.

LinkedIn — Headline:
${input.headline || '(empty)'}

LinkedIn — About / Summary:
${input.about || '(empty)'}

LinkedIn — Experience:
${input.experience || '(empty)'}

Return a JSON object with EXACTLY this structure (no extra top-level keys):
{
  "profileScore": { "score": <integer 0-100, overall effectiveness of this profile text>, "explanation": "<1-2 sentences>" },
  "headlineFeedback": "<2-3 sentences on the headline specifically — clarity, keyword presence, whether it's generic or compelling>",
  "aboutFeedback": "<2-3 sentences on the about/summary specifically>",
  "experienceFeedback": "<2-3 sentences on how the experience is presented — impact/metrics vs. plain duty lists>",
  "keywordSuggestions": [<3-8 short strings — specific keywords/phrases missing from the text above that are grounded in something already stated in it (e.g. a skill or tool named in Experience but absent from the headline/about). NEVER invent or guess a specific technology, tool, or skill that isn't already written somewhere in the input above — if the input doesn't name specific tools, suggest a generic category instead (e.g. "the specific programming languages/frameworks you use" rather than naming one you're guessing at)>],
  "improvementSuggestions": [<3-6 short strings — concrete, actionable changes, each referencing the actual text above>]
}`
}

function buildGenerationPrompt(input: LinkedInGenerationInput, languageName: string): string {
  return `You are a LinkedIn profile writer. Write an optimized LinkedIn headline, about section, and experience highlights for this candidate, based ONLY on the real information given below — never invent an employer, title, metric, or skill not present in the input.

LANGUAGE: Write every string value below entirely in ${languageName}, regardless of what language the input below is written in.

Target role: ${input.targetRole || 'Not specified'}

Candidate's real experience:
${input.experience || 'Not provided'}

Candidate's real skills:
${input.skills || 'Not provided'}

Candidate's professional summary (if any):
${input.summary || 'Not provided'}

STRICT RULES:
- The headline must be one line, keyword-rich, grounded only in the real target role/skills/experience above.
- The about section (3-5 short paragraphs) must draw only on the real experience/skills/summary above — never fabricate a company, achievement, or quantified metric that isn't stated.
- experienceHighlights must be a reformulation of the real experience above into punchy bullet points — never a new role or employer not mentioned in the input.

Return a JSON object: { "headline": "<one line>", "about": "<3-5 short paragraphs, plain text with \\n\\n between paragraphs>", "experienceHighlights": [<3-6 short bullet strings>] }`
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

function normalizeAnalysis(raw: unknown): LinkedInAnalysis {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  return {
    profileScore: coerceScoreBlock(obj.profileScore),
    headlineFeedback: typeof obj.headlineFeedback === 'string' ? obj.headlineFeedback.trim() : '',
    aboutFeedback: typeof obj.aboutFeedback === 'string' ? obj.aboutFeedback.trim() : '',
    experienceFeedback: typeof obj.experienceFeedback === 'string' ? obj.experienceFeedback.trim() : '',
    keywordSuggestions: coerceStringArray(obj.keywordSuggestions, 8),
    improvementSuggestions: coerceStringArray(obj.improvementSuggestions, 6),
  }
}

function normalizeGeneration(raw: unknown): LinkedInGeneration {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  return {
    headline: typeof obj.headline === 'string' ? obj.headline.trim() : '',
    about: typeof obj.about === 'string' ? obj.about.trim() : '',
    experienceHighlights: coerceStringArray(obj.experienceHighlights, 6),
  }
}

async function chatJson(prompt: string, maxTokens: number): Promise<unknown> {
  let client
  try {
    client = createPremiumOpenAIClient()
  } catch (err) {
    if (err instanceof AiConfigError) throw new LinkedInOptimizerError(err.message, err.status)
    throw err
  }

  try {
    const res = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },
    })
    return JSON.parse(res.choices?.[0]?.message?.content ?? '{}')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'LinkedIn Optimizer request failed'
    throw new LinkedInOptimizerError(message, 502)
  }
}

export async function analyzeLinkedInProfile(input: LinkedInAnalysisInput): Promise<LinkedInAnalysis> {
  const raw = await chatJson(buildAnalysisPrompt(input, getPromptLanguageName()), 1200)
  return normalizeAnalysis(raw)
}

export async function generateLinkedInProfile(input: LinkedInGenerationInput): Promise<LinkedInGeneration> {
  const raw = await chatJson(buildGenerationPrompt(input, getPromptLanguageName()), 900)
  return normalizeGeneration(raw)
}
