import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import FadeIn from './FadeIn'

export default async function WelcomeHeader({
  firstName,
  initials,
  avatarUrl,
}: {
  firstName: string
  initials: string
  avatarUrl: string | null
}) {
  const t = await getTranslations('candidate')

  return (
    <FadeIn className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Avatar className="w-14 h-14 text-xl">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={firstName} />}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t('welcomeBack', { name: firstName })}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">{t('careerSnapshot')}</p>
        </div>
      </div>
      <div className="flex gap-3">
        <Link href="/jobs"><Button variant="outline" size="md">{t('browseJobs')}</Button></Link>
        <Link href="/profile"><Button variant="primary" size="md">{t('editProfile')}</Button></Link>
      </div>
    </FadeIn>
  )
}
