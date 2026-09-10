import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const paddleApiKey = process.env.PADDLE_API_KEY
    if (!paddleApiKey) {
      return NextResponse.json({ error: 'PADDLE_API_KEY not configured' }, { status: 500 })
    }

    const { priceId = 'pri_01m1y0hsqtf174a0n6bbd7wwqn' } = await request.json()

    console.log('[DEBUG] Testing Paddle API with price:', priceId)

    const paddleResponse = await fetch('https://api.paddle.com/transactions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paddleApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [{ price_id: priceId, quantity: 1 }],
        customer_email: 'test@example.com',
        custom_data: {
          debug: true,
        },
        return_url: 'https://jobconnect-ai.com/pricing',
      }),
    })

    const responseText = await paddleResponse.text()
    console.log('[DEBUG] Paddle HTTP status:', paddleResponse.status)
    console.log('[DEBUG] Paddle response body:', responseText)

    if (!paddleResponse.ok) {
      return NextResponse.json({
        status: paddleResponse.status,
        error: responseText,
      }, { status: 500 })
    }

    const transaction = JSON.parse(responseText)
    return NextResponse.json({
      status: paddleResponse.status,
      response: transaction,
      checkoutUrl: transaction.data?.checkout?.url || transaction.checkout?.url || 'NOT FOUND',
    })
  } catch (error) {
    console.error('[DEBUG] Error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
