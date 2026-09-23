'use client'
import Link from 'next/link'
import { useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { signIn } from '@/app/actions/auth'
import PasswordInput from '@/components/PasswordInput'

export default function LoginForm({ error }: { error?: string }) {
  const t = useTranslations('auth.login')
  const tc = useTranslations('common')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(() => { signIn(fd) })
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl mb-6">
            <span className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white text-sm font-black">J</span>
            <span className="text-slate-900 dark:text-white">{tc('brand')} <span className="text-primary dark:text-blue-400">{tc('brandSuffix')}</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-4">{t('welcomeBack')}</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">{t('signInToAccount')}</p>
        </div>

        <div className="card">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 text-sm">
              {decodeURIComponent(error)}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('email')}</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full bg-white dark:bg-background border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('password')}</label>
                <Link href="/forgot-password" className="text-xs text-primary dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">{t('forgotPassword')}</Link>
              </div>
              <PasswordInput
                id="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full bg-white dark:bg-background border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full btn-primary py-3 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in…
                </span>
              ) : t('signIn')}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-400">
            {t('noAccount')}{' '}
            <Link href="/register" className="text-primary dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium">{t('createOne')}</Link>
          </p>
        </div>
      </div>
    </section>
  )
}
