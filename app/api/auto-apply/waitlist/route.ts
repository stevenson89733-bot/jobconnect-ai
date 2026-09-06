import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { error } = await supabase.from('auto_apply_waitlist').insert({
      user_id: user.id,
      email: user.email,
      status: 'waitlist',
    })

    if (error && error.code !== '23505') {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = createClient()
    const { count, error } = await supabase
      .from('auto_apply_waitlist')
      .select('*', { count: 'exact', head: true })

    if (error) return NextResponse.json({ count: 0 })
    return NextResponse.json({ count: count ?? 0 })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}
