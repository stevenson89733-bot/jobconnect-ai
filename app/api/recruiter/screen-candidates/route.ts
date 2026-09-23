export const maxDuration = 10

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as svc } from '@supabase/supabase-js'
import { effectiveEmployerPlan } from '@/lib/adminAccess'
import OpenAI from 'openai'

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('employer_plan, is_admin, role')
    .eq('user_id', user.id)
    .single()

  if (profile?.role !== 'employer' && !profile?.is_admin) {
    return NextResponse.json({ error: 'Employers only' }, { status: 403 })
  }
  if (effectiveEmployerPlan(profile ?? {}) !== 'pro') {
    return NextResponse.json({ error: 'Pro plan required' }, { status: 403 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'AI not configured' }, { status: 503 })

  const body = await req.json().catch(() => ({}))
  const { job_id } = body as { job_id?: string }
  if (!job_id) return NextResponse.json({ error: 'job_id required' }, { status: 400 })

  // Fetch job
  const admin = svc(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: job } = await admin.from('jobs').select('title, description, tags').eq('id', job_id).eq('posted_by', user.id).single()
  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

  // Fetch applications with candidate profiles
  const { data: applications } = await admin
    .from('applications')
    .select('id, candidate_id, message')
    .eq('job_id', job_id)
    .limit(20)

  if (!applications?.length) return NextResponse.json({ rankings: [] })

  const candidateIds = applications.map(a => a.candidate_id)
  const { data: profiles } = await admin
    .from('profiles')
    .select('user_id, full_name, title, skills, experience, years_experience, bio')
    .in('user_id', candidateIds)

  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.user_id, p]))

  // Build AI prompt
  const openai = new OpenAI({ apiKey })
  const candidates = applications.map(a => {
    const p = profileMap[a.candidate_id] ?? {}
    return {
      id: a.id,
      name: p.full_name ?? 'Unknown',
      title: p.title ?? '',
      skills: p.skills ?? '',
      experience: p.experience ? String(p.experience).slice(0, 500) : '',
      years: p.years_experience ?? 0,
      bio: p.bio?.slice(0, 200) ?? '',
      cover: a.message?.slice(0, 300) ?? '',
    }
  })

  const prompt = `You are an expert recruiter. Score each candidate 0-100 for this job and give a one-sentence reason.

Job: ${job.title}
Requirements: ${job.tags?.join(', ') || ''}
Description: ${String(job.description ?? '').slice(0, 800)}

Candidates:
${candidates.map((c, i) => `${i + 1}. ${c.name} | ${c.years}y exp | Skills: ${c.skills.slice(0, 100)} | ${c.bio}`).join('\n')}

Return ONLY a JSON array: [{"id":"<application_id>","score":<0-100>,"reason":"<1 sentence>"}]
Order by score descending.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0,
    max_tokens: 600,
    response_format: { type: 'json_object' },
  })

  let rankings: { id: string; score: number; reason: string }[] = []
  try {
    const raw = completion.choices[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(raw)
    // Handle both {rankings:[...]} and [...] formats
    rankings = Array.isArray(parsed) ? parsed : (parsed.rankings ?? parsed.candidates ?? [])
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 502 })
  }

  // Attach candidate name for display
  const enriched = rankings.map(r => {
    const app = applications.find(a => a.id === r.id)
    const p = app ? profileMap[app.candidate_id] : null
    return { ...r, name: p?.full_name ?? 'Unknown', title: p?.title ?? '' }
  })

  return NextResponse.json({ rankings: enriched })
}
