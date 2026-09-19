import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const stripeKey     = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripeKey || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const body      = await req.text()
  const signature = req.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    const stripe = new Stripe(stripeKey, { apiVersion: '2022-11-15' })
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Use service role key to bypass RLS — webhook has no user session
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Employer plan is determined by which price the checkout used:
  // price_1UGMUmBHJVowT7ouBDORCd3s = Employer Pro $99/mo → 'pro'
  // any other employer price (Growth $49/mo)             → 'growth'
  // candidate prices                                     → is_premium: true
  const EMPLOYER_PRO_PRICE_ID      = process.env.STRIPE_EMPLOYER_PRO_PRICE_ID ?? 'price_1UGMUmBHJVowT7ouBDORCd3s'
  const FEATURED_LISTING_PRICE_ID  = process.env.STRIPE_FEATURED_LISTING_PRICE_ID ?? 'price_featured_placeholder'

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId  = session.metadata?.supabase_user_id

    // Featured listing one-time purchase — increment credit counter
    if (userId && session.metadata?.purchase_type === 'featured_listing') {
      const stripe = new Stripe(stripeKey, { apiVersion: '2022-11-15' })
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 })
      const purchasedPriceId = lineItems.data[0]?.price?.id
      if (purchasedPriceId === FEATURED_LISTING_PRICE_ID) {
        await supabase.rpc('increment_featured_listing_credits', { uid: userId })
      }
    } else if (userId) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', userId).single()
      if (profile?.role === 'employer') {
        // Determine which employer plan was purchased by inspecting the line items price
        const stripe = new Stripe(stripeKey, { apiVersion: '2022-11-15' })
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 })
        const purchasedPriceId = lineItems.data[0]?.price?.id
        const plan = purchasedPriceId === EMPLOYER_PRO_PRICE_ID ? 'pro' : 'growth'
        await supabase.from('profiles').update({ employer_plan: plan }).eq('user_id', userId)
      } else {
        await supabase.from('profiles').update({ is_premium: true }).eq('user_id', userId)
      }
    }
  }

  // Real period-end signal for both plans: cancel_at_period_end keeps the
  // subscription 'active' until the period actually ends, at which point
  // Stripe transitions it to canceled and fires this event — so reacting
  // to it (rather than to the cancellation request itself) already means
  // "at real period end", not immediately.
  if (event.type === 'customer.subscription.deleted') {
    const sub        = event.data.object as Stripe.Subscription
    const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
    const { data: profile } = await supabase.from('profiles').select('role').eq('stripe_customer_id', customerId).single()
    if (profile?.role === 'employer') {
      await supabase.from('profiles').update({ employer_plan: 'free' }).eq('stripe_customer_id', customerId)
    } else {
      await supabase.from('profiles').update({ is_premium: false }).eq('stripe_customer_id', customerId)
    }
  }

  if (event.type === 'invoice.payment_failed') {
    const invoice    = event.data.object as Stripe.Invoice
    const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id
    if (customerId) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('stripe_customer_id', customerId).single()
      // Deliberately NOT mirrored for employer accounts: Stripe retries a
      // failed payment for ~2-3 weeks (dunning) before the subscription is
      // actually canceled — reverting on the first failure here would be
      // premature. The employer plan only reverts on the real
      // customer.subscription.deleted event above, once dunning is
      // actually exhausted. Candidate behavior is unchanged from before.
      if (profile?.role !== 'employer') {
        await supabase.from('profiles').update({ is_premium: false }).eq('stripe_customer_id', customerId)
      }
    }
  }

  return NextResponse.json({ received: true })
}
