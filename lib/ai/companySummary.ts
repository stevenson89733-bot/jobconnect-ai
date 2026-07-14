// Company Profile's "Culture & Overview" — reuses researchCompany() (the
// same Tavily search + relevance-verification guard already built for Cover
// Letter's Company Research) and adds one small synthesis step: turning the
// real, sourced snippets into a short readable paragraph. Same
// anti-fabrication discipline throughout — the model is only ever shown the
// real snippets and told to use nothing beyond them.
//
// Deliberately independent of lib/ai/generate.ts's resolveProvider(): this
// runs for anonymous page visitors (no session to check premium status
// against) and is cached/amortized across many views, so it always uses the
// cheaper free-tier model rather than gating on a user's premium status.

import OpenAI from 'openai'
import { researchCompany, type CompanySource } from './companyResearch'

export type CompanySummaryResult =
  | { found: true; summary: string; sources: CompanySource[] }
  | { found: false }

async function synthesize(companyName: string, researchSummary: string): Promise<string | null> {
  const apiKey = process.env.MISTRAL_API_KEY
  if (!apiKey) return null

  const prompt = `You are writing a short, factual "Company Overview" for a job platform. You must use ONLY the real, sourced facts below — do not add, infer, or embellish anything beyond what is literally stated, even if it sounds plausible.

STRICT RULES:
- Use ONLY the facts in "Real Research" below. Do not invent culture, values, awards, or news not present there.
- If the research is thin, write a shorter, honest overview — do not pad it with generic filler ("innovative company focused on excellence" etc.) to sound more complete.
- 2-4 sentences, neutral and factual tone, third person.

Company: ${companyName}
Real Research (sourced from web search):
${researchSummary}

Return a JSON object: { "summary": "<2-4 sentence overview using ONLY the facts above>" }`

  try {
    const client = new OpenAI({ apiKey, baseURL: 'https://api.mistral.ai/v1' })
    const res = await client.chat.completions.create({
      model: 'mistral-small-latest',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      response_format: { type: 'json_object' },
    })
    const raw = res.choices?.[0]?.message?.content ?? '{}'
    const data = JSON.parse(raw) as { summary?: unknown }
    const summary = typeof data.summary === 'string' ? data.summary.trim() : ''
    return summary || null
  } catch (err) {
    console.error('[companySummary]', err instanceof Error ? err.message : 'synthesis failed')
    return null
  }
}

export async function buildCompanySummary(companyName: string): Promise<CompanySummaryResult> {
  const research = await researchCompany(companyName)
  if (!research.found) return { found: false }

  // If synthesis fails (no Mistral key, API error), fall back to the real
  // research snippets as-is rather than discarding real, verified facts —
  // less polished, never fabricated either way.
  const summary = (await synthesize(companyName, research.summary)) ?? research.summary
  return { found: true, summary, sources: research.sources }
}
