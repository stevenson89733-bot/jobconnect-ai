import { requireAdmin } from '@/lib/auth/requireAdmin'
import { createClient } from '@supabase/supabase-js'
import OutreachClient from './OutreachClient'
import type { Contact } from './types'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export default async function OutreachPage() {
  const isAdmin = await requireAdmin('/admin/outreach')
  if (!isAdmin) {
    return (
      <section className="py-16 text-center">
        <h2 className="text-2xl font-semibold mb-2 text-slate-900 dark:text-white">Not authorized</h2>
        <p className="text-slate-600 dark:text-slate-400">You need admin privileges to access this page.</p>
      </section>
    )
  }

  const { data } = await db()
    .from('outreach_contacts')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <section className="max-w-7xl mx-auto py-8 px-6">
      <OutreachClient initialContacts={(data ?? []) as Contact[]} />
    </section>
  )
}
