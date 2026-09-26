'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Job = {
  id: string
  title: string
  is_active: boolean
  is_featured: boolean
  featured_until: string | null
}

function isFeaturedActive(job: Job): boolean {
  return job.is_featured && (job.featured_until == null || new Date(job.featured_until) > new Date())
}

export default function FeaturedListingClient({
  jobs,
  credits,
}: {
  jobs: Job[]
  credits: number
}) {
  const router = useRouter()
  const activeJobs = jobs.filter((j) => j.is_active)
  const [selectedJobId, setSelectedJobId] = useState(activeJobs[0]?.id ?? '')
  const [loadingBuy, setLoadingBuy] = useState(false)
  const [loadingCredit, setLoadingCredit] = useState(false)
  const [error, setError] = useState('')

  async function handleBuy() {
    setLoadingBuy(true)
    setError('')
    try {
      const res = await fetch('/api/stripe/checkout/featured-listing', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error ?? 'Erreur Stripe')
        setLoadingBuy(false)
      }
    } catch {
      setError('Erreur réseau')
      setLoadingBuy(false)
    }
  }

  async function handleApplyCredit() {
    if (!selectedJobId) return
    setLoadingCredit(true)
    setError('')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('Non authentifié'); setLoadingCredit(false); return }

      const featuredUntil = new Date()
      featuredUntil.setDate(featuredUntil.getDate() + 30)

      const { error: jobErr } = await supabase
        .from('jobs')
        .update({ is_featured: true, featured_until: featuredUntil.toISOString() })
        .eq('id', selectedJobId)
        .eq('posted_by', user.id)

      if (jobErr) { setError(jobErr.message); setLoadingCredit(false); return }

      const { error: profileErr } = await supabase
        .from('profiles')
        .update({ featured_listing_credits: credits - 1 })
        .eq('user_id', user.id)

      if (profileErr) { setError(profileErr.message); setLoadingCredit(false); return }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur')
      setLoadingCredit(false)
    }
  }

  return (
    <div className="space-y-6">

      {/* Current status per job */}
      {jobs.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
          <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Statut de vos offres</h2>
          </div>
          <ul className="divide-y divide-slate-100 dark:divide-slate-700">
            {jobs.map((job) => {
              const active = isFeaturedActive(job)
              return (
                <li key={job.id} className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm text-slate-800 dark:text-slate-200">{job.title}</span>
                  <div className="flex items-center gap-3">
                    {active ? (
                      <>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                          ⭐ Featured actif
                        </span>
                        {job.featured_until && (
                          <span className="text-xs text-slate-500">
                            jusqu&apos;au {new Date(job.featured_until).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">
                        Inactif
                      </span>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Apply credit */}
      {credits > 0 && activeJobs.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
            Vous avez {credits} crédit{credits > 1 ? 's' : ''} featured
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-400 mb-4">
            Appliquez un crédit pour mettre une offre en avant pendant 30 jours.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="flex-1 rounded-lg border border-amber-200 dark:border-amber-700 bg-white dark:bg-slate-900 text-sm px-3 py-2 text-slate-900 dark:text-white"
            >
              {activeJobs.map((j) => (
                <option key={j.id} value={j.id}>{j.title}</option>
              ))}
            </select>
            <button
              onClick={handleApplyCredit}
              disabled={loadingCredit || !selectedJobId}
              className="shrink-0 text-sm font-semibold px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loadingCredit ? '…' : '⭐ Appliquer le crédit'}
            </button>
          </div>
        </div>
      )}

      {/* Buy */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Acheter un Featured Listing</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              30 jours · Visibilité maximale · Badge ⭐ sur votre offre
            </p>
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white whitespace-nowrap">$49</span>
        </div>
        <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 mb-5">
          <li>✓ Apparaît en tête de liste sur /jobs</li>
          <li>✓ Badge Featured visible par les candidats</li>
          <li>✓ Actif 30 jours à partir de l&apos;activation</li>
        </ul>
        <button
          onClick={handleBuy}
          disabled={loadingBuy}
          className="w-full sm:w-auto text-sm font-semibold px-6 py-2.5 rounded-lg bg-accent hover:bg-orange-600 text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loadingBuy ? 'Redirection…' : 'Activer Featured → $49'}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}
