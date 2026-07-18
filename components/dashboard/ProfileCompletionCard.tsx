import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import FadeIn from './FadeIn'

export default async function ProfileCompletionCard({ completion }: { completion: number }) {
  if (completion >= 100) return null
  const t = await getTranslations('candidate')

  return (
    <FadeIn>
      <Card>
        <CardContent className="p-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-[220px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('profileCompletion')}</span>
              <span className="text-sm font-semibold text-primary dark:text-blue-400 tabular-nums">{completion}%</span>
            </div>
            <Progress value={completion} />
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
              {t('completeProfilePrompt')}
            </p>
          </div>
          <Link href="/profile"><Button variant="primary" size="md">{t('completeProfileCta')}</Button></Link>
        </CardContent>
      </Card>
    </FadeIn>
  )
}
