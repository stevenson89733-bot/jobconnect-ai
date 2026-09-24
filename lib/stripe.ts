import Stripe from 'stripe'

// Module-level singleton — avoids rebuilding the HTTP agent pool on every request
let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY is not configured')
    _stripe = new Stripe(key, { apiVersion: '2022-11-15' })
  }
  return _stripe
}
