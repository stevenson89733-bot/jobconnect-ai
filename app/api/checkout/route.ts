import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    console.log('[Checkout] === REQUEST START ===')
    const body = await request.json()
    const { priceId, plan } = body
    console.log('[Checkout] Request body:', JSON.stringify(body))

    if (!priceId) {
      console.warn('[Checkout] Missing priceId')
      return NextResponse.json({ error: 'Price ID required' }, { status: 400 })
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.warn('[Checkout] User not authenticated')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.log('[Checkout] Authenticated user:', user.id, user.email)

    const paddleApiKey = process.env.PADDLE_API_KEY
    console.log('[Checkout] PADDLE_API_KEY exists:', !!paddleApiKey)
    if (!paddleApiKey) {
      console.error('[Checkout] PADDLE_API_KEY not configured')
      return NextResponse.json({ error: 'Payment service not configured' }, { status: 500 })
    }

    const returnUrl = request.headers.get('referer') || `${request.nextUrl.origin}/pricing`
    console.log('[Checkout] Return URL:', returnUrl)

    // Create transaction via Paddle API
    const paddlePayload = {
      items: [{ price_id: priceId, quantity: 1 }],
      customer_email: user.email,
      custom_data: {
        supabase_user_id: user.id,
        plan,
      },
      return_url: returnUrl,
    }
    console.log('[Checkout] Paddle API payload:', JSON.stringify(paddlePayload, null, 2))

    const paddleResponse = await fetch('https://api.paddle.com/transactions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paddleApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paddlePayload),
    })

    console.log('[Checkout] Paddle API response status:', paddleResponse.status)

    if (!paddleResponse.ok) {
      const error = await paddleResponse.text()
      console.error('[Checkout] Paddle API error (status', paddleResponse.status + '):', error)
      return NextResponse.json({ error: 'Failed to create checkout', details: error }, { status: 500 })
    }

    const transaction = await paddleResponse.json()
    console.log('[Checkout] Paddle API response:', JSON.stringify(transaction, null, 2))

    const checkoutUrl = transaction.data?.checkout?.url || transaction.checkout?.url || transaction.data?.checkout_link
    console.log('[Checkout] Extracted checkout URL:', checkoutUrl)

    if (!checkoutUrl) {
      console.error('[Checkout] No checkout URL found in Paddle response:', JSON.stringify(transaction, null, 2))
      return NextResponse.json({ error: 'No checkout URL returned', response: transaction }, { status: 500 })
    }

    console.log('[Checkout] === REQUEST SUCCESS ===')
    return NextResponse.json({ checkoutUrl })
  } catch (error) {
    console.error('[Checkout API]', error)
    return NextResponse.json({ error: 'Checkout creation failed' }, { status: 500 })
  }
}
