const createNextIntlPlugin = require('next-intl/plugin')
const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

/** @type {import('next').NextConfig} */

// Baseline security headers — added in next.config.js rather than
// middleware.ts because these are static for every response (no per-request
// nonce/logic needed), so this is applied at build/edge level without
// re-running middleware JS on every request.
//
// CSP is tailored to what this app actually loads client-side, confirmed by
// grep before writing this, not a generic locked-down policy pasted in:
//   - script-src/style-src need 'unsafe-inline': next-themes injects an
//     inline anti-flash script (components/ThemeProvider.tsx), and this app
//     uses React inline `style={{ ... }}` attributes throughout (progress
//     bars, chart bar heights, etc.) — both require 'unsafe-inline' without
//     a nonce-based setup, which is out of scope for this lot.
//   - connect-src needs the Supabase project domain: app/profile/
//     AvatarUpload.tsx is the one client component that calls the browser
//     Supabase client directly (avatar uploads), and every page's auth
//     session refresh also happens client-side against this same domain.
//   - img-src allows https: broadly (not just Supabase) because
//     companies.logo_url is a real, arbitrary external URL field (not
//     restricted to one host) — even though no company has one set today.
//   - No allowance needed for OpenAI/Mistral/Tavily: all three are called
//     server-side only (lib/ai/*), never fetched from the browser.
//   - No client-side Stripe.js: checkout redirects to a Stripe-hosted page
//     via a server-created session, so no stripe.com script/frame allowance
//     is needed either.
//   - Crisp Live Chat (components/CrispChat.tsx) needs script-src for its
//     loader (client.crisp.chat) and connect-src for both that same origin
//     (its own XHR calls) and its realtime relay (client.relay.crisp.chat,
//     wss:// for the websocket + https:// fallback) — scoped to exactly
//     these two Crisp domains, nothing broader.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://client.crisp.chat",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://client.crisp.chat wss://client.relay.crisp.chat https://client.relay.crisp.chat",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Geolocation confirmed unused anywhere in the app (grepped before writing
  // this) — no "jobs near me" feature exists today, so it's blocked along
  // with the other unused sensitive browser features.
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

module.exports = withNextIntl(nextConfig)
