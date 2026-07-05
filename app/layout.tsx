import './globals.css'
import React from 'react'
import { cookies } from 'next/headers'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { ThemeProvider } from '../components/ThemeProvider'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'JobConnect AI — Find Your Next Remote Job with AI',
  description: 'AI-powered remote job platform connecting top candidates with leading companies',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let user = null
  const supabaseConfigured =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('https://') &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('your_')

  if (supabaseConfigured) {
    try {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      user = data.user
    } catch {
      // silently ignore — session unavailable
    }
  }

  // Read the persisted theme cookie so SSR can emit the right initial class
  // (no flash). For "system"/absent we let next-themes' inline script resolve it.
  const themeCookie = cookies().get('theme')?.value
  const htmlClass = themeCookie === 'dark' ? 'dark' : themeCookie === 'light' ? 'light' : undefined

  return (
    <html lang="en" className={htmlClass} suppressHydrationWarning>
      <body className="bg-white text-slate-900 dark:bg-background dark:text-slate-100 antialiased font-sans">
        <ThemeProvider>
          <Header userEmail={user?.email} />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
