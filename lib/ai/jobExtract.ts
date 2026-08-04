import OpenAI from 'openai'

/**
 * Job Post Extractor — pulls structured fields out of a raw, pasted job
 * description so the employer doesn't have to re-type them into
 * PostJobModal by hand. This only ever prefills the existing form; the real
 * job row is still created exclusively via the existing, gated POST
 * /api/jobs (role check + employer plan limit + cross-border
 * classification) — this module never touches the `jobs` table.
 *
 * Always Mistral (free tier), same reasoning as lib/ai/crossBorder.ts: cheap
 * classification/extraction over existing text, not the paid generation
 * work that justifies GPT-4o elsewhere — no premium gating, consistent with
 * PostJobModal itself (gated by employer role + plan limit, not is_premium).
 */

export type ExtractedWorkType = 'remote' | 'hybrid' | 'onsite'
export type ExtractedJobType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship'
export type ExtractedCategory = 'Engineering' | 'Design' | 'Data' | 'Research' | 'Developer Relations' | 'Content'

const WORK_TYPES: ExtractedWorkType[] = ['remote', 'hybrid', 'onsite']
const JOB_TYPES: ExtractedJobType[] = ['Full-time', 'Part-time', 'Contract', 'Internship']
const CATEGORIES: ExtractedCategory[] = ['Engineering', 'Design', 'Data', 'Research', 'Developer Relations', 'Content']

export type ExtractedJob = {
  title: string | null
  company_name: string | null
  location: string | null
  work_type: ExtractedWorkType | null
  job_type: ExtractedJobType | null
  category: ExtractedCategory | null
  description: string | null
  salary_min: number | null
  salary_max: number | null
  tags: string[]
}

export class JobExtractError extends Error {
  status: number
  constructor(message: string, status = 500) {
    super(message)
    this.status = status
  }
}

export const MIN_TEXT_LENGTH = 50

export function hasEnoughText(text: string | null | undefined): boolean {
  return (text ?? '').trim().length >= MIN_TEXT_LENGTH
}

function buildPrompt(text: string): string {
  return `You are extracting structured fields from a real, pasted job posting. Base every field ONLY on what is actually written below — if a field isn't stated, its value is null. Never invent a company name, salary, or location that isn't in the text.

STRICT RULES:
- "work_type" must be exactly one of: ${WORK_TYPES.join(', ')} — or null if the text gives no real signal (do not guess "remote" just because the role could plausibly be remote).
- "job_type" must be exactly one of: ${JOB_TYPES.join(', ')} — or null if not stated.
- "category" must be exactly one of: ${CATEGORIES.join(', ')} — or null if none clearly fits.
- "salary_min"/"salary_max" are numbers (e.g. 150000), only if an actual figure is stated — never estimate one.
- "tags" is a short list of real skills/technologies explicitly named in the text (0-8 items) — never invent one that isn't mentioned.
- "description" should be the real job description text itself (cleaned up, no salary/company/location repeated redundantly if they're already broken out above), not a summary that adds anything not in the source.

Job posting text:
${text}

Return a JSON object with EXACTLY this structure:
{
  "title": "<string or null>",
  "company_name": "<string or null>",
  "location": "<string or null>",
  "work_type": "<${WORK_TYPES.join('|')}|null>",
  "job_type": "<${JOB_TYPES.join('|')}|null>",
  "category": "<${CATEGORIES.join('|')}|null>",
  "description": "<string or null>",
  "salary_min": <number or null>,
  "salary_max": <number or null>,
  "tags": [<0-8 short strings>]
}`
}

function coerceEnum<T extends string>(value: unknown, valid: T[]): T | null {
  return typeof value === 'string' && valid.includes(value as T) ? (value as T) : null
}

function coerceNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.round(value)
  return null
}

function coerceString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function normalize(raw: unknown): ExtractedJob {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  return {
    title: coerceString(obj.title),
    company_name: coerceString(obj.company_name),
    location: coerceString(obj.location),
    work_type: coerceEnum(obj.work_type, WORK_TYPES),
    job_type: coerceEnum(obj.job_type, JOB_TYPES),
    category: coerceEnum(obj.category, CATEGORIES),
    description: coerceString(obj.description),
    salary_min: coerceNumber(obj.salary_min),
    salary_max: coerceNumber(obj.salary_max),
    tags: Array.isArray(obj.tags)
      ? obj.tags.filter((t): t is string => typeof t === 'string' && t.trim().length > 0).slice(0, 8)
      : [],
  }
}

export async function extractJobFromText(text: string): Promise<ExtractedJob> {
  const apiKey = process.env.MISTRAL_API_KEY
  if (!apiKey) throw new JobExtractError('Mistral not configured', 503)

  const client = new OpenAI({ apiKey, baseURL: 'https://api.mistral.ai/v1' })
  try {
    const res = await client.chat.completions.create({
      model: 'mistral-small-latest',
      messages: [{ role: 'user', content: buildPrompt(text.slice(0, 8000)) }],
      max_tokens: 800,
      response_format: { type: 'json_object' },
    })
    const raw = res.choices?.[0]?.message?.content ?? '{}'
    return normalize(JSON.parse(raw))
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Job extraction failed'
    throw new JobExtractError(msg, 502)
  }
}
