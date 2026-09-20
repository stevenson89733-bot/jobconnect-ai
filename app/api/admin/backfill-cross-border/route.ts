import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// POST /api/admin/backfill-cross-border
// One-time helper: marks obvious remote/worldwide jobs as cross_border_status='yes'
// for jobs the AI classifier has not yet processed (status IS NULL).
// Protected by CRON_SECRET so it can also be called from a cron or CI pipeline.
export async function POST(req: Request) {
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Fetch IDs of unclassified jobs that look remote/worldwide
  const { data: candidates, error: fetchErr } = await supabase
    .from('jobs')
    .select('id')
    .is('cross_border_status', null)
    .or(
      [
        'description.ilike.%remote%',
        'description.ilike.%worldwide%',
        'description.ilike.%visa sponsor%',
        'description.ilike.%work from anywhere%',
        'location.ilike.%remote%',
        'location.ilike.%worldwide%',
        'location.ilike.%anywhere%',
      ].join(',')
    )

  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 500 })
  }

  if (!candidates || candidates.length === 0) {
    return NextResponse.json({ updated: 0, message: 'No unclassified remote jobs found.' })
  }

  const ids = candidates.map((r) => r.id)

  const { error: updateErr } = await supabase
    .from('jobs')
    .update({ cross_border_status: 'yes' })
    .in('id', ids)

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 })
  }

  return NextResponse.json({ updated: ids.length })
}
