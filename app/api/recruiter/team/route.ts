export const maxDuration = 10

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { effectiveEmployerPlan } from '@/lib/adminAccess'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('employer_plan, is_admin, role')
    .eq('user_id', user.id)
    .single()

  if (profile?.role !== 'employer' && !profile?.is_admin) {
    return NextResponse.json({ error: 'Employers only' }, { status: 403 })
  }
  if (effectiveEmployerPlan(profile ?? {}) === 'free') {
    return NextResponse.json({ error: 'Growth plan required' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('employer_team_members')
    .select('id, invited_email, status, invited_at, accepted_at')
    .eq('employer_id', user.id)
    .neq('status', 'removed')
    .order('invited_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ members: data ?? [] })
}
