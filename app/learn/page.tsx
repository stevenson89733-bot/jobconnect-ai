import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { effectiveCandidatePlan } from '@/lib/adminAccess'
import DownloadGuideButton from '@/components/learn/DownloadGuideButton'

export default async function LearnPage() {
  const t = await getTranslations('learn')
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isPro = false
  let isElite = false

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('candidate_plan, is_admin, is_premium')
      .eq('user_id', user.id)
      .single()

    const plan = effectiveCandidatePlan(profile ?? {})
    isPro = !!(profile?.is_admin || profile?.is_premium || ['pro', 'elite'].includes(plan))
    isElite = !!(profile?.is_admin || plan === 'elite')
  }

  const GUIDES = [
    {
      id: 'negociation',
      slug: 'salary-negotiation',
      title: t('guides.salaryTitle'),
      description: t('guides.salaryDesc'),
      meta: t('guides.salaryMeta'),
      badge: 'Pro',
      badgeColor: 'bg-blue-100 text-blue-700',
      requiresPlan: 'pro' as const,
    },
    {
      id: 'linkedin',
      slug: 'linkedin-expats',
      title: t('guides.linkedinTitle'),
      description: t('guides.linkedinDesc'),
      meta: t('guides.linkedinMeta'),
      badge: 'Pro',
      badgeColor: 'bg-blue-100 text-blue-700',
      requiresPlan: 'pro' as const,
    },
    {
      id: 'entretien',
      slug: 'remote-interview',
      title: t('guides.interviewTitle'),
      description: t('guides.interviewDesc'),
      meta: t('guides.interviewMeta'),
      badge: 'Pro',
      badgeColor: 'bg-blue-100 text-blue-700',
      requiresPlan: 'pro' as const,
    },
    {
      id: 'contrats',
      slug: 'international-contracts',
      title: t('guides.contractsTitle'),
      description: t('guides.contractsDesc'),
      meta: t('guides.contractsMeta'),
      badge: 'Elite',
      badgeColor: 'bg-purple-100 text-purple-700',
      requiresPlan: 'elite' as const,
    },
  ]

  const RESOURCES = [
    {
      category: t('catPlatforms'),
      categoryColor: 'bg-cyan-100 text-cyan-700',
      items: [
        { title: 'Remote.co', description: t('remoteCoDesc'), href: 'https://remote.co' },
        { title: 'Wellfound', description: t('wellfoundDesc'), href: 'https://wellfound.com' },
        { title: 'We Work Remotely', description: t('wwrDesc'), href: 'https://weworkremotely.com' },
      ],
    },
    {
      category: t('catTraining'),
      categoryColor: 'bg-green-100 text-green-700',
      items: [
        { title: t('udemyTitle'), description: t('udemyDesc'), href: 'https://www.udemy.com/topic/negotiation/?deal_code=ST9MT101524' },
        { title: t('linkedinLearningTitle'), description: t('linkedinLearningDesc'), href: 'https://www.linkedin.com/learning/topics/linkedin' },
      ],
    },
    {
      category: t('catTools'),
      categoryColor: 'bg-orange-100 text-orange-700',
      items: [
        { title: 'Wise', description: t('wiseDesc'), href: 'https://wise.com' },
        { title: 'Deel', description: t('deelDesc'), href: 'https://www.letsdeel.com' },
        { title: 'Payoneer', description: t('payoneerDesc'), href: 'https://www.payoneer.com' },
      ],
    },
  ]

  const labels = {
    unlockPro: t('unlockPro'),
    unlockElite: t('unlockElite'),
    download: t('download'),
    loading: t('loading'),
    errorUpgrade: t('errorUpgrade'),
    errorUnavailable: t('errorUnavailable'),
    errorNetwork: t('errorNetwork'),
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero */}
      <div style={{ background: '#0F1623' }} className="px-6 py-16 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
          {t('heroTitle')}
        </h1>
        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
          {t('heroSubtitle')}
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-14">

        {/* Section 1 — Guides */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('guidesSection')}</h2>
            {!isPro && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                {t('proBadgeLabel')}
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
                    labels={labels}
                  />
                </div>
              )
            })}
          </div>
        </section>

        {/* Section 2 — Resources */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{t('resourcesSection')}</h2>
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
                        {t('see')}
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
