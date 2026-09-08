import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const paddleClientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN
  const priceId = process.env.NEXT_PUBLIC_PADDLE_EMPLOYER_GROWTH_PRICE_ID
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  if (!paddleClientToken || !priceId) {
    return NextResponse.json({ error: 'Paddle not configured' }, { status: 503 })
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, paddle_customer_id, email, full_name')
    .eq('user_id', user.id)
    .single()

  if (profile?.role !== 'employer') {
    return NextResponse.json({ error: 'Only employer accounts can upgrade the employer plan' }, { status: 403 })
  }

  try {
    // Generate checkout URL using Paddle's checkout format
    const successUrl = `${appUrl}/pricing?success=true&plan=employer#employers`
    const cancelUrl = `${appUrl}/pricing?canceled=true&plan=employer#employers`

    // Paddle checkout link format:
    // https://checkout.paddle.com/checkout/{priceId}?...
    const checkoutUrl = new URL(`https://checkout.paddle.com/checkout/${priceId}`)

    // Add success/cancel URLs
    checkoutUrl.searchParams.append('success_url', successUrl)
    checkoutUrl.searchParams.append('cancel_url', cancelUrl)

    // Add customer info if available
    if (profile?.email) {
      checkoutUrl.searchParams.append('customer_email', profile.email)
    }
    if (profile?.full_name) {
      checkoutUrl.searchParams.append('customer_name', profile.full_name)
    }

    // Add metadata for user tracking
    checkoutUrl.searchParams.append('custom_data', JSON.stringify({ supabase_user_id: user.id, role: 'employer' }))

    // Store paddle_customer_id if needed (Paddle will generate if not exists)
    if (!profile?.paddle_customer_id) {
      // We'll update this after webhook confirmation
      await supabase
        .from('profiles')
        .update({ paddle_customer_id: user.id })
        .eq('user_id', user.id)
    }

    return NextResponse.json({ url: checkoutUrl.toString() })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[paddle/checkout/employer]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
