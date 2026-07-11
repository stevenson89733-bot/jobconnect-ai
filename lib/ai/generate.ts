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

// Real contact info pulled from the authenticated candidate's own profile —
// never client-submitted (that would let a request claim someone else's
// name/email) and never fabricated by the LLM.
export type ContactInfo = {
  name: string
  email: string
  phone: string
  linkedinUrl: string
  githubUrl: string
  portfolioUrl: string
}

const EMPTY_CONTACT: ContactInfo = { name: '', email: '', phone: '', linkedinUrl: '', githubUrl: '', portfolioUrl: '' }

// Builds the single "email | phone | linkedin | github | portfolio" contact
// line, omitting any field the candidate hasn't set — never a placeholder.
export function formatContactLine(contact: ContactInfo): string {
  return [contact.email, contact.phone, contact.linkedinUrl, contact.githubUrl, contact.portfolioUrl]
    .filter((part) => part.trim().length > 0)
    .join(' | ')
}

// Reads the current user's premium status AND real contact info server-side.
async function resolveProvider(): Promise<Provider & { contact: ContactInfo }> {
  let isPremium = false
  let contact: ContactInfo = EMPTY_CONTACT
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('is_premium, full_name, email, phone, linkedin_url, github_url, portfolio_url')
        .eq('user_id', user.id)
        .single()
      isPremium = data?.is_premium ?? false
      contact = {
        name: data?.full_name?.trim() || user.email?.split('@')[0] || '',
        email: data?.email?.trim() || user.email || '',
        phone: data?.phone?.trim() || '',
        linkedinUrl: data?.linkedin_url?.trim() || '',
        githubUrl: data?.github_url?.trim() || '',
        portfolioUrl: data?.portfolio_url?.trim() || '',
      }
    }
  } catch {
    // No session / Supabase unavailable → treat as free tier, no real contact to show
  }

  if (isPremium) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) throw new AiError('OpenAI not configured', 503)
    return { client: new OpenAI({ apiKey }), model: 'gpt-4o', tier: 'premium', contact }
  }

  const apiKey = process.env.MISTRAL_API_KEY
  if (!apiKey) throw new AiError('Mistral not configured', 503)
  return {
    client: new OpenAI({ apiKey, baseURL: 'https://api.mistral.ai/v1' }),
    model: 'mistral-small-latest',
    tier: 'free',
    contact,
  }
}

// Runs the prompt on the tier-appropriate provider and parses the JSON result.
// Returns the real contact info alongside so callers can inject it themselves
// rather than trusting the model to preserve it verbatim.
async function completeJson(prompt: string, maxTokens: number): Promise<{ data: unknown; contact: ContactInfo }> {
  const { client, model, contact } = await resolveProvider()
  const res = await client.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: maxTokens,
    response_format: { type: 'json_object' },
  })
  const raw = res.choices?.[0]?.message?.content ?? '{}'
  return { data: JSON.parse(raw), contact }
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
    "title": "${targetRole}",
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
    "subject": "Application for ${targetRole}",
    "greeting": "Dear Hiring Manager,",
    "opening": "<compelling 2-3 sentence opening paragraph that hooks the reader and states the role>",
    "body": "<2 paragraphs: first highlights the candidate's top strengths and achievements relevant to ${company} and ${targetRole}; second shows knowledge of ${company} and cultural fit>",
    "closing": "<strong closing paragraph with clear call to action>"
  }
}

Do NOT include a "signature" field — that is added separately from the candidate's real contact info.`
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

// Injects the candidate's real name/contact line into the model's output —
// the model is never asked to produce these, so there's nothing to
// overwrite/trust here, just real profile data filled in after the fact.
function normalizeResume(data: unknown, contact: ContactInfo): unknown {
  if (data && typeof data === 'object' && 'resume' in data) {
    const resume = (data as { resume: unknown }).resume
    coerceFields(resume, ['summary', 'experience', 'skills', 'education'])
    if (resume && typeof resume === 'object') {
      const obj = resume as Record<string, unknown>
      obj.name = contact.name
      obj.contact = formatContactLine(contact)
    }
  }
  return data
}

// Same pattern as normalizeResume — the model never generates the
// signature, so the candidate's real name/contact line (reusing
// formatContactLine, same helper as the resume) is filled in here instead.
function normalizeLetter(data: unknown, contact: ContactInfo): unknown {
  if (data && typeof data === 'object' && 'letter' in data) {
    const letter = (data as { letter: unknown }).letter
    coerceFields(letter, ['subject', 'greeting', 'opening', 'body', 'closing'])
    if (letter && typeof letter === 'object') {
      const obj = letter as Record<string, unknown>
      const contactLine = formatContactLine(contact)
      obj.signature = `Sincerely,\n${contact.name}${contactLine ? `\n${contactLine}` : ''}`
    }
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
    const { data: raw, contact } = await completeJson(buildResumePrompt(input), 2000)
    const data = normalizeResume(raw, contact)
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
    const { data: raw, contact } = await completeJson(buildCoverLetterPrompt(input), 1800)
    const data = normalizeLetter(raw, contact)
    return NextResponse.json(data)
  } catch (err) {
    return toErrorResponse(err, 'cover-letter')
  }
}
