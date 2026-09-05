import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function GET() {
  // Auth via cookie session (anon client)
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // DB query via service role — bypasses RLS so admin rows are always readable
  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data, error } = await service
    .from('profiles')
    .select('is_admin, is_premium, title, bio, experience, skills, education, resume_url')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  console.log('[/api/candidate/profile] user:', user.id, 'is_admin:', data?.is_admin, 'is_premium:', data?.is_premium)

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
