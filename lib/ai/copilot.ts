import OpenAI from 'openai'
import { getPromptLanguageName } from './promptLocale'
import { CATEGORY_KEY, JOB_TYPE_KEY, WORK_TYPE_KEY } from '@/lib/i18n/jobLabels'

/**
 * Conversational Career Copilot — intent classification + a short reply,
 * V1 scope only: no function calling, no direct generation. The model
 * never produces the resume/cover letter/analysis itself — it identifies
 * which existing tool the candidate wants and proposes a real, validated
 * link to it. Always Mistral (free tier) regardless of the candidate's
 * premium status: this step is cheap classification, not the paid
 * generation step, so there's no quality-tier reason to route it to GPT-4o,
 * and gating it would add friction to what's meant to be a low-cost
 * discovery/routing surface.
 */

export type CopilotIntent =
  | 'improve_resume'
  | 'write_cover_letter'
  | 'find_jobs'
  | 'career_analysis'
  | 'view_applications'
  | 'unclear'

const VALID_INTENTS: CopilotIntent[] = [
  'improve_resume', 'write_cover_letter', 'find_jobs', 'career_analysis', 'view_applications', 'unclear',
]

export type CopilotExtracted = {
  targetRole: string | null
  searchQuery: string | null
  workType: string | null
  sortBySalary: boolean
}

export type CopilotClassification = {
  intent: CopilotIntent
  reply: string
  extracted: CopilotExtracted
}

export type CopilotRedirect = { url: string; labelKey: string } | null

class CopilotError extends Error {
  status: number
  constructor(message: string, status = 500) {
    super(message)
    this.status = status
  }
}

const REAL_CATEGORIES = Object.keys(CATEGORY_KEY)
const REAL_JOB_TYPES = Object.keys(JOB_TYPE_KEY)
const REAL_WORK_TYPES = Object.keys(WORK_TYPE_KEY)

function buildPrompt(message: string, languageName: string): string {
  return `You are a routing assistant for a job platform's AI tools. Your ONLY job is to classify what the candidate is asking for and write a short, honest reply pointing them to the right existing tool — you never generate a resume, cover letter, or analysis yourself, and you never invent a capability the platform doesn't actually have.

LANGUAGE: Write the "reply" value entirely in ${languageName}, regardless of what language the candidate's message is written in — always reply in ${languageName}, never default to English unless ${languageName} IS English.

The candidate's message: "${message}"

Classify into EXACTLY ONE of these intents:
- "improve_resume" — wants help writing/improving/tailoring their resume or CV for a role or company.
- "write_cover_letter" — wants a cover letter written or improved.
- "find_jobs" — wants to search/filter job listings (by role, remote/hybrid/onsite, category, or wants higher-paying roles surfaced).
- "career_analysis" — wants a broader career/profile assessment, ATS score, or skill gaps (not a specific document).
- "view_applications" — wants to check the status of jobs they've already applied to.
- "unclear" — the message doesn't clearly match any of the above, is off-topic, or is too vague to act on.

STRICT RULES:
- Only extract "targetRole", "searchQuery", or "workType" if the candidate's message explicitly states them — never guess or infer a value they didn't actually say.
- "targetRole" must be an actual job title/role only (e.g. "Software Engineer", "Product Manager") — NEVER a company name. If the candidate mentions only a company (e.g. "improve my resume for Amazon") without stating a specific role, leave "targetRole" null and instead acknowledge the company by name in your "reply" text.
- "workType" must be exactly one of: ${REAL_WORK_TYPES.join(', ')} (lowercase, as shown) — or null if not mentioned or not one of these.
- Real job categories on this platform are only: ${REAL_CATEGORIES.filter((c) => c !== 'All').join(', ')}. Real job types are only: ${REAL_JOB_TYPES.filter((c) => c !== 'All').join(', ')}. Do not invent a category/type outside these lists.
- There is NO minimum-salary filter on this platform — jobs can only be sorted by salary (highest first), not filtered to an exact threshold. If the candidate mentions any salary figure or "highest paying"/"best paying" type request, set "sortBySalary" to true and your reply must honestly say you've sorted by salary (highest first) rather than claiming an exact threshold filter was applied.
- Keep "reply" to 1-2 short sentences — a brief acknowledgment, not the actual deliverable.
- For "unclear", "reply" must briefly and honestly say you didn't understand and list in plain language the kinds of things you can help with (resume, cover letter, job search, career analysis, checking application status) — never pretend to understand something you didn't.

Return a JSON object with this exact structure:
{
  "intent": "<one of: improve_resume, write_cover_letter, find_jobs, career_analysis, view_applications, unclear>",
  "reply": "<1-2 sentence reply in ${languageName}>",
  "extracted": {
    "targetRole": "<the job title/role exactly as the candidate stated it, or null if only a company was mentioned>",
    "searchQuery": "<a short real keyword/role phrase for a job search, exactly reflecting what the candidate said, or null>",
    "workType": "<one of ${REAL_WORK_TYPES.join('/')}, or null>",
    "sortBySalary": <true or false>
  }
}`
}

