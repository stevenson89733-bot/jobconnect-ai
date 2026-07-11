import OpenAI from 'openai'

/**
 * Shared premium-tier OpenAI client construction — used by every AI feature
 * that is GPT-4o/premium-only (Career Coach, Resume Analysis). The existing
 * dual-provider tier router in lib/ai/generate.ts (Resume Builder / Cover
 * Letter generation) is intentionally left untouched by this file — it has
 * its own free-tier Mistral branch that this simpler helper doesn't need.
 */
export class AiConfigError extends Error {
  status = 503
}

export function createPremiumOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new AiConfigError('OpenAI not configured')
  return new OpenAI({ apiKey })
}
