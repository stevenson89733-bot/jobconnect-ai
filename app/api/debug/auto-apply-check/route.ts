import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Temporary debug endpoint — remove after auto-apply is confirmed working
export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET
  const auth = req.headers.get('authorization')
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const TEST_USER_ID = '4090936e-f89c-4da0-9ffd-b7244c221814'
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  const [
    { data: settings, error: settingsError },
    { data: profile, error: profileError },
    { data: recentJobs, error: jobsError },
    { data: todayLogs, error: logsError },
  ] = await Promise.all([
    supabase.from('auto_apply_settings').select('user_id, is_active, max_applications_per_day, min_match_score'),
    supabase.from('profiles')
      .select('user_id, email, is_premium, candidate_plan, auto_apply_review_mode, cv_url')
      .eq('user_id', TEST_USER_ID)
      .single(),
    supabase.from('jobs')
      .select('id, cross_border_status, apply_url')
      .eq('is_active', true)
      .gte('created_at', yesterday.toISOString())
      .limit(50),
    supabase.from('auto_apply_log')
      .select('id')
      .eq('user_id', TEST_USER_ID)
      .gte('applied_at', new Date(new Date().setHours(0,0,0,0)).toISOString()),
  ])

  const isPremium = profile?.is_premium === true || ['pro', 'elite'].includes(profile?.candidate_plan ?? '')

  const crossBorderCounts = (recentJobs ?? []).reduce((acc, j) => {
    const k = j.cross_border_status ?? 'null'
    acc[k] = (acc[k] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  const greenhouseJobs = (recentJobs ?? []).filter(j => j.apply_url?.includes('greenhouse.io'))

  return NextResponse.json({
    auto_apply_settings: {
      rows: settings ?? [],
      error: settingsError?.message ?? null,
      test_user_row: settings?.find(s => s.user_id === TEST_USER_ID) ?? null,
    },
    profile: {
      data: profile ? { ...profile, cv_url: profile.cv_url ? '[SET]' : null } : null,
      error: profileError?.message ?? null,
      isPremium_computed: isPremium,
    },
    jobs_last_24h: {
      total: recentJobs?.length ?? 0,
      error: jobsError?.message ?? null,
      cross_border_status_breakdown: crossBorderCounts,
      greenhouse_count: greenhouseJobs.length,
      sample_greenhouse: greenhouseJobs.slice(0, 2).map(j => ({ id: j.id, apply_url: j.apply_url, cross_border_status: j.cross_border_status })),
    },
    today_log_count: {
      count: todayLogs?.length ?? 0,
      error: logsError?.message ?? null,
    },
  })
}
