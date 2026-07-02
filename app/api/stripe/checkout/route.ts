import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST() {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  const priceId   = process.env.STRIPE_PRICE_ID
  const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  if (!stripeKey || !priceId) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const stripe = new Stripe(stripeKey, { apiVersion: '2022-11-15' })

  // Reuse existing customer if available
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, email, full_name')
    .eq('user_id', user.id)
    .single()

  let customerId = profile?.stripe_customer_id ?? undefined

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email ?? user.email ?? undefined,
      name:  profile?.full_name ?? undefined,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('user_id', user.id)
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/pricing?success=true`,
    cancel_url:  `${appUrl}/pricing?canceled=true`,
    metadata: { supabase_user_id: user.id },
  })

  return NextResponse.json({ url: session.url })
}
