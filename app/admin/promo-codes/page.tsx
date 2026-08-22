import { requireAdmin } from '@/lib/auth/requireAdmin'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import PromoCodesClient from './PromoCodesClient'

async function getCodes() {
  const db = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data } = await db
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false })
  return data ?? []
}

export default async function PromoCodesPage() {
  const isAdmin = await requireAdmin('/login')
  if (!isAdmin) {
    return (
      <section className="py-16 text-center">
        <h2 className="text-2xl font-semibold mb-2 text-slate-900 dark:text-white">Not authorized</h2>
        <p className="text-slate-600 dark:text-slate-400">You need admin privileges to access this page.</p>
      </section>
    )
  }

  const codes = await getCodes()

  return (
    <section className="max-w-4xl mx-auto py-10 px-6">
      <div className="mb-8">
        <a href="/admin" className="text-sm text-primary dark:text-blue-400 hover:underline">← Admin Panel</a>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-2 mb-1">Promo Codes</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">Each code grants 90 days of free Premium access to the user who redeems it.</p>
      </div>

      <PromoCodesClient initialCodes={codes} />
    </section>
  )
}
