import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Card, CardContent } from '@/components/ui/card'
import FadeIn from './FadeIn'

// Deliberately minimal — full title/location/bio/badges/portfolio detail
// lives on /profile (the single source of truth for that content) so this
// dashboard card doesn't duplicate it. Just enough to orient, plus a
// direct link to the real thing.
export default async function ProfileSnapshot({ title }: { title: string | null }) {
  const t = await getTranslations('candidate')

  return (
    <FadeIn>
      <Card>
        <CardContent className="p-5 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {title?.trim() || <span className="text-slate-600 dark:text-slate-400">{t('addProfessionalTitlePrompt')}</span>}
          </p>
          <Link href="/profile" className="text-xs font-medium text-primary dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 shrink-0">
            {t('viewProfile')}
          </Link>
        </CardContent>
      </Card>
    </FadeIn>
  )
}
