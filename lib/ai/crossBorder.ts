import OpenAI from 'openai'

/**
 * Cross-Border Remote-Friendly Detector — classifies whether a "remote" job
 * posting is genuinely open to a candidate based anywhere, or whether the
 * description restricts by geography, visa/sponsorship, or an imposed
 * timezone overlap that would exclude a foreign candidate.
 *
 * Always Mistral (free tier), same reasoning as lib/ai/copilot.ts: this is
 * a cheap classification step over existing text, not the paid generation
 * work that justifies GPT-4o elsewhere — no premium gating.
 *
 * "reason" is an internal-only field (never shown to candidates in this
 * V1) — kept for auditing classification quality, so no language
 * instruction/getPromptLanguageName() call here; it stays in English
 * regardless of site locale, same as other internal-only fields (e.g.
 * console.error messages elsewhere in this app).
 */

export type CrossBorderStatus = 'yes' | 'no' | 'unclear'
const VALID_STATUSES: CrossBorderStatus[] = ['yes', 'no', 'unclear']

export type CrossBorderClassification = {
  status: CrossBorderStatus
  reason: string
}

class CrossBorderError extends Error {
  status: number
  constructor(message: string, status = 500) {
    super(message)
    this.status = status
  }
}

function buildPrompt(title: string, description: string): string {
  return `You are analyzing a "remote" job posting to determine whether it is genuinely open to a candidate based anywhere in the world, or whether it imposes a restriction that would exclude a foreign candidate.

STRICT RULES:
- Answer "yes" ONLY if the description explicitly states or clearly implies worldwide openness with no restriction (e.g. "open to candidates worldwide", "remote-first, work from anywhere", "we hire globally").
- Answer "no" if the description explicitly mentions a restriction that would exclude a foreign candidate: a specific country/region requirement ("must be based in the US", "EU residents only"), visa/sponsorship refusal ("we do not sponsor work visas", "must have existing work authorization in X"), or an imposed timezone overlap that is effectively blocking ("must overlap 9am-5pm PST").
- Answer "unclear" if the description contains NO clear signal either way — NEVER GUESS. The word "remote" alone, with no further qualification, is "unclear", not "yes" — most real postings with no specific statement should fall into this category.
- Base your answer only on the real text given below, never on an assumption about the company.

Job title: ${title}
Description: ${description}

Return a JSON object: { "status": "yes" | "no" | "unclear", "reason": "<one factual sentence citing the exact phrase found, or noting the absence of any signal>" }`
}

function normalize(raw: unknown): CrossBorderClassification {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const status = VALID_STATUSES.includes(obj.status as CrossBorderStatus) ? (obj.status as CrossBorderStatus) : 'unclear'
  const reason = typeof obj.reason === 'string' && obj.reason.trim() ? obj.reason.trim() : ''
  return { status, reason }
}

export async function classifyCrossBorder(title: string, description: string): Promise<CrossBorderClassification> {
  const apiKey = process.env.MISTRAL_API_KEY
  if (!apiKey) throw new CrossBorderError('Mistral not configured', 503)

  const client = new OpenAI({ apiKey, baseURL: 'https://api.mistral.ai/v1' })
  try {
    const res = await client.chat.completions.create({
      model: 'mistral-small-latest',
      messages: [{ role: 'user', content: buildPrompt(title, description) }],
      max_tokens: 200,
      response_format: { type: 'json_object' },
    })
    const raw = res.choices?.[0]?.message?.content ?? '{}'
    return normalize(JSON.parse(raw))
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Cross-border classification failed'
    throw new CrossBorderError(msg, 502)
  }
}
