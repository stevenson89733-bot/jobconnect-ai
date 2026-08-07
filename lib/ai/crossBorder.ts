import OpenAI from 'openai'

/**
 * Cross-Border Remote-Friendly Detector — classifies whether a "remote" job
 * posting is genuinely open to a candidate based anywhere, or whether the
 * description restricts by geography, visa/sponsorship, or an imposed
 * timezone overlap that would exclude a foreign candidate.
 *
 * Uses gpt-4o-mini directly (system-level call, not user-tier): cheap enough
 * for per-posting classification, accurate enough for nuanced signal detection.
 * Not gated on premium — this runs at job creation time, before any user
 * context is available.
 *
 * "reason" is internal-only (never shown to candidates) — kept for auditing.
 * "signals" is candidate-facing: 2-3 short strings shown in the badge expand.
 */

export type CrossBorderStatus = 'yes' | 'no' | 'unclear'
const VALID_STATUSES: CrossBorderStatus[] = ['yes', 'no', 'unclear']

export type CrossBorderClassification = {
  status: CrossBorderStatus
  reason: string
  signals: string[]
}

class CrossBorderError extends Error {
  status: number
  constructor(message: string, status = 500) {
    super(message)
    this.status = status
  }
}

function buildPrompt(title: string, description: string): string {
  return `You are analyzing a "remote" job posting to determine whether it is genuinely open to a candidate based anywhere in the world, or whether it restricts by geography, visa/sponsorship, or timezone overlap.

STRICT RULES:
- Answer "yes" ONLY if the description explicitly states or clearly implies worldwide openness with no restriction (e.g. "open to candidates worldwide", "remote-first, work from anywhere", "we hire globally").
- Answer "no" if the description explicitly mentions a restriction that would exclude a foreign candidate: a specific country/region requirement ("must be based in the US", "EU residents only"), visa/sponsorship refusal ("we do not sponsor work visas", "must have existing work authorization in X"), or a blocking timezone overlap ("must overlap 9am–5pm PST").
- Answer "unclear" if the description contains NO clear signal either way — NEVER GUESS. The word "remote" alone is "unclear", not "yes". Most real postings with no specific geographic statement should be "unclear".
- Base your answer ONLY on the real text below. Never assume or infer about the company.

SIGNALS RULES (for the "signals" array):
- Provide 2–3 short strings (max ~10 words each) that explain WHY you chose this status.
- For "yes": cite the exact phrase or paraphrase that signals openness. E.g. "States 'work from anywhere'", "Explicitly global hiring".
- For "no": cite the exact restriction. E.g. "Requires US work authorization", "Must overlap 9am–5pm PST", "EU residents only".
- For "unclear": state what is absent. E.g. "No geographic restriction mentioned", "No mention of visa/sponsorship policy", "Remote scope not specified".
- NEVER invent signals not supported by the text. NEVER pad to 3 if 2 honest signals exist.

Job title: ${title}
Description: ${description}

Return a JSON object with this exact structure:
{
  "status": "yes" | "no" | "unclear",
  "reason": "<one internal sentence citing the exact phrase or absence of signal>",
  "signals": ["<short signal 1>", "<short signal 2>"]
}`
}

function normalize(raw: unknown): CrossBorderClassification {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const status = VALID_STATUSES.includes(obj.status as CrossBorderStatus) ? (obj.status as CrossBorderStatus) : 'unclear'
  const reason = typeof obj.reason === 'string' && obj.reason.trim() ? obj.reason.trim() : ''
  const rawSignals = Array.isArray(obj.signals) ? obj.signals : []
  const signals = rawSignals
    .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
    .slice(0, 3)
    .map((s) => s.trim())
  return { status, reason, signals }
}

export async function classifyCrossBorder(title: string, description: string): Promise<CrossBorderClassification> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new CrossBorderError('OpenAI not configured', 503)

  const client = new OpenAI({ apiKey })
  try {
    const res = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: buildPrompt(title, description) }],
      max_tokens: 300,
      response_format: { type: 'json_object' },
    })
    const raw = res.choices?.[0]?.message?.content ?? '{}'
    return normalize(JSON.parse(raw))
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Cross-border classification failed'
    throw new CrossBorderError(msg, 502)
  }
}
