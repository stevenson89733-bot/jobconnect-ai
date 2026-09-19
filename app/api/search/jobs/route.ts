import { createPublicClient } from '@/lib/supabase/public'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''
  if (q.length < 2) return NextResponse.json([])

  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('jobs')
    .select('id, title, company_name')
    .eq('is_active', true)
    .ilike('title', `%${q}%`)
    .limit(8)

  if (error) return NextResponse.json([])
  return NextResponse.json(data ?? [])
}
