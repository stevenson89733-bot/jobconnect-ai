export const maxDuration = 10

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateResume } from '@/lib/ai/generate'
import { effectiveIsPremium } from '@/lib/adminAccess'

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Server-side premium gate
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_premium, is_admin')
    .eq('user_id', user.id)
    .single()

  if (!effectiveIsPremium(profile ?? {})) {
    return NextResponse.json(
      { error: 'Premium required' },
      { status: 403 }
    )
  }

  const body = await req.json().catch(() => ({}))
  return generateResume(body)
}
