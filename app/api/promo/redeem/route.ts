import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  // Authenticate the caller
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const code = (body.code as string | undefined)?.trim().toUpperCase()
  if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 })

  // Use service role to bypass RLS on promo_codes and profiles
  const db = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. Fetch the promo code
  const { data: promo, error: promoErr } = await db
    .from('promo_codes')
    .select('id, code, max_uses, used_count, expires_at, is_active')
    .eq('code', code)
    .single()

  if (promoErr || !promo) {
    return NextResponse.json({ error: 'Invalid or expired code.' }, { status: 400 })
  }

  // 2. Validate the code itself
  if (!promo.is_active) {
    return NextResponse.json({ error: 'Invalid or expired code.' }, { status: 400 })
  }
  if (promo.used_count >= promo.max_uses) {
    return NextResponse.json({ error: 'Invalid or expired code.' }, { status: 400 })
  }
  if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Invalid or expired code.' }, { status: 400 })
  }

  // 3. Check this user's current premium status
  const { data: profile } = await db
    .from('profiles')
    .select('is_premium, premium_expires_at')
    .eq('user_id', user.id)
    .single()

  if (profile?.is_premium && !profile?.premium_expires_at) {
    // Stripe subscriber — already has real premium
    return NextResponse.json({ error: 'You already have an active Premium subscription.' }, { status: 409 })
  }
  if (profile?.premium_expires_at) {
    // Has or had a promo code
    return NextResponse.json({ error: 'You have already used a promo code.' }, { status: 409 })
  }

  // 4. Activate premium for 90 days
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 90)

  const { error: updateErr } = await db
    .from('profiles')
    .update({ is_premium: true, premium_expires_at: expiresAt.toISOString() })
    .eq('user_id', user.id)

  if (updateErr) {
    console.error('[promo/redeem] profile update failed:', updateErr.message)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }

  // 5. Increment used_count
  await db
    .from('promo_codes')
    .update({ used_count: promo.used_count + 1 })
    .eq('id', promo.id)

  return NextResponse.json({ success: true })
}
