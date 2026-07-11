import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(jobs)
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
  return NextResponse.json(job, { status: 201 })
}
