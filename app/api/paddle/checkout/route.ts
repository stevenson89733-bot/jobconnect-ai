import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const paddleClientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN
  const proPriceId = process.env.NEXT_PUBLIC_PADDLE_CANDIDATE_PRO_PRICE_ID
  const elitePriceId = process.env.NEXT_PUBLIC_PADDLE_CANDIDATE_ELITE_PRICE_ID
  const appUrl = 'https://jobconnect-ai.com'

  const { searchParams } = new URL(req.url)
  const plan = searchParams.get('plan') ?? 'pro'
  const priceId = plan === 'elite' ? elitePriceId : proPriceId

  if (!paddleClientToken || !priceId) {
    return NextResponse.json({ error: 'Paddle not configured' }, { status: 503 })
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('paddle_customer_id, email, full_name')
    .eq('user_id', user.id)
    .single()

  try {
    // Generate checkout URL using Paddle's checkout format
    // For now, we'll construct the checkout link server-side
    const successUrl = `${appUrl}/pricing?success=true`
    const cancelUrl = `${appUrl}/pricing?canceled=true`

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
    checkoutUrl.searchParams.append('custom_data', JSON.stringify({ supabase_user_id: user.id, plan }))

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
    console.error('[paddle/checkout]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