function coerceExtracted(raw: unknown): CopilotExtracted {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const targetRole = typeof obj.targetRole === 'string' && obj.targetRole.trim() ? obj.targetRole.trim() : null
  const searchQuery = typeof obj.searchQuery === 'string' && obj.searchQuery.trim() ? obj.searchQuery.trim() : null
  const rawWorkType = typeof obj.workType === 'string' ? obj.workType.trim().toLowerCase() : null
  const workType = rawWorkType && REAL_WORK_TYPES.includes(rawWorkType) ? rawWorkType : null
  const sortBySalary = obj.sortBySalary === true
  return { targetRole, searchQuery, workType, sortBySalary }
}

function normalize(raw: unknown): CopilotClassification {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const intent = VALID_INTENTS.includes(obj.intent as CopilotIntent) ? (obj.intent as CopilotIntent) : 'unclear'
  const reply = typeof obj.reply === 'string' && obj.reply.trim() ? obj.reply.trim() : ''
  return { intent, reply, extracted: coerceExtracted(obj.extracted) }
}

export async function classifyMessage(message: string): Promise<CopilotClassification> {
  const apiKey = process.env.MISTRAL_API_KEY
  if (!apiKey) throw new CopilotError('Mistral not configured', 503)

  const client = new OpenAI({ apiKey, baseURL: 'https://api.mistral.ai/v1' })
  try {
    const res = await client.chat.completions.create({
      model: 'mistral-small-latest',
      messages: [{ role: 'user', content: buildPrompt(message, getPromptLanguageName()) }],
      max_tokens: 300,
      response_format: { type: 'json_object' },
    })
    const raw = res.choices?.[0]?.message?.content ?? '{}'
    return normalize(JSON.parse(raw))
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Copilot classification failed'
    throw new CopilotError(msg, 502)
  }
}

// Builds the ONLY real, validated in-app link for a given intent — never
// something the model's raw output writes directly into a URL. Query
// params reuse exactly what each destination page already supports
// (app/jobs/JobsClient.tsx's workType/q, the resume builder's targetRole —
// see app/ai-tools/resume-builder/page.tsx). write_cover_letter has no
// ad-hoc company/role query param support (only a real ?jobId= lookup,
// which this V1 has no way to resolve without function calling), so it
// links to the bare page — the reply text should mention the profile
// pre-fill already happens there.
export function buildRedirect(intent: CopilotIntent, extracted: CopilotExtracted): CopilotRedirect {
  switch (intent) {
    case 'improve_resume': {
      const params = new URLSearchParams()
      if (extracted.targetRole) params.set('targetRole', extracted.targetRole)
      const qs = params.toString()
      return { url: qs ? `/ai-tools/resume-builder?${qs}` : '/ai-tools/resume-builder', labelKey: 'redirectImproveResume' }
    }
    case 'write_cover_letter':
      return { url: '/ai-tools/cover-letter', labelKey: 'redirectCoverLetter' }
    case 'find_jobs': {
      const params = new URLSearchParams()
      if (extracted.searchQuery) params.set('q', extracted.searchQuery)
      if (extracted.workType) params.set('workType', extracted.workType)
      if (extracted.sortBySalary) params.set('sort', 'salary')
      const qs = params.toString()
      return { url: qs ? `/jobs?${qs}` : '/jobs', labelKey: 'redirectFindJobs' }
    }
    case 'career_analysis':
      return { url: '/candidate/career-coach', labelKey: 'redirectCareerAnalysis' }
    case 'view_applications':
      return { url: '/candidate', labelKey: 'redirectViewApplications' }
    case 'unclear':
      return null
  }
}
