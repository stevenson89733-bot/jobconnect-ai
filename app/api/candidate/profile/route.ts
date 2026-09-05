import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('profiles')
    .select('is_admin, is_premium, title, bio, experience, skills, education, resume_url')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    is_admin:    data?.is_admin    ?? false,
    plan:        data?.is_admin || data?.is_premium ? 'pro' : 'free',
    headline:    data?.title       ?? null,
    bio:         data?.bio         ?? null,
    experience:  data?.experience  ?? null,
    skills:      data?.skills      ?? null,
    resume_text: null,
    resume_url:  data?.resume_url  ?? null,
  })
}
