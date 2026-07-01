'use client'
import Link from 'next/link'
import { useState } from 'react'
import { signOut } from '@/app/actions/auth'

export default function Header({ userEmail }: { userEmail?: string | null }) {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <img src="/logo.png" alt="JobConnect AI" height={40} className="object-contain" style={{ height: 40, width: 'auto' }} />
          <span className="text-white">JobConnect <span className="text-primary">AI</span></span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
          <Link href="/jobs" className="hover:text-white transition-colors">Browse Jobs</Link>
          <Link href="/companies" className="hover:text-white transition-colors">Companies</Link>
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {userEmail ? (
            <>
              <Link href="/dashboard" className="text-sm text-slate-300 hover:text-white transition-colors px-4 py-2">
                Dashboard
              </Link>
              <form action={signOut}>
                <button type="submit" className="btn-outline text-sm py-2">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-slate-300 hover:text-white transition-colors px-4 py-2">
                Sign in
              </Link>
              <Link href="/register" className="btn-primary text-sm">
                Get Started
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setOpen(!open)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-card border-t border-slate-800 px-6 py-4 flex flex-col gap-4 text-sm">
          <Link href="/jobs" className="text-slate-300 hover:text-white" onClick={() => setOpen(false)}>Browse Jobs</Link>
          <Link href="/companies" className="text-slate-300 hover:text-white" onClick={() => setOpen(false)}>Companies</Link>
          <Link href="/pricing" className="text-slate-300 hover:text-white" onClick={() => setOpen(false)}>Pricing</Link>
          {userEmail ? (
            <>
              <Link href="/dashboard" className="text-slate-300 hover:text-white" onClick={() => setOpen(false)}>Dashboard</Link>
              <form action={signOut}><button type="submit" className="text-left text-slate-300 hover:text-white">Sign out</button></form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-slate-300 hover:text-white" onClick={() => setOpen(false)}>Sign in</Link>
              <Link href="/register" className="btn-primary text-center" onClick={() => setOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
