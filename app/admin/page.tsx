import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/requireAdmin'

export default async function AdminPage() {
  const isAdmin = await requireAdmin('/login')
  if (!isAdmin) {
    return (
      <section className="py-16 text-center">
        <h2 className="text-2xl font-semibold mb-2 text-slate-900 dark:text-white">Not authorized</h2>
        <p className="text-slate-600 dark:text-slate-400">You need admin privileges to access this page.</p>
      </section>
    )
  }

  return (
    <section className="max-w-3xl mx-auto py-10 px-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Admin Panel</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8">Platform management and moderation tools.</p>

      <div className="grid gap-4">
        <Link
          href="/admin/reviews"
          className="card flex items-center gap-4 hover:border-primary/50 transition-colors"
        >
          <span className="text-3xl">🛡️</span>
          <div>
            <div className="font-semibold text-slate-900 dark:text-white">Job Reviews</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Moderate and approve job postings</div>
          </div>
        </Link>

        <Link
          href="/admin/promo-codes"
          className="card flex items-center gap-4 hover:border-primary/50 transition-colors"
        >
          <span className="text-3xl">🎟️</span>
          <div>
            <div className="font-semibold text-slate-900 dark:text-white">Promo Codes</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Create and manage early-access promo codes</div>
          </div>
        </Link>

        <Link
          href="/admin/outreach"
          className="card flex items-center gap-4 hover:border-primary/50 transition-colors"
        >
          <span className="text-3xl">📊</span>
          <div>
            <div className="font-semibold text-slate-900 dark:text-white">Outreach Tracker</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Pipeline kanban for LinkedIn / WhatsApp early adopters</div>
          </div>
        </Link>
      </div>
    </section>
  )
}
