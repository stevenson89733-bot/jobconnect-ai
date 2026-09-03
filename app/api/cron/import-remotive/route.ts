import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { fetchRemotiveJobs, mapRemotiveCategory, mapRemotiveJobType, parseRemotiveSalary } from '@/lib/remotive'

// CRITIQUE : protégé par CRON_SECRET — jamais exposé à des non-admins.
// Route utilisée uniquement pour l'import manuel via PostJobModal admin.
// Le cron automatique est désactivé — Remotive dépasse le timeout Vercel Hobby (10s).

export const maxDuration = 10

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  let imported = 0
  let deduplicated = 0

  try {
    const jobs = await fetchRemotiveJobs({ limit: 15, timeoutMs: 6000 })
    for (const j of jobs) {
      const { data: byUrl } = await supabase
        .from('jobs').select('id').eq('apply_url', j.url).limit(1)
      if (byUrl?.[0]) { deduplicated++; continue }

      const { data: byTitle } = await supabase
        .from('jobs').select('id')
        .ilike('title', j.title.trim())
        .ilike('company_name', j.company_name.trim())
        .limit(1)
      if (byTitle?.[0]) { deduplicated++; continue }

      const { min: salaryMin, max: salaryMax } = parseRemotiveSalary(j.salary)
      const { error } = await supabase.from('jobs').insert({
        title: j.title,
        company_name: j.company_name,
        description: j.description,
        location: j.candidate_required_location || 'Worldwide',
        work_type: 'remote',
        job_type: mapRemotiveJobType(j.job_type),
        category: mapRemotiveCategory(j.category),
        tags: j.tags.slice(0, 10),
        apply_url: j.url,
        source: 'remotive',
        salary_min: salaryMin ? parseInt(salaryMin, 10) : null,
        salary_max: salaryMax ? parseInt(salaryMax, 10) : null,
        salary_label: j.salary || null,
        is_active: true,
        posted_by: null,
      })
      if (error) console.error('[import-remotive] insert:', error.message)
      else imported++
    }
    return NextResponse.json({ source: 'remotive', imported, deduplicated })
  } catch (err) {
    console.error('[import-remotive] error:', err instanceof Error ? err.message : err)
    return NextResponse.json({ source: 'remotive', imported: 0, deduplicated: 0, error: String(err) })
  }
}
