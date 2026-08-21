import './globals.css'
import React from 'react'
import { cookies } from 'next/headers'
import { Inter, Noto_Sans_Arabic, Sora } from 'next/font/google'
import Script from 'next/script'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { Analytics } from '@vercel/analytics/react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { ThemeProvider } from '../components/ThemeProvider'
import { createClient } from '@/lib/supabase/server'
import CopilotWidget from '@/components/copilot/CopilotWidget'
import CrispChat from '@/components/CrispChat'
import FaqWidget from '@/components/FaqWidget'
import { CountryProvider } from '@/components/country/CountryProvider'
import { COUNTRY_COOKIE, DEFAULT_COUNTRY, isCountryCode } from '@/lib/countries'
import { isRtlLocale, type Locale } from '@/lib/i18n/config'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
})

// Heading font — geometric, distinctive, strong at heavy weights.
// Body stays Inter (legibility across 11 locales). Sora covers latin only;
// Arabic headings fall back to Noto Sans Arabic already loaded below.
const sora = Sora({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-sora',
  display: 'swap',
})

// Fallback-only (see tailwind.config.js) — Inter has no Arabic glyphs, this
// covers the "ar" locale without a per-locale className branch.
const notoSansArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-arabic',
  display: 'swap',
})

export const metadata = {
  title: 'JobConnect AI — Find Your Next Remote Job with AI',
  description: 'AI-powered remote job platform connecting top candidates with leading companies',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let user = null
  let isAdmin = false
  let isCandidate = false
  const supabaseConfigured =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('https://') &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('your_')

  if (supabaseConfigured) {
    try {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      user = data.user
      if (user) {
        // Resolved server-side, same as requireAdmin() on /admin/reviews
        // itself — the Header never receives this for a non-admin user, so
        // there's no "Admin" link in the rendered HTML to find, not just one
        // hidden by CSS/client-side.
        const { data: profile } = await supabase.from('profiles').select('is_admin, role').eq('user_id', user.id).single()
        isAdmin = profile?.is_admin ?? false
        isCandidate = profile?.role === 'candidate'
      }
    } catch {
      // silently ignore — session unavailable
    }
  }

  // Read the persisted theme cookie so SSR can emit the right initial class
  // (no flash). For "system"/absent we let next-themes' inline script resolve it.
  const themeCookie = cookies().get('theme')?.value
  const htmlClass = themeCookie === 'dark' ? 'dark' : themeCookie === 'light' ? 'light' : undefined

  const locale = (await getLocale()) as Locale
  const messages = await getMessages()

  const countryCookie = cookies().get(COUNTRY_COOKIE)?.value
  const initialCountry = isCountryCode(countryCookie) ? countryCookie : DEFAULT_COUNTRY

  return (
    <html
      lang={locale}
      dir={isRtlLocale(locale) ? 'rtl' : 'ltr'}
      className={`${htmlClass ?? ''} ${inter.variable} ${notoSansArabic.variable} ${sora.variable}`.trim()}
      suppressHydrationWarning
    >
      <body className="bg-white text-slate-900 dark:bg-background dark:text-slate-100 antialiased font-sans">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ThemeProvider>
            <CountryProvider initialCountry={initialCountry}>
              <Header userEmail={user?.email} isAdmin={isAdmin} />
              <main>{children}</main>
              <Footer />
              {isCandidate && <CopilotWidget />}
              <FaqWidget />
              <CrispChat />
            </CountryProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
        <Analytics />
        <Script id="fb-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
          n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
          document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init','1577365084028138');
          fbq('track','PageView');
        `}</Script>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img height="1" width="1" style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1577365084028138&ev=PageView&noscript=1"
            alt="" />
        </noscript>
      </body>
    </html>
  )
}
