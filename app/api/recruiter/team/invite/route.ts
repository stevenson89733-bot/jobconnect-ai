export const maxDuration = 10

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as svc } from '@supabase/supabase-js'
import { effectiveEmployerPlan } from '@/lib/adminAccess'
import { Resend } from 'resend'

const MAX_MEMBERS = { growth: 5, pro: 999 }

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('employer_plan, is_admin, role, company_name')
    .eq('user_id', user.id)
    .single()

  if (profile?.role !== 'employer' && !profile?.is_admin) {
    return NextResponse.json({ error: 'Employers only' }, { status: 403 })
  }
  const plan = effectiveEmployerPlan(profile ?? {})
  if (plan === 'free') {
    return NextResponse.json({ error: 'Growth plan required' }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const email = (body.email ?? '').trim().toLowerCase()
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }

  const admin = svc(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  // Check member count
  const maxAllowed = plan === 'pro' ? MAX_MEMBERS.pro : MAX_MEMBERS.growth
  const { count } = await admin
    .from('employer_team_members')
    .select('id', { count: 'exact', head: true })
    .eq('employer_id', user.id)
    .neq('status', 'removed')

  if ((count ?? 0) >= maxAllowed) {
    return NextResponse.json({ error: `Team limit reached (${maxAllowed} members for ${plan} plan)` }, { status: 422 })
  }

  // Upsert invite (reset token if re-inviting)
  const token = crypto.randomUUID().replace(/-/g, '')
  const { data: member, error: upsertErr } = await admin
    .from('employer_team_members')
    .upsert({
      employer_id: user.id,
      invited_email: email,
      token,
      status: 'invited',
      accepted_at: null,
    }, { onConflict: 'employer_id,invited_email', ignoreDuplicates: false })
    .select('id')
    .single()

  if (upsertErr) return NextResponse.json({ error: upsertErr.message }, { status: 500 })

  // Send invite email via Resend
  const resendKey = process.env.RESEND_API_KEY
  if (resendKey) {
    const resend = new Resend(resendKey)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://jobconnect-ai.vercel.app'
    const acceptUrl = `${baseUrl}/api/recruiter/team/accept?token=${token}`
    const companyName = profile?.company_name ?? 'Your employer'
    const { error: emailError } = await resend.emails.send({
      from: 'JobConnect AI <noreply@jobconnect-ai.com>',
      to: email,
      subject: `You've been invited to join ${companyName} on JobConnect AI`,
      html: `
        <p>Hi,</p>
        <p><strong>${companyName}</strong> has invited you to join their recruiting team on <strong>JobConnect AI</strong>.</p>
        <p>Click the button below to accept:</p>
        <p><a href="${acceptUrl}" style="background:#2563eb;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;display:inline-block">Accept Invitation</a></p>
        <p style="color:#999;font-size:12px">If you didn't expect this email, you can safely ignore it.</p>
      `,
    })
    if (emailError) {
      console.error('[team-invite/resend]', emailError)
      return NextResponse.json({ error: 'Invitation created but email delivery failed. Please try again.' }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true, id: member?.id })
}
