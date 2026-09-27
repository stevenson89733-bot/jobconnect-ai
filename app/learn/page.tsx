import { createClient } from '@/lib/supabase/server'
import { effectiveCandidatePlan } from '@/lib/adminAccess'
import DownloadGuideButton from '@/components/learn/DownloadGuideButton'

const GUIDES = [
  {
    id: 'negociation',
    slug: 'salary-negotiation',
    title: 'Négociation Salariale Internationale',
    description: 'Tactiques éprouvées pour négocier dans 12 pays différents',
    meta: 'PDF · 24 pages',
    badge: 'Pro',
    badgeColor: 'bg-blue-100 text-blue-700',
    requiresPlan: 'pro' as const,
  },
  {
    id: 'linkedin',
    slug: 'linkedin-expats',
    title: 'LinkedIn pour Expatriés',
    description: 'Optimiser son profil pour les recruteurs remote',
    meta: 'PDF · 18 pages',
    badge: 'Pro',
    badgeColor: 'bg-blue-100 text-blue-700',
    requiresPlan: 'pro' as const,
  },
  {
    id: 'entretien',
    slug: 'remote-interview',
    title: 'Maîtriser l\'Entretien Remote',
    description: 'De la préparation à l\'offre en 30 jours',
    meta: 'PDF · 32 pages',
    badge: 'Pro',
    badgeColor: 'bg-blue-100 text-blue-700',
    requiresPlan: 'pro' as const,
  },
  {
    id: 'contrats',
    slug: 'international-contracts',
    title: 'Contrats & Compliance Internationale',
    description: 'Comprendre votre contrat dans 8 juridictions clés',
    meta: 'PDF · 40 pages',
    badge: 'Elite',
    badgeColor: 'bg-purple-100 text-purple-700',
    requiresPlan: 'elite' as const,
  },
]

const RESOURCES = [
  {
    category: 'Plateformes',
    categoryColor: 'bg-cyan-100 text-cyan-700',
    items: [
      { title: 'Remote.co', description: 'Offres remote vérifiées dans tous les secteurs', href: 'https://remote.co' },
      { title: 'Wellfound', description: 'Jobs dans les startups tech mondiales', href: 'https://wellfound.com' },
      { title: 'We Work Remotely', description: 'La plus grande communauté remote du monde', href: 'https://weworkremotely.com' },
    ],
  },
  {
    category: 'Formation',
    categoryColor: 'bg-green-100 text-green-700',
    items: [
      { title: 'Négociation Salariale', description: 'Cours Udemy — techniques de négociation pro', href: 'https://www.udemy.com/topic/negotiation/?deal_code=ST9MT101524' },
      { title: 'LinkedIn Optimization', description: 'LinkedIn Learning — optimiser son profil', href: 'https://www.linkedin.com/learning/topics/linkedin' },
    ],
  },
  {
    category: 'Outils',
    categoryColor: 'bg-orange-100 text-orange-700',
    items: [
      { title: 'Wise', description: 'Transferts internationaux sans frais cachés', href: 'https://wise.com' },
      { title: 'Deel', description: 'Contrats et paie pour travailleurs remote', href: 'https://www.letsdeel.com' },
      { title: 'Payoneer', description: 'Recevoir des paiements depuis l\'étranger', href: 'https://www.payoneer.com' },
    ],
  },
]

export default async function LearnPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isPro = false
  let isElite = false
  let isAdmin = false

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('candidate_plan, is_admin, is_premium')
      .eq('user_id', user.id)
      .single()

    const plan = effectiveCandidatePlan(profile ?? {})
    isPro = profile?.is_admin || profile?.is_premium || ['pro', 'elite'].includes(plan)
    isElite = profile?.is_admin || plan === 'elite'
    isAdmin = !!profile?.is_admin
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero */}
      <div style={{ background: '#0F1623' }} className="px-6 py-16 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
          Boostez votre carrière internationale
        </h1>
        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
          Guides exclusifs, ressources curées et conseils d&apos;experts pour décrocher votre job remote idéal
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-14">

        {/* Section 1 — Guides Exclusifs */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Guides Exclusifs</h2>
            {!isPro && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                Pro / Elite
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {GUIDES.map((guide) => {
              const unlocked = guide.requiresPlan === 'elite' ? isElite : isPro
              return (
                <div
                  key={guide.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 flex flex-col gap-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${guide.badgeColor}`}>
                          {guide.badge}
                        </span>
                        <span className="text-xs text-slate-400">{guide.meta}</span>
                      </div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-snug">
                        {guide.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{guide.description}</p>
                    </div>
                    {!unlocked && (
                      <span style={{ color: '#F0663A' }} className="text-xl shrink-0">🔒</span>
                    )}
                  </div>

                  <DownloadGuideButton
                    slug={guide.slug}
                    unlocked={unlocked}
                    requiresPlan={guide.requiresPlan}
                  />
                </div>
              )
            })}
          </div>
        </section>

        {/* Section 2 — Ressources Curées */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Ressources Curées</h2>
          <div className="space-y-8">
            {RESOURCES.map((group) => (
              <div key={group.category}>
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                  {group.category}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {group.items.map((item) => (
                    <a
                      key={item.title}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-start justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-600 transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${group.categoryColor}`}>
                            {group.category}
                          </span>
                        </div>
                        <p className="font-semibold text-sm text-slate-900 dark:text-white">{item.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.description}</p>
                      </div>
                      <span className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors text-sm font-medium shrink-0 mt-1">
                        Voir →
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
