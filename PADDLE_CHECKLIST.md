# Paddle Configuration Checklist

## ✅ Completed (Backend)
- [x] Paddle SDKs installed (@paddle/paddle-node-sdk, @paddle/paddle-js)
- [x] Routes implemented:
  - [x] `/api/paddle/checkout` (candidate)
  - [x] `/api/paddle/checkout/employer` (employer)
  - [x] `/api/paddle/webhook` (webhook handler)
- [x] Pricing page updated to use Paddle
- [x] User messages updated (Stripe → Paddle)
- [x] Env var examples documented

## ⏳ TODO (Manual Steps in Paddle Dashboard)

### 1. Configure Webhook Endpoint
**Location:** Paddle Dashboard → Developer Tools → Webhooks

- [ ] Click "Add Webhook"
- [ ] Enter endpoint URL: `https://jobconnect.ai/api/paddle/webhook`
- [ ] Select events:
  - [ ] `subscription.created`
  - [ ] `subscription.canceled`
  - [ ] `transaction.billed`
  - [ ] `transaction.payment_failed`
- [ ] Save webhook

**Note:** You'll receive a webhook signing secret for signature verification (optional but recommended).

### 2. Verify Price IDs
**Location:** Paddle Dashboard → Pricing

Confirm these price IDs exist in Live mode:
- [ ] Candidate Pro - `pri_01m1y0hsqtf174a0n6bbd7wwqn` ($19/mo)
- [ ] Employer Growth - `pri_01m1y0rhs2rar9h9s5nm2vzhb7` ($49/mo)

If IDs don't match:
1. Find the actual Price IDs in Paddle dashboard
2. Update `PADDLE_SETUP.md` with correct IDs
3. Update environment variables in Vercel

### 3. Configure Vercel Environment Variables
**Location:** Vercel Project → Settings → Environment Variables

Add the following:
```
PADDLE_API_KEY=<your_paddle_api_key>
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=<your_paddle_client_token>
NEXT_PUBLIC_PADDLE_CANDIDATE_PREMIUM_PRICE_ID=pri_01m1y0hsqtf174a0n6bbd7wwqn
NEXT_PUBLIC_PADDLE_EMPLOYER_GROWTH_PRICE_ID=pri_01m1y0rhs2rar9h9s5nm2vzhb7
```

Optional (for signature verification):
```
PADDLE_WEBHOOK_SECRET=<your_paddle_webhook_signing_secret>
```

### 4. Test Payment Flow
- [ ] **Candidate checkout**: Click "Upgrade to Candidate Pro" on `/pricing`
  - Should redirect to Paddle checkout
  - Use Paddle test card (if in sandbox)
  - Verify `profiles.is_premium` updates to `true` after payment
  
- [ ] **Employer checkout**: Click "Upgrade to Growth" on `/pricing`
  - Should redirect to Paddle checkout (employer section)
  - Use Paddle test card (if in sandbox)
  - Verify `profiles.employer_plan` updates to `'growth'` after payment

- [ ] **Subscription cancellation**: Cancel subscription in Paddle dashboard
  - Verify webhook fires `subscription.canceled`
  - Verify `profiles.is_premium` or `profiles.employer_plan` reverts to free

### 5. Enable Webhook Signature Verification (Optional)
**When ready for production hardening:**

1. Add `PADDLE_WEBHOOK_SECRET` to Vercel env vars
2. Uncomment/implement signature verification in `/app/api/paddle/webhook/route.ts`
3. Test webhook endpoint with signature verification enabled

### 6. Set Up Alerts (Recommended)
**Location:** Paddle Dashboard → Notifications

Configure alerts for:
- [ ] Failed payments
- [ ] Subscription cancellations
- [ ] Webhook failures

## Testing Checklist

### Local Testing (Sandbox)
- [ ] Create Paddle sandbox account
- [ ] Get sandbox Paddle API Key & Client Token
- [ ] Get sandbox Price IDs
- [ ] Test complete checkout flow locally
- [ ] Verify database updates on webhook

### Staging Testing
- [ ] Deploy to staging environment
- [ ] Set staging Paddle credentials
- [ ] Test with actual Paddle sandbox environment
- [ ] Monitor webhook logs

### Production Rollout
- [ ] Set production Paddle credentials in Vercel
- [ ] Verify webhook endpoint is accessible
- [ ] Monitor first payment transactions
- [ ] Verify webhook events are received
- [ ] Monitor error rates on `/api/paddle/checkout`

## Emergency Fallback

If Paddle is down and urgent:
1. Uncomment Stripe checkout in `/app/pricing/page.tsx`
2. Redeploy
3. Revert once Paddle is back online

## Stripe Reactivation (Post-Singapore)

When ready to reactivate Stripe (after Singapore incorporation):
1. Uncomment Stripe checkout calls in `/app/pricing/page.tsx`
2. Uncommment Stripe env vars in production
3. Deploy
4. Test Stripe flow
5. Keep both Paddle and Stripe active during transition period
