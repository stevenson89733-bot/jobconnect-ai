import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const maxDuration = 55

const GREENHOUSE_COMPANIES = [
  'gitlab',
  'automattic',
  'zapier',
  'buffer',
  'doist',
  'basecamp',
  'hotjar',
  'toggl',
  'remote',
  'deel',
]

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  let imported = 0
  let deduplicated = 0

  try {
    for (const company of GREENHOUSE_COMPANIES) {
      try {
        const res = await fetch(
          `https://boards-api.greenhouse.io/v1/boards/${company}/jobs?content=true`,
          { signal: AbortSignal.timeout(10000) }
        )

        if (!res.ok) {
          console.warn(`[import-greenhouse] ${company}: HTTP ${res.status}`)
          continue
        }

        const data = await res.json()
        const jobs = data.jobs || []

        for (const j of jobs) {
          if (!j.absolute_url || !j.title) continue

          const { data: byUrl } = await supabase
            .from('jobs').select('id').eq('apply_url', j.absolute_url).limit(1)
          if (byUrl?.[0]) { deduplicated++; continue }

          const { data: byTitle } = await supabase
            .from('jobs').select('id')
            .ilike('title', j.title.trim())
            .ilike('company_name', company.trim())
            .limit(1)
          if (byTitle?.[0]) { deduplicated++; continue }

          const { error } = await supabase.from('jobs').insert({
            title: j.title,
            company_name: company,
            description: j.content || '',
            location: j.location?.name || 'Remote',
            work_type: 'remote',
            job_type: 'Full-time',
            category: 'Other',
            tags: [],
            apply_url: j.absolute_url,
            source: 'greenhouse',
            salary_min: null,
            salary_max: null,
            salary_label: null,
            is_active: true,
            posted_by: null,
          })
          if (error) console.error(`[import-greenhouse] ${company} insert:`, error.message)
          else imported++
        }
      } catch (companyErr) {
        console.error(`[import-greenhouse] ${company}:`, companyErr instanceof Error ? companyErr.message : companyErr)
      }
    }
    return NextResponse.json({ source: 'greenhouse', imported, deduplicated })
  } catch (err) {
    console.error('[import-greenhouse] error:', err instanceof Error ? err.message : err)
    return NextResponse.json({ source: 'greenhouse', imported: 0, deduplicated: 0, error: String(err) })
  }
}
