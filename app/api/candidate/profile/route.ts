import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    // Auth via cookie session
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) {
      console.error('[/api/candidate/profile] auth error:', authError.message)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!serviceKey) {
      console.error('[/api/candidate/profile] SUPABASE_SERVICE_ROLE_KEY is not set')
      return NextResponse.json({ error: 'Server misconfiguration: missing service role key' }, { status: 500 })
    }

    // Service role bypasses RLS — safe here because user.id is verified above
    const service = createServiceClient(supabaseUrl!, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data, error } = await service
      .from('profiles')
      .select('is_admin, is_premium, title, bio, experience, skills, education')
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
