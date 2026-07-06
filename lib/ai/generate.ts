import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'

/**
 * Tier-based AI routing.
 *
 * A single entry point per tool (generateResume / generateCoverLetter) reads
 * `is_premium` SERVER-SIDE and routes the request:
 *   - premium → OpenAI (gpt-4o, existing OPENAI_API_KEY)
 *   - free    → Mistral (mistral-small-latest, MISTRAL_API_KEY), through the
 *               OpenAI SDK against Mistral's OpenAI-compatible endpoint.
 *
 * Both providers use response_format json_object to guarantee structured JSON,
 * and every call is wrapped so failures return NextResponse.json({ error }, …)
 * with a real status — never a 500 with an empty body.
 */

class AiError extends Error {
  status: number
  constructor(message: string, status = 500) {
    super(message)
    this.status = status
  }
}

type ResumeInput = {
  targetRole?: string
  experience?: string
  skills?: string
  education?: string
  summary?: string
}

type CoverLetterInput = {
  targetRole?: string
  company?: string
  strengths?: string
  tone?: string
}

type Provider = { client: OpenAI; model: string; tier: 'premium' | 'free' }

// Reads the current user's premium status server-side and returns the provider.
async function resolveProvider(): Promise<Provider> {
  let isPremium = false
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('is_premium')
        .eq('user_id', user.id)
        .single()
      isPremium = data?.is_premium ?? false
    }
  } catch {
    // No session / Supabase unavailable → treat as free tier
  }

  if (isPremium) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) throw new AiError('OpenAI not configured', 503)
    return { client: new OpenAI({ apiKey }), model: 'gpt-4o', tier: 'premium' }
  }

  const apiKey = process.env.MISTRAL_API_KEY
  if (!apiKey) throw new AiError('Mistral not configured', 503)
  return {
    client: new OpenAI({ apiKey, baseURL: 'https://api.mistral.ai/v1' }),
    model: 'mistral-small-latest',
    tier: 'free',
  }
}

// Runs the prompt on the tier-appropriate provider and parses the JSON result.
async function completeJson(prompt: string, maxTokens: number): Promise<unknown> {
  const { client, model } = await resolveProvider()
  const res = await client.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: maxTokens,
    response_format: { type: 'json_object' },
  })
  const raw = res.choices?.[0]?.message?.content ?? '{}'
  return JSON.parse(raw)
}

function buildResumePrompt({ targetRole, experience, skills, education, summary }: ResumeInput): string {
  return `You are an expert resume writer and ATS optimization specialist. Generate a professional, ATS-optimized resume and a resume score.

Target Job Title: ${targetRole}
Work Experience: ${experience}
Skills: ${skills || 'Not provided'}
Education: ${education || 'Not provided'}
Professional Summary: ${summary || 'Not provided'}

Return a JSON object with this exact structure:
{
  "score": <integer 0-100 representing ATS optimization score>,
  "scoreBreakdown": {
    "keywords": <0-25>,
    "formatting": <0-25>,
    "experience": <0-25>,
    "skills": <0-25>
  },
  "improvements": [<string>, <string>, <string>],
  "resume": {
    "name": "<infer a professional placeholder name or use 'Your Name'>",
    "title": "${targetRole}",
    "contact": "yourname@email.com | linkedin.com/in/yourname | github.com/yourname",
    "summary": "<2-3 sentence professional summary tailored to ${targetRole}, ATS-optimized>",
    "experience": "<formatted work experience with bullet points using action verbs and metrics, markdown-style>",
    "skills": "<comma-separated technical and soft skills relevant to ${targetRole}>",
    "education": "<formatted education section>"
  }
}

IMPORTANT: In the "resume" object, the fields "summary", "experience", "skills", and "education" MUST EACH be a single plain string (markdown-formatted — use "\\n" line breaks and "-" bullet points where useful). NEVER return them as arrays or nested objects.`
}

