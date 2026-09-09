import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { priceId, plan } = await request.json()

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID required' }, { status: 400 })
    }

    const checkoutUrl = new URL('https://checkout.paddle.com/')
    checkoutUrl.searchParams.append('items[0][price_id]', priceId)

    // Add return URL to pricing page
    const returnUrl = new URL(request.headers.get('referer') || `${request.nextUrl.origin}/pricing`)
    checkoutUrl.searchParams.append('return_url', returnUrl.toString())

    // Optional: add custom data
    if (plan) {
      checkoutUrl.searchParams.append('custom_data', JSON.stringify({ plan }))
    }

    return NextResponse.json({ checkoutUrl: checkoutUrl.toString() })
  } catch (error) {
    console.error('[Checkout API]', error)
    return NextResponse.json({ error: 'Checkout creation failed' }, { status: 500 })
  }
}
