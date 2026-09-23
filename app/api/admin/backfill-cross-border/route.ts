import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const maxDuration = 10

export async function POST() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('user_id', user.id)
    .single()

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Admins only' }, { status: 403 })
  }

  const { data, error } = await supabase.rpc('backfill_cross_border_jobs')

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ success: true, updated: data })
}