function buildCoverLetterPrompt({ targetRole, company, strengths, tone }: CoverLetterInput): string {
  return `You are an expert career coach and professional cover letter writer. Generate a compelling, personalized cover letter and a quality score.

Target Job Title: ${targetRole}
Company: ${company}
Candidate Strengths / Key Points: ${strengths || 'Not provided'}
Tone: ${tone || 'Professional and enthusiastic'}

Return a JSON object with this exact structure:
{
  "score": <integer 0-100 representing cover letter quality>,
  "scoreBreakdown": {
    "relevance": <0-25, how well it targets the role and company>,
    "impact": <0-25, strength of achievements and value proposition>,
    "tone": <0-25, appropriateness of tone and voice>,
    "structure": <0-25, clarity and professional formatting>
  },
  "improvements": [<string>, <string>, <string>],
  "letter": {
    "subject": "Application for ${targetRole} — [Candidate Name]",
    "greeting": "Dear Hiring Manager,",
    "opening": "<compelling 2-3 sentence opening paragraph that hooks the reader and states the role>",
    "body": "<2 paragraphs: first highlights the candidate's top strengths and achievements relevant to ${company} and ${targetRole}; second shows knowledge of ${company} and cultural fit>",
    "closing": "<strong closing paragraph with clear call to action>",
    "signature": "Sincerely,\\n[Your Name]\\n[Your Email] | [Your LinkedIn] | [Your Phone]"
  }
}`
}

// Safety net: coerce a value to a readable string if a model returns an array
// or object where a markdown string was requested (Mistral occasionally does).
function coerceToString(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return value.map(coerceToString).filter(Boolean).join('\n')
  if (typeof value === 'object') {
    return Object.values(value as Record<string, unknown>)
      .map(coerceToString)
      .filter(Boolean)
      .join(' · ')
  }
  return String(value)
}

// Force selected nested fields to strings so the client never receives arrays/objects.
function coerceFields(parent: unknown, keys: string[]): void {
  if (!parent || typeof parent !== 'object') return
  const obj = parent as Record<string, unknown>
  for (const key of keys) {
    if (key in obj && typeof obj[key] !== 'string') {
      obj[key] = coerceToString(obj[key])
    }
  }
}

function normalizeResume(data: unknown): unknown {
  if (data && typeof data === 'object' && 'resume' in data) {
    coerceFields((data as { resume: unknown }).resume, ['summary', 'experience', 'skills', 'education'])
  }
  return data
}

function normalizeLetter(data: unknown): unknown {
  if (data && typeof data === 'object' && 'letter' in data) {
    coerceFields((data as { letter: unknown }).letter, ['subject', 'greeting', 'opening', 'body', 'closing', 'signature'])
  }
  return data
}

// Shared error → JSON response mapping (never an empty 500 body).
function toErrorResponse(err: unknown, tag: string): NextResponse {
  const status = err instanceof AiError ? err.status : 500
  const message = err instanceof Error ? err.message : 'Generation failed'
  console.error(`[ai/${tag}]`, message)
  return NextResponse.json({ error: message }, { status })
}

export async function generateResume(input: ResumeInput): Promise<NextResponse> {
  try {
    if (!input.targetRole || !input.experience) {
      return NextResponse.json({ error: 'targetRole and experience are required' }, { status: 400 })
    }
    const data = normalizeResume(await completeJson(buildResumePrompt(input), 2000))
    return NextResponse.json(data)
  } catch (err) {
    return toErrorResponse(err, 'resume')
  }
}

export async function generateCoverLetter(input: CoverLetterInput): Promise<NextResponse> {
  try {
    if (!input.targetRole || !input.company) {
      return NextResponse.json({ error: 'targetRole and company are required' }, { status: 400 })
    }
    const data = normalizeLetter(await completeJson(buildCoverLetterPrompt(input), 1800))
    return NextResponse.json(data)
  } catch (err) {
    return toErrorResponse(err, 'cover-letter')
  }
}
