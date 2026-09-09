import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { priceId, plan } = await request.json()

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID required' }, { status: 400 })
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const paddleApiKey = process.env.PADDLE_API_KEY
    if (!paddleApiKey) {
      console.error('[Checkout] PADDLE_API_KEY not configured')
      return NextResponse.json({ error: 'Payment service not configured' }, { status: 500 })
    }

    const returnUrl = request.headers.get('referer') || `${request.nextUrl.origin}/pricing`

    // Create transaction via Paddle API
    const paddleResponse = await fetch('https://api.paddle.com/transactions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paddleApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [{ price_id: priceId, quantity: 1 }],
        customer_email: user.email,
        custom_data: {
          supabase_user_id: user.id,
          plan,
        },
        return_url: returnUrl,
      }),
    })

    if (!paddleResponse.ok) {
      const error = await paddleResponse.text()
      console.error('[Checkout] Paddle API error:', error)
      return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 })
    }

    const transaction = await paddleResponse.json()
    const checkoutUrl = transaction.data?.checkout?.url

    if (!checkoutUrl) {
      console.error('[Checkout] No checkout URL in Paddle response:', transaction)
      return NextResponse.json({ error: 'No checkout URL returned' }, { status: 500 })
    }

    return NextResponse.json({ checkoutUrl })
  } catch (error) {
    console.error('[Checkout API]', error)
    return NextResponse.json({ error: 'Checkout creation failed' }, { status: 500 })
  }
}
