import { createPremiumOpenAIClient, AiConfigError } from './openaiClient'

/**
 * AI Resume Builder — analysis engine (lot 1 of 3).
 *
 * Single structured GPT-4o call that scores and critiques a SPECIFIC
 * generated resume document — distinct from Career Coach's ATS score, which
 * assesses the candidate's overall profile, not one document. Premium-only,
 * same reasoning as Career Coach: the Resume Builder page itself is already
 * fully gated behind is_premium, so there is no free-tier resume content to
 * run a lighter analysis against.
 */

export class ResumeAnalysisError extends Error {
  status: number
  constructor(message: string, status = 500) {
    super(message)
    this.status = status
  }
}

export type RewriteSection = 'summary' | 'experience' | 'skills' | 'education'

export type ResumeAnalysis = {
  resumeScore: { score: number; explanation: string }
  atsScore: { score: number; explanation: string }
  keywordOptimization: string[]
  grammarSuggestions: string[]
  achievementSuggestions: string[]
  aiRewrite: { section: RewriteSection; suggestion: string }[]
}

export type ResumeDocumentInput = {
  targetRole: string
  summary: string
  experience: string
  skills: string
  education: string
}

function buildPrompt(doc: ResumeDocumentInput): string {
  return `You are an expert resume writer, ATS specialist, and technical recruiter. Critically analyze this SPECIFIC resume document (not the candidate in the abstract) for the target role below. Be specific to the actual text given.

Target role: ${doc.targetRole || 'Not specified'}

Resume — Professional Summary:
${doc.summary || '(empty)'}

Resume — Experience:
${doc.experience || '(empty)'}

Resume — Skills:
${doc.skills || '(empty)'}

Resume — Education:
${doc.education || '(empty)'}

Return a JSON object with EXACTLY this structure (no extra top-level keys):
{
  "resumeScore": { "score": <integer 0-100, overall quality/effectiveness of this document>, "explanation": "<1-2 sentences>" },
  "atsScore": { "score": <integer 0-100, ATS/parseability compatibility of this document>, "explanation": "<1-2 sentences>" },
  "keywordOptimization": [<3-8 short strings — specific keywords/phrases this resume is missing for the target role>],
  "grammarSuggestions": [<0-5 short strings — specific grammar/clarity/wording issues found in the actual text above; empty array if none found, do not invent issues>],
  "achievementSuggestions": [<3-5 short strings — where to add quantifiable achievements/metrics, referencing the actual experience text>],
  "aiRewrite": [
    { "section": "summary", "suggestion": "<rewritten version of the Professional Summary section, plain text, or omit this entry if the current one is already strong>" },
    { "section": "experience", "suggestion": "<rewritten version of the Experience section, plain text with \\n line breaks and - bullets, or omit if already strong>" }
  ]
}

"aiRewrite" should only include entries for sections that genuinely benefit from a rewrite (0-4 entries, valid "section" values are exactly: "summary", "experience", "skills", "education"). All other array items must be plain strings.`
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

const VALID_SECTIONS: RewriteSection[] = ['summary', 'experience', 'skills', 'education']

// Defensive normalization — guarantees the UI never crashes on a slightly
// malformed shape (missing key, wrong type, unknown section name).
function normalizeAnalysis(raw: unknown): ResumeAnalysis {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const rewriteRaw = Array.isArray(obj.aiRewrite) ? obj.aiRewrite : []

  return {
    resumeScore: coerceScoreBlock(obj.resumeScore),
    atsScore: coerceScoreBlock(obj.atsScore),
    keywordOptimization: coerceStringArray(obj.keywordOptimization, 8),
    grammarSuggestions: coerceStringArray(obj.grammarSuggestions, 5),
    achievementSuggestions: coerceStringArray(obj.achievementSuggestions, 5),
    aiRewrite: rewriteRaw
      .filter((r): r is Record<string, unknown> => !!r && typeof r === 'object')
      .map((r) => ({
        section: (typeof r.section === 'string' ? r.section : '') as RewriteSection,
        suggestion: typeof r.suggestion === 'string' ? r.suggestion.trim() : '',
      }))
      .filter((r) => VALID_SECTIONS.includes(r.section) && r.suggestion.length > 0)
      .slice(0, 4),
  }
}

export async function generateResumeAnalysis(doc: ResumeDocumentInput): Promise<ResumeAnalysis> {
  let client
  try {
    client = createPremiumOpenAIClient()
  } catch (err) {
    if (err instanceof AiConfigError) throw new ResumeAnalysisError(err.message, err.status)
    throw err
  }

  let raw: unknown
  try {
    const res = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: buildPrompt(doc) }],
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    })
    raw = JSON.parse(res.choices?.[0]?.message?.content ?? '{}')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Resume analysis generation failed'
    throw new ResumeAnalysisError(message, 502)
  }

  return normalizeAnalysis(raw)
}
