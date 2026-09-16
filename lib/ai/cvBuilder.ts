import { createPremiumOpenAIClient, AiConfigError } from './openaiClient'
import { getPromptLanguageName } from './promptLocale'

export class CvBuilderError extends Error {
  status: number
  constructor(message: string, status = 500) {
    super(message)
    this.status = status
  }
}

// ── Mode 1: Improve ─────────────────────────────────────────────────────────

export type CvScoreBreakdown = {
  clarity: number
  ats: number
  impact: number
  keywords: number
}

export type CvSection = {
  name: string
  original: string
  suggestions: string[]
  rewritten: string
}

export type CvImprovementResult = {
  overallScore: number
  scoreBreakdown: CvScoreBreakdown
  sections: CvSection[]
}

function buildImprovePrompt(cvText: string, languageName: string): string {
  return `You are an expert CV coach, ATS specialist, and senior recruiter. Analyze the CV text provided and return a structured improvement report.

LANGUAGE: Write all explanatory text, suggestions, and rewrites entirely in ${languageName}.

CV TEXT:
${cvText.slice(0, 10000)}

Return a JSON object with EXACTLY this structure (no extra keys):
{
  "overallScore": <integer 0-100>,
  "scoreBreakdown": {
    "clarity": <integer 0-100, how clear and readable the CV is>,
    "ats": <integer 0-100, ATS parseability — no tables, graphics, proper section headers>,
    "impact": <integer 0-100, use of strong action verbs and quantifiable achievements>,
    "keywords": <integer 0-100, keyword density relative to a typical role in this field>
  },
  "sections": [
    {
      "name": "<section name, e.g. 'Professional Summary', 'Work Experience', 'Skills', 'Education'>",
      "original": "<verbatim extract of this section from the CV, max 400 chars>",
      "suggestions": ["<specific suggestion 1>", "<specific suggestion 2>", "<up to 3 suggestions>"],
      "rewritten": "<improved rewrite of this section with stronger impact language, or empty string if already strong>"
    }
  ]
}

Rules:
- Include 3-6 sections found in the CV (skip empty sections).
- Keep "original" verbatim from the input, truncated to 400 chars.
- "rewritten" must be a genuinely better version — use action verbs, add implied metrics where reasonable, tighten language. Empty string only if already excellent.
- "suggestions" must reference the actual text, not generic advice.
- Scores reflect the document as written, not a hypothetical.`
}

export async function generateCvImprovement(cvText: string): Promise<CvImprovementResult> {
  const openai = createPremiumOpenAIClient()
  const languageName = getPromptLanguageName()

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: buildImprovePrompt(cvText, languageName) }],
    temperature: 0.2,
    response_format: { type: 'json_object' },
  })

  const raw = completion.choices[0]?.message?.content ?? '{}'
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new CvBuilderError('Failed to parse AI response', 502)
  }

  const p = parsed as Record<string, unknown>
  const bd = (p.scoreBreakdown ?? {}) as Record<string, unknown>

  return {
    overallScore: typeof p.overallScore === 'number' ? Math.min(100, Math.max(0, Math.round(p.overallScore))) : 50,
    scoreBreakdown: {
      clarity: typeof bd.clarity === 'number' ? Math.round(bd.clarity) : 50,
      ats: typeof bd.ats === 'number' ? Math.round(bd.ats) : 50,
      impact: typeof bd.impact === 'number' ? Math.round(bd.impact) : 50,
      keywords: typeof bd.keywords === 'number' ? Math.round(bd.keywords) : 50,
    },
    sections: Array.isArray(p.sections)
      ? (p.sections as Record<string, unknown>[]).slice(0, 8).map((s) => ({
          name: typeof s.name === 'string' ? s.name : 'Section',
          original: typeof s.original === 'string' ? s.original : '',
          suggestions: Array.isArray(s.suggestions)
            ? (s.suggestions as unknown[]).filter((x): x is string => typeof x === 'string').slice(0, 3)
            : [],
          rewritten: typeof s.rewritten === 'string' ? s.rewritten : '',
        }))
      : [],
  }
}

// ── Mode 2: Generate ─────────────────────────────────────────────────────────

export type CvGenerateInput = {
  fullName: string
  email: string
  phone: string
  title: string
  yearsExperience: string
  skills: string
  education: string
  experience: string
  languages: string
  targetJobCategory: string
  targetCountries: string
}

export type CvGenerateResult = {
  summary: string
  experience: string
  skills: string
  education: string
  languages: string
  additionalSections: string
}

const COUNTRY_NAMES: Record<string, string> = {
  US: 'United States', UK: 'United Kingdom', CA: 'Canada', DE: 'Germany', FR: 'France',
  AU: 'Australia', NL: 'Netherlands', SE: 'Sweden', CH: 'Switzerland', SG: 'Singapore',
}

function buildGeneratePrompt(input: CvGenerateInput): string {
  const countryList = input.targetCountries
    .split(',')
    .map((c) => COUNTRY_NAMES[c.trim()] ?? c.trim())
    .filter(Boolean)
    .join(', ') || 'International'

  return `You are an expert CV writer specializing in ATS-optimized, cross-border professional CVs.

Generate a complete, professional CV tailored for:
- Target role category: ${input.targetJobCategory || 'General Professional'}
- Target markets: ${countryList}

Candidate profile:
- Name: ${input.fullName || 'Candidate'}
- Title: ${input.title || 'Professional'}
- Years of experience: ${input.yearsExperience || 'Not specified'}
- Skills: ${input.skills || 'Not specified'}
- Education: ${input.education || 'Not specified'}
- Experience: ${input.experience || 'Not specified'}
- Languages: ${input.languages || 'Not specified'}

Return a JSON object with EXACTLY this structure:
{
  "summary": "<3-4 sentence professional summary tailored to the target role category and markets, using strong opening keywords>",
  "experience": "<reformatted work experience with strong action verbs, implied metrics, consistent date format — plain text with \\n line breaks>",
  "skills": "<curated, ATS-optimized skills list — technical first, then soft skills, comma-separated or grouped with \\n>",
  "education": "<formatted education section — plain text with \\n>",
  "languages": "<formatted languages with proficiency levels>",
  "additionalSections": "<any other relevant content such as certifications, publications, volunteering — or empty string>"
}

Rules:
- Use strong action verbs (Led, Delivered, Built, Optimized, etc.)
- Ensure ATS compatibility: no special characters, clean formatting
- Tailor keyword choices to ${countryList} market conventions
- If experience is thin, expand on transferable skills and education
- Plain text only — no markdown asterisks, no HTML`
}

export async function generateCvContent(input: CvGenerateInput): Promise<CvGenerateResult> {
  const openai = createPremiumOpenAIClient()

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: buildGeneratePrompt(input) }],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  })

  const raw = completion.choices[0]?.message?.content ?? '{}'
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new CvBuilderError('Failed to parse AI response', 502)
  }

  const p = parsed as Record<string, unknown>
  const str = (key: string) => (typeof p[key] === 'string' ? p[key] as string : '')

  return {
    summary: str('summary'),
    experience: str('experience'),
    skills: str('skills'),
    education: str('education'),
    languages: str('languages'),
    additionalSections: str('additionalSections'),
  }
}
