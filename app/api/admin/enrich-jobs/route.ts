export const maxDuration = 10
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { analyzeGeoCompliance } from '@/lib/ai/geoAnalysis'
// CRITIQUE : is_admin === true requis — retourne 403 sinon.
// Enrichit par batch de 10 les jobs remote sans geo_analysis.

const BATCH_SIZE = 3

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('is_admin').eq('user_id', user.id).single()
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { ok } = rateLimit(`admin:enrich-jobs:${user.id ?? getClientIp()}`, 100, 60 * 60 * 1000)
  if (!ok) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })

  const admin = createAdminClient()

  // Jobs remote sans geo_analysis — ordered by created_at desc pour enrichir les plus récents en premier
  const { data: jobs, error } = await admin
    .from('jobs')
    .select('id, title, description, location')
    .eq('work_type', 'remote')
    .is('geo_analysis', null)
    .order('created_at', { ascending: false })
    .limit(BATCH_SIZE)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!jobs || jobs.length === 0) {
    return NextResponse.json({ enriched: 0, remaining: 0 })
  }

  const results = await Promise.allSettled(
    jobs.map(job =>
      analyzeGeoCompliance(job.title, job.description ?? '', job.location ?? '')
        .then(geoResult => admin.from('jobs').update({ geo_analysis: geoResult }).eq('id', job.id))
    )
  )
  let enriched = results.filter(r => r.status === 'fulfilled').length
  results.forEach((r, i) => {
    if (r.status === 'rejected') console.error('[enrich-jobs] failed for job', jobs[i].id, r.reason)
  })

  // Compte les jobs restants à enrichir
  const { count: remaining } = await admin
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('work_type', 'remote')
    .is('geo_analysis', null)

  return NextResponse.json({ enriched, remaining: remaining ?? 0 })
}
