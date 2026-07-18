import Link from 'next/link'
import { UserRound, Search, Sparkles, BarChart3 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import FadeIn from './FadeIn'

// Resume Builder / Cover Letter intentionally live only in the AI Assistant
// card above — not duplicated here.
const ACTIONS: { key: string; href: string; icon: LucideIcon }[] = [
  { key: 'editProfile', href: '/profile', icon: UserRound },
  { key: 'browseJobs', href: '/jobs', icon: Search },
  { key: 'careerCoach', href: '/candidate/career-coach', icon: Sparkles },
  { key: 'analytics', href: '/candidate/analytics', icon: BarChart3 },
]

export default async function QuickActions() {
  const t = await getTranslations('candidate')

  return (
    <FadeIn>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
        {ACTIONS.map(({ key, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-card p-4 hover:border-primary/50 transition-colors text-center"
          >
            <Icon className="w-5 h-5 text-primary" strokeWidth={1.75} />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{t(key)}</span>
          </Link>
        ))}
      </div>
    </FadeIn>
  )
}
