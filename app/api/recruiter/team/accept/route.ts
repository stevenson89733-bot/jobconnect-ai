export const maxDuration = 30

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as svc } from '@supabase/supabase-js'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')
  if (!token) return NextResponse.redirect(new URL('/?error=invalid-token', req.url))

  const admin = svc(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  const { data: invite } = await admin
    .from('employer_team_members')
    .select('id, status, employer_id')
    .eq('token', token)
    .single()

  if (!invite) return NextResponse.redirect(new URL('/?error=invalid-token', req.url))
  if (invite.status === 'active') return NextResponse.redirect(new URL('/recruiter?team=already-active', req.url))

  // Link to current user if logged in
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const updates: Record<string, unknown> = { status: 'active', accepted_at: new Date().toISOString() }
  if (user) updates.member_user_id = user.id

  await admin.from('employer_team_members').update(updates).eq('id', invite.id)

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://jobconnect-ai.vercel.app'
  return NextResponse.redirect(new URL('/recruiter?team=accepted', baseUrl))
}
