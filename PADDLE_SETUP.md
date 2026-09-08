# Paddle Payment Setup Guide

## Overview
JobConnect AI uses Paddle as the primary payment processor for both candidate and employer subscriptions.

## Webhook Configuration

### Webhook Endpoint URL
```
Production:  https://jobconnect.ai/api/paddle/webhook
Staging:     https://staging.jobconnect.ai/api/paddle/webhook
Development: http://localhost:3000/api/paddle/webhook
```

### Paddle Dashboard Setup

1. **Navigate to Developer Tools → Webhooks**
   - Go to https://vendor.paddle.com/settings/integrations/webhooks

2. **Add Webhook Endpoint**
   - Endpoint URL: `https://jobconnect.ai/api/paddle/webhook`
   - Method: POST

3. **Select Events to Monitor**
   Subscribe to the following events:
   - `subscription.created` - When a checkout completes and subscription starts
   - `subscription.canceled` - When subscription is canceled by user or at period end
   - `transaction.billed` - When payment succeeds
   - `transaction.payment_failed` - When payment fails (for dunning handling)

4. **Save Webhook**

## Price IDs (Live Mode)

### Candidate Plans
- **Candidate Pro** - $19/mo
  - Price ID: `pri_01m1y0hsqtf174a0n6bbd7wwqn`
  - Environment Variable: `NEXT_PUBLIC_PADDLE_CANDIDATE_PREMIUM_PRICE_ID`

### Employer Plans
- **Employer Growth** - $49/mo
  - Price ID: `pri_01m1y0rhs2rar9h9s5nm2vzhb7`
  - Environment Variable: `NEXT_PUBLIC_PADDLE_EMPLOYER_GROWTH_PRICE_ID`

## Environment Variables

Add these to your Vercel environment:

```env
# Paddle Live Mode
PADDLE_API_KEY=<your_paddle_api_key>
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=<your_paddle_client_token>
NEXT_PUBLIC_PADDLE_CANDIDATE_PREMIUM_PRICE_ID=pri_01m1y0hsqtf174a0n6bbd7wwqn
NEXT_PUBLIC_PADDLE_EMPLOYER_GROWTH_PRICE_ID=pri_01m1y0rhs2rar9h9s5nm2vzhb7
```

## API Endpoints

### Candidate Checkout
**Route:** `POST /api/paddle/checkout`

**Request:**
```json
{}
```

**Response:**
```json
{
  "url": "https://checkout.paddle.com/checkout/pri_01m1y0hsqtf174a0n6bbd7wwqn?..."
}
```

### Employer Checkout
**Route:** `POST /api/paddle/checkout/employer`

**Request:**
```json
{}
```

**Response:**
```json
{
  "url": "https://checkout.paddle.com/checkout/pri_01m1y0rhs2rar9h9s5nm2vzhb7?..."
}
```

### Webhook Handler
**Route:** `POST /api/paddle/webhook`

**Events handled:**
- `subscription.created` → Updates `is_premium` (candidate) or `employer_plan` (employer)
- `subscription.canceled` → Reverts to free plan
- `transaction.payment_failed` → Reverts to free plan (candidate only, not employer)

## Subscription Flow

### Candidate Premium ($19/mo)
1. User clicks "Upgrade to Candidate Pro"
2. Frontend calls `POST /api/paddle/checkout`
3. Redirects to Paddle hosted checkout
4. Payment succeeds → Webhook fires `subscription.created`
5. Backend updates `profiles.is_premium = true`

### Employer Growth ($49/mo)
1. User clicks "Upgrade to Growth"
2. Frontend calls `POST /api/paddle/checkout/employer`
3. Redirects to Paddle hosted checkout
4. Payment succeeds → Webhook fires `subscription.created`
5. Backend updates `profiles.employer_plan = 'growth'`

## Webhook Signature Verification (Future)

Currently, webhooks are accepted without signature verification. To add verification:

1. Retrieve webhook signing secret from Paddle dashboard
2. Implement signature verification in `/app/api/paddle/webhook/route.ts`
3. Add to environment: `PADDLE_WEBHOOK_SECRET`

```typescript
// Example implementation
import { verifySignature } from '@paddle/paddle-node-sdk'

const signature = req.headers.get('paddle-signature')
const isValid = verifySignature(body, signature, process.env.PADDLE_WEBHOOK_SECRET)
```

## Database Schema

### profiles table
Required columns:
```sql
paddle_customer_id    TEXT          -- Paddle customer ID
is_premium            BOOLEAN       -- Candidate Premium status
employer_plan         VARCHAR(50)   -- Employer plan ('free' or 'growth')
```

## Dunning & Retry Logic

### Candidate (is_premium)
- **Payment failed** → Immediately reverts `is_premium = false`
- **Subscription canceled** → Reverts `is_premium = false`

### Employer (employer_plan)
- **Payment failed** → No action (Paddle retries for ~2-3 weeks)
- **Subscription canceled** → Reverts `employer_plan = 'free'`

This prevents false negatives for employer accounts during dunning period.

## Testing

### Local Testing
1. Set Paddle env vars for sandbox
2. Use Paddle test cards: https://developer.paddle.com/guides/testing
3. Webhook endpoint: `http://localhost:3000/api/paddle/webhook`

### Sandbox Price IDs
- Contact Paddle support for sandbox price IDs
- Update env vars for staging environment

## Migration Status

- ✅ Routes implemented
- ✅ Webhook handler implemented
- ⏳ Paddle webhook endpoint configured (manual step needed)
- ⏳ Env vars configured in Vercel
- ⏳ Database schema verified/updated

## Stripe (Legacy)

Stripe routes remain in `/app/api/stripe/` but are **not called**.
- Kept for potential reactivation after Singapore incorporation
- Routes commented out in `app/pricing/page.tsx`
- Can be reactivated by uncommenting Stripe calls
