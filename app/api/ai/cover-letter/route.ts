export const maxDuration = 60

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateCoverLetter } from '@/lib/ai/generate'
import { effectiveIsPremium } from '@/lib/adminAccess'

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_premium, is_admin')
    .eq('user_id', user.id)
    .single()

  if (!effectiveIsPremium(profile ?? {})) {
    return NextResponse.json({ error: 'Premium required' }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  return generateCoverLetter(body)
}
