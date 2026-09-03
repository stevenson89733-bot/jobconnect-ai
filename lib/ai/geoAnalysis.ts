import OpenAI from 'openai'

/**
 * Geo-Compliance Analyzer — classifies whether a remote job posting is
 * genuinely open worldwide, restricted to a specific region, or "remote"
 * in name only. Runs at job-creation time via GPT-4o-mini (~$0.0002/job).
 *
 * classification:
 *   "true_anywhere"       — No geographic restriction; candidates worldwide welcome
 *   "regional_remote"     — Remote but limited to specific countries/regions
 *   "local_remote_only"   — Requires local presence; flexible hours only
 *
 * eor_contractor_friendly — EOR, contractor, or self-employed arrangements accepted
 * has_tax_restriction     — Must be tax resident in a specific country
 * confidence_score        — 0.0–1.0; badge hidden when < 0.7
 * notes                   — One-sentence internal explanation (not shown to users)
 */

export type GeoClassification = 'true_anywhere' | 'regional_remote' | 'local_remote_only'

export type GeoAnalysis = {
  classification: GeoClassification
  has_tax_restriction: boolean
  eor_contractor_friendly: boolean
  confidence_score: number
  notes: string
}

const VALID_CLASSIFICATIONS: GeoClassification[] = ['true_anywhere', 'regional_remote', 'local_remote_only']

function buildPrompt(title: string, description: string, location: string): string {
  return `You are a geo-compliance analyst evaluating whether a remote job posting is genuinely open to candidates worldwide.

Classify the posting into exactly one category:
- "true_anywhere": No country/region restriction. The job is genuinely open to candidates anywhere in the world. Look for explicit signals: "work from anywhere", "global team", "we hire worldwide", "fully distributed", or simply the complete absence of any geographic restriction.
- "regional_remote": Remote, but limited to specific countries or regions. Examples: "US only", "Europe-based", "LATAM candidates", "must be in the UK", "APAC preferred".
- "local_remote_only": The job is called "remote" but actually requires local presence or frequent on-site visits. Examples: "remote with 20% travel", "must be within commuting distance", "hybrid 2 days/week".

Also detect:
- has_tax_restriction: true if the posting requires the candidate to be a tax resident, W-2 employee, or legally employable in a specific country (e.g. "W-2 only", "must be authorized to work in the US", "requires existing work permit in UK"). false if contractors worldwide or EOR arrangements are possible.
- eor_contractor_friendly: true if the posting explicitly welcomes EOR (Employer of Record), B2B contractors, freelancers, or self-employed arrangements — or if there is no mention of visa/work-authorization requirements at all and the classification is true_anywhere.
- confidence_score: a float from 0.0 to 1.0 reflecting how clearly the posting signals its geographic scope. Score 0.9+ when signals are explicit and unambiguous. Score 0.5–0.7 when you are making an inference. Score below 0.5 when signals are absent or contradictory.
- notes: one short internal sentence (max 20 words) citing the key text or absence of signal.

Job title: ${title}
Location field: ${location}
Description:
${description.slice(0, 3000)}

Return a JSON object with this exact structure:
{
  "classification": "true_anywhere" | "regional_remote" | "local_remote_only",
  "has_tax_restriction": true | false,
  "eor_contractor_friendly": true | false,
  "confidence_score": 0.0–1.0,
  "notes": "<one sentence>"
}`
}

function normalize(raw: unknown): GeoAnalysis {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const classification = VALID_CLASSIFICATIONS.includes(obj.classification as GeoClassification)
    ? (obj.classification as GeoClassification)
    : 'regional_remote'
  const has_tax_restriction = obj.has_tax_restriction === true
  const eor_contractor_friendly = obj.eor_contractor_friendly === true
  const raw_confidence = typeof obj.confidence_score === 'number' ? obj.confidence_score : 0
  const confidence_score = Math.min(1, Math.max(0, raw_confidence))
  const notes = typeof obj.notes === 'string' ? obj.notes.trim().slice(0, 200) : ''
  return { classification, has_tax_restriction, eor_contractor_friendly, confidence_score, notes }
}

export async function analyzeGeoCompliance(
  title: string,
  description: string,
  location: string,
): Promise<GeoAnalysis> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OpenAI not configured')

  const client = new OpenAI({ apiKey })
  const res = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: buildPrompt(title, description, location) }],
    max_tokens: 200,
    response_format: { type: 'json_object' },
  })
  const raw = res.choices?.[0]?.message?.content ?? '{}'
  return normalize(JSON.parse(raw))
}
