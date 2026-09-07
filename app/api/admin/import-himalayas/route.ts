import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('is_admin').eq('user_id', user.id).single()
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = createAdminClient()
  let imported = 0
  let deduplicated = 0

  try {
    const res = await fetch('https://himalayas.app/jobs/api', {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const jobs = Array.isArray(data) ? data : data.jobs || []

    for (const j of jobs) {
      if (!j.applyUrl || !j.title) continue

      const { data: byUrl } = await admin
        .from('jobs').select('id').eq('apply_url', j.applyUrl).limit(1)
      if (byUrl?.[0]) { deduplicated++; continue }

      const { data: byTitle } = await admin
        .from('jobs').select('id')
        .ilike('title', j.title.trim())
        .ilike('company_name', (j.company?.name || 'Unknown').trim())
        .limit(1)
      if (byTitle?.[0]) { deduplicated++; continue }

      const { error } = await admin.from('jobs').insert({
        title: j.title,
        company_name: j.company?.name || 'Unknown',
        description: j.description || '',
        location: j.location || 'Remote',
        work_type: 'remote',
        job_type: j.jobType || 'Full-time',
        category: j.category || 'Other',
        tags: [],
        apply_url: j.applyUrl,
        source: 'himalayas',
        salary_min: null,
        salary_max: null,
        salary_label: null,
        is_active: true,
        posted_by: null,
      })
      if (error) console.error('[import-himalayas] insert:', error.message)
      else imported++
    }
    return NextResponse.json({ source: 'himalayas', imported, deduplicated })
  } catch (err) {
    console.error('[import-himalayas] error:', err instanceof Error ? err.message : err)
    return NextResponse.json({ source: 'himalayas', imported, deduplicated, error: String(err) })
  }
}
