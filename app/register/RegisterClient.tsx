'use client'
import Link from 'next/link'
import { useState, useTransition } from 'react'
import { signUp } from '@/app/actions/auth'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'


function RegisterForm() {
  const [role, setRole] = useState<'candidate' | 'employer'>('candidate')
  const [isPending, startTransition] = useTransition()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('role', role)
    startTransition(() => { signUp(fd) })
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl">
            <span className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white text-sm font-black">J</span>
            <span className="text-slate-900 dark:text-white">JobConnect <span className="text-primary dark:text-blue-400">AI</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-4">Create your account</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">Get started with AI-powered job matching</p>
        </div>

        <div className="card">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 text-sm">
              {decodeURIComponent(error)}
            </div>
          )}

          {/* Role selector */}
          <div className="mb-6">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">I want to</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('candidate')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  role === 'candidate'
                    ? 'border-primary bg-primary/10 text-slate-900 dark:text-white'
                    : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600'
                }`}
              >
                <span className="text-2xl">👤</span>
                <div>
                  <div className="font-semibold text-sm">Find a Job</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">I&apos;m a Candidate</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setRole('employer')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  role === 'employer'
                    ? 'border-accent bg-accent/10 text-slate-900 dark:text-white'
                    : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600'
                }`}
              >
                <span className="text-2xl">🏢</span>
                <div>
                  <div className="font-semibold text-sm">Hire Talent</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">I&apos;m an Employer</div>
                </div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">First Name</label>
                <input
                  name="firstName"
                  type="text"
                  required
                  placeholder="Jane"
                  className="w-full bg-white dark:bg-background border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Last Name</label>
                <input
                  name="lastName"
                  type="text"
                  required
                  placeholder="Doe"
                  className="w-full bg-white dark:bg-background border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
              <input
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full bg-background border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>

            {role === 'employer' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Company Name</label>
                <input
                  name="companyName"
                  type="text"
                  placeholder="Acme Inc."
                  className="w-full bg-white dark:bg-background border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="6+ characters"
                className="w-full bg-background border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className={`w-full py-3 font-semibold rounded-xl text-white transition-colors mt-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                role === 'employer'
                  ? 'bg-accent hover:bg-orange-600'
                  : 'bg-primary hover:bg-blue-700'
              }`}
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Creating account…
                </span>
              ) : role === 'candidate' ? 'Create Candidate Account' : 'Create Employer Account'}
            </button>

            <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
              By creating an account you agree to our{' '}
              <Link href="/terms" className="text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white underline">Terms</Link> and{' '}
              <Link href="/privacy" className="text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white underline">Privacy Policy</Link>.
            </p>
          </form>

          <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="text-primary dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </section>
  )
}

export default function RegisterClient() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}
