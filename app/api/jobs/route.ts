import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'

const PAGE_SIZE = 20

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = createClient()
  const { data: jobs, count, error } = await supabase
    .from('jobs')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const total = count ?? 0
  return NextResponse.json({
    jobs,
    page,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    total,
  })
}

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single()
  if (profile?.role !== 'employer') {
    return NextResponse.json({ error: 'Only employer accounts can post jobs' }, { status: 403 })
  }

  const body = await req.json()
  const { data: job, error } = await supabase
    .from('jobs')
    .insert({ ...body, posted_by: user.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // New post — invalidate every cached /jobs page immediately rather than
  // waiting out the 60s revalidate window (see app/jobs/page.tsx).
  revalidateTag('jobs')

  return NextResponse.json(job, { status: 201 })
}
