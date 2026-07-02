import Link from 'next/link'
import { signIn } from '@/app/actions/auth'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

async function LoginError({ error }: { error?: string }) {
  if (!error) return null
  return (
    <div className="mb-4 px-4 py-3 rounded-lg bg-red-900/30 border border-red-700 text-red-400 text-sm">
      {decodeURIComponent(error)}
    </div>
  )
}

function LoginForm({ error }: { error?: string }) {
  return (
    <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl mb-6">
            <span className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white text-sm font-black">J</span>
            <span className="text-white">JobConnect <span className="text-primary">AI</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-white mt-4">Welcome back</h1>
          <p className="text-slate-400 mt-1 text-sm">Sign in to your account</p>
        </div>

        <div className="card">
          <LoginError error={error} />

          <form action={signIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full bg-background border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-sm font-medium text-slate-300">Password</label>
                <Link href="/forgot-password" className="text-xs text-primary hover:text-blue-400">Forgot password?</Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full bg-background border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full btn-primary py-3 mt-2"
            >
              Sign in
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary hover:text-blue-400 font-medium">Create one</Link>
          </p>
        </div>
      </div>
    </section>
  )
}

export default async function Login({ searchParams }: { searchParams: { error?: string } }) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) redirect('/dashboard')
  } catch {}

  return (
    <Suspense>
      <LoginForm error={searchParams.error} />
    </Suspense>
  )
}
