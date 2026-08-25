import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const jobId = searchParams.get('job')
  const source = searchParams.get('source') ?? 'direct'

  if (!jobId) return NextResponse.redirect(new URL('/', req.url))

  const supabase = createClient()

  const [{ data: job }, { data: { user } }] = await Promise.all([
    supabase.from('jobs').select('apply_url').eq('id', jobId).single(),
    supabase.auth.getUser(),
  ])

  const applyUrl = job?.apply_url
  if (!applyUrl || !/^https?:\/\//i.test(applyUrl)) {
    return NextResponse.redirect(new URL('/jobs', req.url))
  }

  // Log the click — best-effort, never blocks the redirect
  supabase.from('job_clicks').insert({ job_id: jobId, source, user_id: user?.id ?? null }).then(() => {})

  const dest = new URL(applyUrl)
  dest.searchParams.set('utm_source', source)
  dest.searchParams.set('utm_medium', 'jobboard')
  dest.searchParams.set('utm_campaign', 'jobconnect')

  return NextResponse.redirect(dest.toString(), 302)
}
