import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildCareerProgressPoints } from '@/lib/careerProgress'
import { findPriorityGap } from '@/lib/profileCompletion'
import { parseSkillSet, calculateMatchPercent } from '@/lib/jobMatching'

// A real status change counts as "recent" for a couple of weeks — there's
// no "last seen by candidate" timestamp in the schema, so this window
// stands in for it. It only ever reports a status transition that actually
// happened (status_updated_at is set by the real employer status change
// action), never a fabricated one.
const RECENT_STATUS_WINDOW_MS = 14 * 24 * 60 * 60 * 1000
const RECENT_JOB_WINDOW_MS = 7 * 24 * 60 * 60 * 1000
const MATCH_THRESHOLD = 70

export type CopilotSignal =
  | { type: 'appStatus'; company: string; title: string; status: string }
  | { type: 'atsDelta'; from: number; to: number }
  | { type: 'newMatches'; count: number; threshold: number }
  | { type: 'profileGap'; field: 'title' | 'skills' | 'generic' }
  | { type: 'idle' }

// One consolidated read for the Career Copilot widget, built entirely from
// data other real features already compute (Career Progress chart, AI
// Match %, application status, profile completeness) — no new scoring
// system and nothing that isn't traceable to a real query. Candidate-only:
// employers and signed-out visitors get an empty signal list.
export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ signals: [] })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, title, skills, full_name, location, bio, experience, avatar_url, portfolio_url, availability, work_preference, years_experience, is_premium')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'candidate') return NextResponse.json({ signals: [] })

  const [{ data: applications }, { data: analysisHistory }, { data: recentJobs }] = await Promise.all([
    supabase
      .from('applications')
      .select('job_id, status, status_updated_at, jobs!job_id(title, company_name)')
      .eq('candidate_id', user.id)
      .order('status_updated_at', { ascending: false, nullsFirst: false }),
    profile.is_premium
      ? supabase.from('career_analysis').select('analysis_json, generated_at').eq('candidate_id', user.id).order('generated_at', { ascending: true })
      : Promise.resolve({ data: null }),
    supabase
      .from('jobs')
      .select('id, tags, created_at')
      .eq('is_active', true)
      .gte('created_at', new Date(Date.now() - RECENT_JOB_WINDOW_MS).toISOString()),
  ])

  const signals: CopilotSignal[] = []

  // 1. Real application status change, if it happened recently.
  const latestApp = (applications ?? [])[0] as
    | { job_id: string; status: string; status_updated_at: string | null; jobs: { title: string; company_name: string }[] | { title: string; company_name: string } | null }
    | undefined
  if (latestApp?.status_updated_at && latestApp.status !== 'submitted') {
    const age = Date.now() - new Date(latestApp.status_updated_at).getTime()
    if (age >= 0 && age <= RECENT_STATUS_WINDOW_MS) {
      const job = Array.isArray(latestApp.jobs) ? latestApp.jobs[0] : latestApp.jobs
      if (job) signals.push({ type: 'appStatus', company: job.company_name, title: job.title, status: latestApp.status })
    }
  }

  // 2. Real ATS Score delta — same career_analysis rows as the Analytics
  // Career Progress chart, only when there are at least two real data
  // points to compare (Premium-only, same gate as that chart).
  const points = buildCareerProgressPoints(analysisHistory ?? [])
  if (points.length >= 2) {
    const from = points[points.length - 2].atsScore
    const to = points[points.length - 1].atsScore
    if (from !== to) signals.push({ type: 'atsDelta', from, to })
  }

  // 3. Real new job matches — same tag-overlap match % as the Jobs page,
  // restricted to postings created in the last 7 days and jobs the
  // candidate hasn't already applied to.
  const skillSet = parseSkillSet(profile.skills)
  if (skillSet.size > 0) {
    const appliedIds = new Set((applications ?? []).map((a) => a.job_id as string))

    const newMatchCount = (recentJobs ?? []).filter((job) => {
      if (appliedIds.has(job.id)) return false
      const percent = calculateMatchPercent(job.tags, skillSet)
      return percent != null && percent >= MATCH_THRESHOLD
    }).length

    if (newMatchCount > 0) signals.push({ type: 'newMatches', count: newMatchCount, threshold: MATCH_THRESHOLD })
  }

  // 4. Real profile completeness gap — same fields as ProfileCompletionCard.
  const gap = findPriorityGap(profile)
  if (gap) signals.push({ type: 'profileGap', field: gap })

  if (signals.length === 0) signals.push({ type: 'idle' })

  return NextResponse.json({ signals })
}
