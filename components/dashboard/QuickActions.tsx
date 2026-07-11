import Link from 'next/link'
import { UserRound, Search } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import FadeIn from './FadeIn'

// Resume Builder / Cover Letter intentionally live only in the AI Assistant
// card above — not duplicated here.
const ACTIONS: { label: string; href: string; icon: LucideIcon }[] = [
  { label: 'Edit Profile', href: '/profile', icon: UserRound },
  { label: 'Browse Jobs', href: '/jobs', icon: Search },
]

export default function QuickActions() {
  return (
    <FadeIn>
      <div className="grid grid-cols-2 gap-3 max-w-md">
        {ACTIONS.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-card p-4 hover:border-primary/50 transition-colors text-center"
          >
            <Icon className="w-5 h-5 text-primary" strokeWidth={1.75} />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{label}</span>
          </Link>
        ))}
      </div>
    </FadeIn>
  )
}
