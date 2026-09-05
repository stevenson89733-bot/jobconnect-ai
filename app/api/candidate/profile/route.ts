import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin, is_premium, full_name, title, bio, experience, skills, education, email')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('[/api/candidate/profile] db error:', error.code, error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Explicit boolean coercion — never trust DB nulls to be falsy in JS ternary
    const isAdmin   = data?.is_admin   === true
    const isPremium = data?.is_premium === true

    console.log('[/api/candidate/profile] user:', user.id, 'is_admin:', isAdmin, 'is_premium:', isPremium)

    return NextResponse.json({
      is_admin:    isAdmin,
      plan:        isAdmin || isPremium ? 'pro' : 'free',
      full_name:   data?.full_name  ?? null,
      headline:    data?.title      ?? null,
      email:       data?.email      ?? null,
      bio:         data?.bio        ?? null,
      experience:  data?.experience ?? null,
      skills:      data?.skills     ?? null,
      resume_text: null,
      resume_url:  null,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[/api/candidate/profile] unexpected error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
