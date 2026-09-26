import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import FeaturedListingClient from './FeaturedListingClient'

export default async function EmployerFeaturedPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, featured_listing_credits')
    .eq('user_id', user.id)
    .single()

  if (profile?.role !== 'employer') redirect('/login')

  const { data: jobRows } = await supabase
    .from('jobs')
    .select('id, title, is_active, is_featured, featured_until')
    .eq('posted_by', user.id)
    .order('created_at', { ascending: false })

  const jobs = (jobRows ?? []) as {
    id: string
    title: string
    is_active: boolean
    is_featured: boolean
    featured_until: string | null
  }[]

  const credits = profile?.featured_listing_credits ?? 0

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Featured Listing</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
        Mettez votre offre en avant pendant 30 jours — apparaît en tête de liste avec badge ⭐.
      </p>
      <FeaturedListingClient jobs={jobs} credits={credits} />
    </div>
  )
}
