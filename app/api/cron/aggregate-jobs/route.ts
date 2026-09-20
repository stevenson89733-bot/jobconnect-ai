import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { fetchJobs as fetchCareerjet } from '@/lib/aggregators/careerjet'
import { fetchJobs as fetchWellfound } from '@/lib/aggregators/wellfound'
import { fetchJobs as fetchNodesk }    from '@/lib/aggregators/nodesk'
import { fetchJobs as fetchRemoteco }  from '@/lib/aggregators/remoteco'

export const maxDuration = 60

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  const [careerjetResult, wellfoundResult, nodeskResult, remotecoResult] =
    await Promise.allSettled([
      fetchCareerjet(),
      fetchWellfound(),
      fetchNodesk(),
      fetchRemoteco(),
    ])

  const counts = { careerjet: 0, wellfound: 0, nodesk: 0, remoteco: 0 }

  async function upsertJobs(
    source: keyof typeof counts,
    result: PromiseSettledResult<Awaited<ReturnType<typeof fetchCareerjet>>>
  ) {
    if (result.status === 'rejected') {
      console.error(`[aggregate-jobs] ${source} fetch failed:`, result.reason)
      return
    }

    for (const job of result.value) {
      if (!job.title || !job.url) continue

      const { error } = await supabase.from('jobs').upsert(
        {
          title:        job.title,
          company_name: job.company,
          location:     job.location,
          description:  job.description,
          apply_url:    job.url,
          source:       job.source,
          salary_min:   job.salary_min ?? null,
          salary_max:   job.salary_max ?? null,
          salary_label: null,
          work_type:    'remote',
          job_type:     'Full-time',
          category:     'Engineering',
          tags:         [],
          is_active:    true,
          posted_by:    null,
          is_cross_border:        job.is_cross_border ?? false,
          cross_border_status:    job.is_cross_border ? 'yes' : null,
          cross_border_confidence: job.is_cross_border ? 'medium' : 'low',
        },
        { onConflict: 'apply_url', ignoreDuplicates: false }
      )

      if (error) {
        console.error(`[aggregate-jobs] ${source} upsert error:`, error.message)
      } else {
        counts[source]++
      }
    }
  }

  await Promise.all([
    upsertJobs('careerjet', careerjetResult),
    upsertJobs('wellfound', wellfoundResult),
    upsertJobs('nodesk',    nodeskResult),
    upsertJobs('remoteco',  remotecoResult),
  ])

  console.log('[aggregate-jobs] done', counts)
  return NextResponse.json({ success: true, counts })
}
