import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('backfill_cross_border_jobs')

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ success: true, updated: data })
}
