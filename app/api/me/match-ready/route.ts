import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ profileComplete: false })

  const { data } = await supabase
    .from('profiles')
    .select('title, skills')
    .eq('user_id', user.id)
    .single()

  const profileComplete = !!(data?.title?.trim() && data?.skills?.trim())
  return NextResponse.json({ profileComplete })
}
