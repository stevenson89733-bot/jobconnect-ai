import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { matchExplanation } from '@/lib/ai/matchExplanation'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

export const maxDuration = 30

export async function POST(req: Request) {
  // Auth
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Rate limit: 20 calls/minute per user
  const rl = rateLimit(`match-explanation:${user.id}`, 20, 60_000)
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Too many requests', retryAfter: rl.retryAfterSeconds },
      { status: 429 }
    )
  }
  const ipRl = rateLimit(`match-explanation-ip:${getClientIp()}`, 40, 60_000)
  if (!ipRl.ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  let job_id: string
  let matchScore: number
  try {
    const body = await req.json()
    if (!body?.job_id || typeof body.job_id !== 'string') throw new Error('missing job_id')
    job_id = body.job_id
    matchScore = typeof body.match_score === 'number' ? body.match_score : 100
  } catch {
    return NextResponse.json({ error: 'Missing or invalid job_id' }, { status: 400 })
  }

  const adminClient = createAdminClient()

  // Fetch profile and job in parallel
  const [{ data: profile }, { data: job }] = await Promise.all([
    adminClient
      .from('profiles')
      .select('title, skills, years_experience, location, work_preference')
      .eq('user_id', user.id)
      .single(),
    adminClient
      .from('jobs')
      .select('title, description, tags, job_type, cross_border_status')
      .eq('id', job_id)
      .single(),
  ])

  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

  const result = await matchExplanation(profile ?? {}, job, matchScore)

  if (!result) {
    return NextResponse.json({ strengths: null, gaps: null })
  }

  return NextResponse.json({ strengths: result.strengths, gaps: result.gaps })
}
