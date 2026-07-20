import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

// Same real Stripe Checkout Session pattern as app/api/stripe/checkout/route.ts
// (candidate Premium) — reused, not reimplemented: same customer-reuse logic,
// same subscription mode, same metadata-based user linking read back by the
// shared webhook (app/api/stripe/webhook/route.ts), which branches on
// profiles.role to decide whether a given event is about is_premium or
// employer_plan.
export async function POST() {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  const priceId   = process.env.STRIPE_EMPLOYER_PRICE_ID
  const appUrl     = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  if (!stripeKey || !priceId) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, stripe_customer_id, email, full_name')
    .eq('user_id', user.id)
    .single()

  if (profile?.role !== 'employer') {
    return NextResponse.json({ error: 'Only employer accounts can upgrade the employer plan' }, { status: 403 })
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2022-11-15' })

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

  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/pricing?success=true&plan=employer#employers`,
      cancel_url:  `${appUrl}/pricing?canceled=true&plan=employer#employers`,
      metadata: { supabase_user_id: user.id },
      // Mirrored onto the Subscription object itself (not just this
      // Checkout Session) so later lifecycle events — subscription.deleted,
      // invoice.payment_failed — can be traced back to the user without a
      // second lookup, same as the session-level metadata above.
      subscription_data: { metadata: { supabase_user_id: user.id } },
    })
    return NextResponse.json({ url: session.url })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[stripe/checkout/employer]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
