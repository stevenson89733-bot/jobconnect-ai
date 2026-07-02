import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

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

  const supabase = createClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId  = session.metadata?.supabase_user_id
    if (userId) {
      await supabase
        .from('profiles')
        .update({ is_premium: true })
        .eq('user_id', userId)
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub        = event.data.object as Stripe.Subscription
    const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
    await supabase
      .from('profiles')
      .update({ is_premium: false })
      .eq('stripe_customer_id', customerId)
  }

  if (event.type === 'invoice.payment_failed') {
    const invoice    = event.data.object as Stripe.Invoice
    const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id
    if (customerId) {
      await supabase
        .from('profiles')
        .update({ is_premium: false })
        .eq('stripe_customer_id', customerId)
    }
  }

  return NextResponse.json({ received: true })
}
