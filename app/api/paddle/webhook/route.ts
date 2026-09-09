import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const paddleApiKey = process.env.PADDLE_API_KEY

  if (!paddleApiKey) {
    return NextResponse.json({ error: 'Paddle not configured' }, { status: 503 })
  }

  // Use service role key to bypass RLS — webhook has no user session
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const body = await req.json()
    const event = body

    // Paddle webhook events:
    // subscription.created — When a checkout completes and subscription starts
    if (event.type === 'subscription.created') {
      const subscription = event.data
      const customerId = subscription.customer_id
      const customData = subscription.custom_data

      if (customData?.supabase_user_id) {
        const userId = customData.supabase_user_id
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', userId)
          .single()

        // Update paddle_customer_id
        await supabase
          .from('profiles')
          .update({ paddle_customer_id: customerId })
          .eq('user_id', userId)

        // Set plan status based on role
        if (profile?.role === 'employer') {
          await supabase
            .from('profiles')
            .update({ employer_plan: 'growth' })
            .eq('user_id', userId)
        } else {
          const candidatePlan = customData?.plan === 'elite' ? 'elite' : 'pro'
          await supabase
            .from('profiles')
            .update({ is_premium: true, candidate_plan: candidatePlan })
            .eq('user_id', userId)
        }
      }
    }

    // subscription.canceled — When subscription is canceled by user or at period end
    if (event.type === 'subscription.canceled') {
      const subscription = event.data
      const customerId = subscription.customer_id

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('paddle_customer_id', customerId)
        .single()

      if (profile?.role === 'employer') {
        await supabase
          .from('profiles')
          .update({ employer_plan: 'free' })
          .eq('paddle_customer_id', customerId)
      } else {
        await supabase
          .from('profiles')
          .update({ is_premium: false, candidate_plan: 'free' })
          .eq('paddle_customer_id', customerId)
      }
    }

    // transaction.billed — Payment succeeded
    if (event.type === 'transaction.billed') {
      const transaction = event.data
      const customerId = transaction.customer_id

      // Just log for now — subscription state is handled by subscription.created/canceled
      console.log('[paddle/webhook] Payment billed for customer:', customerId)
    }

    // transaction.payment_failed — Payment failed (but subscription remains active during dunning)
    if (event.type === 'transaction.payment_failed') {
      const transaction = event.data
      const customerId = transaction.customer_id

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('paddle_customer_id', customerId)
        .single()

      // Deliberately NOT reverting for employer accounts: Paddle retries failed payments
      // for ~2-3 weeks (dunning) before the subscription is actually canceled.
      // The employer plan only reverts on subscription.canceled event above.
      // Candidate behavior: immediately revert on first failure (kept for backwards compat).
      if (profile?.role !== 'employer') {
        await supabase
          .from('profiles')
          .update({ is_premium: false, candidate_plan: 'free' })
          .eq('paddle_customer_id', customerId)
      }
    }

    return NextResponse.json({ received: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[paddle/webhook] error:', message)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
