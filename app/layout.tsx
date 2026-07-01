import './globals.css'
import React from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
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

  return (
    <html lang="en" className="dark">
      <body className="bg-background text-slate-100 antialiased font-sans">
        <Header userEmail={user?.email} />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
