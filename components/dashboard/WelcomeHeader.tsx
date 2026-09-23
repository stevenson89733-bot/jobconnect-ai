import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import FadeIn from './FadeIn'

function getGreeting(hour: number) {
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

export default async function WelcomeHeader({
  firstName,
  initials,
  avatarUrl,
  applicationsCount = 0,
  recommendedJobsCount = 0,
  isElite = false,
}: {
  firstName: string
  initials: string
  avatarUrl: string | null
  applicationsCount?: number
  recommendedJobsCount?: number
  isElite?: boolean
}) {
  const t = await getTranslations('candidate')
  const now = new Date()
  const hour = now.getUTCHours()
  const greeting = getGreeting(hour)
  const dateLabel = formatDate(now)

  const pendingCount = applicationsCount
  const nextAction = recommendedJobsCount > 0
    ? `${recommendedJobsCount} job${recommendedJobsCount > 1 ? 's' : ''} matched your profile`
    : 'Complete your profile to unlock job matches'

  return (
    <FadeIn className="flex flex-col gap-4">
      {/* Date + greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="w-14 h-14 text-xl">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={firstName} />}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            {isElite && (
              <span className="absolute -bottom-1 -right-1 text-xs bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold px-1.5 py-0.5 rounded-full leading-none shadow-sm">
                ⭐ Elite
              </span>
            )}
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">{dateLabel}</p>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {greeting}, {firstName} 👋
              </h1>
              {isElite && (
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-sm">
                  ⭐ Elite
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href="/jobs"><Button variant="outline" size="md">{t('browseJobs')}</Button></Link>
          <Link href="/profile"><Button variant="primary" size="md">{t('editProfile')}</Button></Link>
        </div>
      </div>

      {/* Today's summary row */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white dark:bg-card border border-slate-200 dark:border-slate-700 rounded-full px-4 py-1.5 text-sm text-slate-600 dark:text-slate-300 shadow-sm">
          <span className="text-base">📨</span>
          <span><strong className="text-slate-900 dark:text-white">{pendingCount}</strong> application{pendingCount !== 1 ? 's' : ''} sent</span>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-card border border-slate-200 dark:border-slate-700 rounded-full px-4 py-1.5 text-sm text-slate-600 dark:text-slate-300 shadow-sm">
          <span className="text-base">✦</span>
          <span>{nextAction}</span>
        </div>
        <Link
          href="/ai-tools/resume-builder"
          className="flex items-center gap-2 bg-[#57C7E3]/10 border border-[#57C7E3]/30 rounded-full px-4 py-1.5 text-sm text-[#57C7E3] font-medium shadow-sm hover:bg-[#57C7E3]/20 transition-colors"
        >
          <span>🤖</span>
          <span>Optimize resume →</span>
        </Link>
      </div>
    </FadeIn>
  )
}
