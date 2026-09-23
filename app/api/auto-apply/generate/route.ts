import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

export const maxDuration = 10

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { log_id } = await req.json()
  if (!log_id) return NextResponse.json({ error: 'Missing log_id' }, { status: 400 })

  // Verify ownership + fetch job info
  const { data: log } = await supabase
    .from('auto_apply_log')
    .select('id, user_id, job_id, status, cover_letter')
    .eq('id', log_id)
    .eq('user_id', user.id)
    .single()

  if (!log) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (log.cover_letter) return NextResponse.json({ cover_letter: log.cover_letter })

  const { data: job } = await supabase
    .from('jobs')
    .select('title, company_name, description')
    .eq('id', log.job_id)
    .single()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, skills, experience, bio')
    .eq('user_id', user.id)
    .single()

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'OpenAI not configured' }, { status: 503 })

  const openai = new OpenAI({ apiKey })
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  try {
    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'user',
        content: `Write a professional cover letter for this candidate.
Target role: ${job?.title}
Company: ${job?.company_name}
Job description: ${(job?.description ?? '').slice(0, 1500)}
Candidate: ${profile?.full_name}
Skills: ${profile?.skills ?? 'Not provided'}
Experience: ${profile?.experience ?? 'Not provided'}
Bio: ${profile?.bio ?? 'Not provided'}

Return JSON: {"letter":{"greeting":"Dear Hiring Manager,","opening":"...","body":"...","closing":"..."}}
Use only facts from the candidate profile. Do not invent metrics or employers.`,
      }],
      max_tokens: 600,
      response_format: { type: 'json_object' },
    }, { signal: controller.signal })

    clearTimeout(timeout)

    const data = JSON.parse(res.choices?.[0]?.message?.content ?? '{}')
    const l = data.letter ?? {}
    const cover_letter = [l.greeting, l.opening, l.body, l.closing].filter(Boolean).join('\n\n')

    if (!cover_letter) return NextResponse.json({ error: 'Generation failed' }, { status: 500 })

    await supabase
      .from('auto_apply_log')
      .update({ cover_letter })
      .eq('id', log_id)
      .eq('user_id', user.id)

    return NextResponse.json({ cover_letter })
  } catch {
    clearTimeout(timeout)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
