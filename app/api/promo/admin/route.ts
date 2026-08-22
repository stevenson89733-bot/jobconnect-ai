import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function serviceDb() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function assertAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('profiles').select('is_admin').eq('user_id', user.id).single()
  return profile?.is_admin ? user : null
}

// List all promo codes
export async function GET() {
  if (!await assertAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await serviceDb()
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ codes: data })
}

// Create a new promo code
export async function POST(req: Request) {
  if (!await assertAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json().catch(() => ({}))
  const code        = (body.code as string | undefined)?.trim().toUpperCase()
  const type        = body.type === 'employer' ? 'employer' : 'candidate'
  const description = body.description?.trim() || null
  const maxUses     = parseInt(body.max_uses ?? '10', 10)
  const expiresAt   = body.expires_at ? new Date(body.expires_at).toISOString() : null

  if (!code) return NextResponse.json({ error: 'Code is required' }, { status: 400 })
  if (!maxUses || maxUses < 1) return NextResponse.json({ error: 'max_uses must be ≥ 1' }, { status: 400 })

  const { data, error } = await serviceDb()
    .from('promo_codes')
    .insert({ code, type, description, max_uses: maxUses, expires_at: expiresAt })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Code already exists' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ code: data }, { status: 201 })
}

// Toggle is_active
export async function PATCH(req: Request) {
  if (!await assertAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json().catch(() => ({}))
  const { id, is_active } = body
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const { error } = await serviceDb()
    .from('promo_codes')
    .update({ is_active })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
