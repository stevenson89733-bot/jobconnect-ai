import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin, is_premium, full_name, title, bio, experience, skills, education')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('[/api/candidate/profile] db error:', error.code, error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('[/api/candidate/profile] user:', user.id, 'is_admin:', data?.is_admin, 'is_premium:', data?.is_premium)

    return NextResponse.json({
      is_admin:    data?.is_admin    ?? false,
      plan:        data?.is_admin || data?.is_premium ? 'pro' : 'free',
      full_name:   data?.full_name   ?? null,
      headline:    data?.title       ?? null,
      bio:         data?.bio         ?? null,
      experience:  data?.experience  ?? null,
      skills:      data?.skills      ?? null,
      resume_text: null,
      resume_url:  null,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[/api/candidate/profile] unexpected error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
