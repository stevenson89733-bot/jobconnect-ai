import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST /api/applications — submit an application
export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { job_id, message } = await req.json()
  if (!job_id) return NextResponse.json({ error: 'job_id required' }, { status: 400 })

  const { data, error } = await supabase
    .from('applications')
    .insert({ job_id, candidate_id: user.id, message: message || null })
    .select()
    .single()

  if (error) {
    // Unique constraint violation = already applied
    if (error.code === '23505') {
      return NextResponse.json({ error: 'already_applied' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

// GET /api/applications — list job_ids the current user applied to
export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('applications')
    .select('job_id')
    .eq('candidate_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data?.map(a => a.job_id) ?? [])
}
