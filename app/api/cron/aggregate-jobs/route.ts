import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { fetchJobs as fetchCareerjet } from '@/lib/aggregators/careerjet'
import { fetchJobs as fetchRemotivo }  from '@/lib/aggregators/wellfound'  // Remotive public API
import { fetchJobs as fetchNodesk }    from '@/lib/aggregators/nodesk'
import { fetchJobs as fetchRemoteco }  from '@/lib/aggregators/remoteco'

// Vercel Hobby cron limit is 10s — keep all fetches parallel and tight.
export const maxDuration = 10

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  const [careerjetResult, remotiveResult, nodeskResult, remotecoResult] =
    await Promise.allSettled([
      fetchCareerjet(),
      fetchRemotivo(),
      fetchNodesk(),
      fetchRemoteco(),
    ])

  const counts = { careerjet: 0, remotive2: 0, nodesk: 0, remoteco: 0 }

  async function upsertJobs(
    source: keyof typeof counts,
    result: PromiseSettledResult<Awaited<ReturnType<typeof fetchCareerjet>>>
  ) {
    if (result.status === 'rejected') {
      console.error(`[aggregate-jobs] ${source} fetch failed:`, result.reason)
      return
    }

    const jobs = result.value.filter((j) => j.title && j.url)
    if (jobs.length === 0) return

    // Batch dedup: fetch all existing URLs in one query instead of 2 per job.
    const urls = jobs.map((j) => j.url)
    const { data: existing } = await supabase
      .from('jobs')
      .select('apply_url')
      .in('apply_url', urls)

    const existingUrls = new Set((existing ?? []).map((r) => r.apply_url as string))

    for (const job of jobs) {
      if (existingUrls.has(job.url)) continue

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
          is_cross_border:         job.is_cross_border ?? false,
          cross_border_status:     job.is_cross_border ? 'yes' : null,
          cross_border_confidence: job.is_cross_border ? 'medium' : 'low',
        },
        { onConflict: 'apply_url', ignoreDuplicates: true }
      )

      if (error) {
        console.error(`[aggregate-jobs] ${source} upsert error:`, error.message)
      } else {
        counts[source]++
      }
    }
  }

  await Promise.all([
    upsertJobs('careerjet',  careerjetResult),
    upsertJobs('remotive2',  remotiveResult),
    upsertJobs('nodesk',     nodeskResult),
    upsertJobs('remoteco',   remotecoResult),
  ])

  console.log('[aggregate-jobs] done', counts)
  return NextResponse.json({ success: true, counts })
}
