import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_premium, is_admin')
    .eq('user_id', user.id)
    .single()
  if (!profile?.is_premium && !profile?.is_admin) {
    return NextResponse.json({ error: 'Pro plan required' }, { status: 403 })
  }

  const { ok } = rateLimit(`ai:adapt-cv:${user.id ?? getClientIp()}`, 10, 60 * 60 * 1000)
  if (!ok) return NextResponse.json({ error: 'Rate limit exceeded — try again later' }, { status: 429 })

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'AI not configured' }, { status: 503 })

  const body = await req.json().catch(() => ({}))
  const { candidateProfile, job } = body as {
    candidateProfile?: { resume_text?: string; skills?: string; experience?: string; bio?: string; title?: string }
    job?: { title?: string; company?: string; description?: string; tags?: string[] }
  }

  const jobContext = [
    job?.description?.slice(0, 2000),
    job?.tags?.length ? `Tags: ${job.tags.join(', ')}` : null,
  ].filter(Boolean).join('\n') || 'Not provided'

  const cvContext = [
    candidateProfile?.title ? `Current role: ${candidateProfile.title}` : null,
    candidateProfile?.bio ? `Bio: ${candidateProfile.bio}` : null,
    candidateProfile?.experience ? `Experience:\n${candidateProfile.experience}` : null,
    candidateProfile?.skills ? `Skills: ${candidateProfile.skills}` : null,
    candidateProfile?.resume_text ? `Resume:\n${candidateProfile.resume_text}` : null,
  ].filter(Boolean).join('\n\n') || 'Not provided'

  const prompt = `You are an expert career coach. Your task is to adapt the candidate's profile into a concise, tailored professional summary that highlights their most relevant experience and skills for the specific job below. Write in first person. Be specific and concrete. Maximum 350 words. Do NOT invent any experience, employer, metric, or achievement not present in the candidate profile.

Target: ${job?.title ?? 'Unknown role'} at ${job?.company ?? 'Unknown company'}
Job context: ${jobContext}

Candidate profile:
${cvContext}

Return JSON: { "adaptedCv": "<tailored summary>" }`

  const client = new OpenAI({ apiKey })
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    max_tokens: 600,
    temperature: 0.4,
  })

  const raw = completion.choices[0]?.message?.content ?? '{}'
  let parsed: Record<string, unknown>
  try { parsed = JSON.parse(raw) } catch { parsed = {} }

  return NextResponse.json({ adaptedCv: typeof parsed.adaptedCv === 'string' ? parsed.adaptedCv : '' })
}
