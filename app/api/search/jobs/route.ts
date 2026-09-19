import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') ?? '').trim()

  if (!q || q.length < 2) {
    return NextResponse.json({ jobs: [] })
  }

  const supabase = createClient()

  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('id, title, company_name, location, source')
    .eq('is_active', true)
    .or(`title.ilike.%${q}%,company_name.ilike.%${q}%`)
    .limit(5)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ jobs: jobs ?? [] })
}
