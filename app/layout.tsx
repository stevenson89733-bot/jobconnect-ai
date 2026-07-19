import './globals.css'
import React from 'react'
import { cookies } from 'next/headers'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { ThemeProvider } from '../components/ThemeProvider'
import { createClient } from '@/lib/supabase/server'
import CopilotWidget from '@/components/copilot/CopilotWidget'
import CrispChat from '@/components/CrispChat'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
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

  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} className={`${htmlClass ?? ''} ${inter.variable}`.trim()} suppressHydrationWarning>
      <body className="bg-white text-slate-900 dark:bg-background dark:text-slate-100 antialiased font-sans">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ThemeProvider>
            <Header userEmail={user?.email} isAdmin={isAdmin} />
            <main>{children}</main>
            <Footer />
            {isCandidate && <CopilotWidget />}
            <CrispChat />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
