export const runtime = 'nodejs'
export const maxDuration = 60

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { effectiveCandidatePlan } from '@/lib/adminAccess'
import OpenAI from 'openai'

// pdfjs-dist polyfill (same as /api/cv/parse)
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

type Extracted = {
  first_name?: string
  last_name?: string
  phone?: string
  title?: string
  location?: string
  summary?: string
  skills?: string[]
  languages?: string[]
  years_of_experience?: number
  linkedin_url?: string
  github_url?: string
}

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, is_premium, candidate_plan')
    .eq('user_id', user.id)
    .single()

  const plan = effectiveCandidatePlan(profile ?? {})
  const allowed = profile?.is_admin || profile?.is_premium || ['pro', 'elite'].includes(plan)
  if (!allowed) {
    return NextResponse.json({ error: 'Pro plan required', upgrade: true }, { status: 403 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'AI not configured' }, { status: 503 })

  let cv_url: string
  try {
    const body = await req.json()
    cv_url = body.cv_url
    if (!cv_url) throw new Error('missing cv_url')
  } catch {
    return NextResponse.json({ error: 'Missing cv_url in request body' }, { status: 400 })
  }

  // Fetch and extract text from PDF
  let text: string
  try {
    const response = await fetch(cv_url)
    if (!response.ok) return NextResponse.json({ error: 'Could not fetch CV' }, { status: 422 })
    const pdfBuffer = Buffer.from(await response.arrayBuffer())
    const { extractText } = require('unpdf') as { extractText: (data: Uint8Array, opts: { mergePages: boolean }) => Promise<{ text: string }> }
    const result = await extractText(new Uint8Array(pdfBuffer), { mergePages: true })
    text = result.text ?? ''
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to read CV' }, { status: 422 })
  }

  if (!text.trim()) {
    return NextResponse.json({ error: 'Could not extract text from this CV' }, { status: 422 })
  }

  // Call OpenAI
  const openai = new OpenAI({ apiKey })

  let extracted: Extracted
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: `Extract the following fields from this CV/resume. Return a JSON object only, no markdown, no explanation. Fields: { first_name, last_name, phone, title (current job title), location (city, country), summary (2-3 sentences professional summary), skills (array of strings, max 10), languages (array of strings), years_of_experience (number), linkedin_url, github_url }\n\nCV text:\n${text.slice(0, 12000)}`,
        },
      ],
      temperature: 0,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0]?.message?.content ?? '{}'
    extracted = JSON.parse(raw) as Extracted
  } catch (err) {
    console.error('[cv/extract-profile] OpenAI error:', err instanceof Error ? err.message : 'unknown')
    return NextResponse.json({ success: false, error: 'Could not parse CV' }, { status: 502 })
  }

  // Build update object — only non-null/non-empty fields, never overwrite email
  const update: Record<string, unknown> = {}

  const fullName = [extracted.first_name, extracted.last_name].filter(Boolean).join(' ').trim()
  if (fullName) update.full_name = fullName
  if (extracted.phone)              update.phone = extracted.phone
  if (extracted.title)              update.title = extracted.title
  if (extracted.location)           update.location = extracted.location
  if (extracted.linkedin_url)       update.linkedin_url = extracted.linkedin_url
  if (extracted.github_url)         update.github_url = extracted.github_url
  if (Array.isArray(extracted.skills) && extracted.skills.length > 0) {
    update.skills = extracted.skills.slice(0, 10).join(', ')
  }
  if (Array.isArray(extracted.languages) && extracted.languages.length > 0) {
    update.languages = extracted.languages
  }
  if (typeof extracted.years_of_experience === 'number') {
    update.years_experience = extracted.years_of_experience
  }

  if (Object.keys(update).length > 0) {
    const adminClient = createAdminClient()
    const { error: upsertError } = await adminClient
      .from('profiles')
      .update(update)
      .eq('user_id', user.id)

    if (upsertError) {
      console.error('[cv/extract-profile] profile update error:', upsertError.message)
    }
  }

  return NextResponse.json({ success: true, extracted })
}
