import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { fetchRemotiveJobs, mapRemotiveCategory, mapRemotiveJobType, parseRemotiveSalary } from '@/lib/remotive'
import { detectCrossBorder } from '@/lib/crossBorderDetector'

export const maxDuration = 60

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  let rawJobs: Awaited<ReturnType<typeof fetchRemotiveJobs>>
  try {
    rawJobs = await fetchRemotiveJobs({ limit: 50, timeoutMs: 20000 })
  } catch (err) {
    console.error('[import-remotive] fetch error:', err instanceof Error ? err.message : err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }

  const rows = rawJobs.map((j) => {
    const description = j.description.replace(/<[^>]*>/g, '')
    const location    = j.candidate_required_location ?? 'Remote'
    const { isCrossBorder, confidence } = detectCrossBorder(description, j.title)
    const { min: salaryMin, max: salaryMax } = parseRemotiveSalary(j.salary)

    return {
      title:                   j.title,
      company_name:            j.company_name,
      location,
      description,
      apply_url:               j.url,
      source:                  'remotive',
      external_id:             String(j.id),
      posted_at:               new Date(j.publication_date).toISOString(),
      is_cross_border:         isCrossBorder,
      cross_border_confidence: confidence,
      work_type:               'remote',
      job_type:                mapRemotiveJobType(j.job_type),
      category:                mapRemotiveCategory(j.category),
      tags:                    j.tags.slice(0, 10),
      salary_min:              salaryMin ? parseInt(salaryMin, 10) : null,
      salary_max:              salaryMax ? parseInt(salaryMax, 10) : null,
      salary_label:            j.salary || null,
      is_active:               true,
      posted_by:               null,
      updated_at:              new Date().toISOString(),
    }
  })

  try {
    const { data, error } = await supabase
      .from('jobs')
      .upsert(rows, { onConflict: 'source,external_id', ignoreDuplicates: false })
      .select('id, xmax::text')

    if (error) {
      console.error('[import-remotive] upsert error:', error.message)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const inserted = (data ?? []).filter((r: { xmax: string }) => r.xmax === '0').length
    const updated  = (data ?? []).length - inserted

    return NextResponse.json({ success: true, inserted, updated, total: rows.length })
  } catch (err) {
    console.error('[import-remotive] error:', err instanceof Error ? err.message : err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
