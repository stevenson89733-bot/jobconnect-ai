import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

export const runtime = 'nodejs'
export const maxDuration = 10

// pdfjs-dist (used by unpdf) calls DOMMatrix which Node.js doesn't expose globally.
// A minimal polyfill is sufficient for text extraction (no canvas rendering).
if (typeof globalThis.DOMMatrix === 'undefined') {
  // biome-ignore lint: polyfill for pdfjs-dist in Node.js
  ;(globalThis as Record<string, unknown>).DOMMatrix = class DOMMatrix {
    a=1; b=0; c=0; d=1; e=0; f=0
    multiply() { return this }
    translate() { return this }
    scale() { return this }
    rotate() { return this }
    inverse() { return this }
    transformPoint(p: unknown) { return p }
  }
}

const MAX_FILE_BYTES = 5 * 1024 * 1024 // 5 MB

export type CvExtracted = {
  full_name: string
  email: string
  phone: string
  title: string
  years_experience: number | null
  skills: string[]
  education: { degree: string; institution: string; year: string }[]
  experience: { company: string; title: string; start: string; end: string; description: string }[]
  languages: string[]
  job_categories: string[]
}

async function extractText(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === 'application/pdf') {
    // unpdf is serverless-safe (no DOMMatrix/canvas dependency)
    const { extractText } = require('unpdf') as { extractText: (data: Uint8Array, opts: { mergePages: boolean }) => Promise<{ text: string }> }
    const result = await extractText(new Uint8Array(buffer), { mergePages: true })
    return result.text ?? ''
  }

  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword'
  ) {
    const mammoth = require('mammoth') as { extractRawText: (o: { buffer: Buffer }) => Promise<{ value: string }> }
    const result = await mammoth.extractRawText({ buffer })
    return result.value ?? ''
  }

  throw new Error('Unsupported file type. Upload a PDF or DOCX.')
}

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'AI not configured' }, { status: 503 })

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid request — expected multipart/form-data' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: 'File too large. Maximum size is 5 MB.' }, { status: 413 })
  }

  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
  ]
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Unsupported file type. Upload a PDF or DOCX.' }, { status: 415 })
  }

  let text: string
  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    text = await extractText(buffer, file.type)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to read file' },
      { status: 422 }
    )
  }

  if (!text.trim()) {
    return NextResponse.json({ error: 'Could not extract text from this file. Try a different format.' }, { status: 422 })
  }

  // Truncate to ~12k chars to stay comfortably within token limits
  const truncatedText = text.slice(0, 12000)

  const openai = new OpenAI({ apiKey })

  const systemPrompt = `You are a CV parser. Extract structured data from the CV text provided and return ONLY valid JSON matching this schema exactly:
{
  "full_name": string,
  "email": string,
  "phone": string,
  "title": string (current or most recent job title),
  "years_experience": number | null (total years of professional experience, integer),
  "skills": string[] (technical and professional skills, comma-separated items),
  "education": [{ "degree": string, "institution": string, "year": string }],
  "experience": [{ "company": string, "title": string, "start": string, "end": string, "description": string }],
  "languages": string[] (spoken languages e.g. ["English", "French"]),
  "job_categories": string[] (one or more of: Engineering, Design, Marketing, Sales, Finance, Operations, Other)
}
Rules:
- Use empty string "" for missing text fields, null for missing numbers, [] for missing arrays.
- Dates in start/end should be "Month Year" or "Year" format. Use "Present" for current roles.
- Keep descriptions concise (max 2 sentences per role).
- Return only the JSON object, no markdown, no explanation.`

  let extracted: CvExtracted
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: truncatedText },
      ],
      temperature: 0,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0]?.message?.content ?? '{}'
    extracted = JSON.parse(raw) as CvExtracted
  } catch (err) {
    console.error('[cv/parse] OpenAI error:', err)
    return NextResponse.json({ error: 'Failed to parse CV with AI. Please try again.' }, { status: 502 })
  }

  return NextResponse.json({ extracted })
}
