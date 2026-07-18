import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { MatchedJob } from '@/lib/jobMatching'
import FadeIn from './FadeIn'

// Real recommendations: active job postings whose tags overlap with the
// candidate's own listed skills. No score/percentage is invented — only the
// actual matched tags are shown, and the section only renders when there's
// at least one genuine match.
export default async function JobRecommendations({ jobs }: { jobs: MatchedJob[] }) {
  if (jobs.length === 0) return null
  const t = await getTranslations('candidate')

  return (
    <FadeIn>
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-600 dark:text-accent" strokeWidth={1.75} />
              {t('recommendedForYou')}
            </CardTitle>
            <CardDescription className="mt-0.5">{t('basedOnSkills')}</CardDescription>
          </div>
          <Link href="/jobs" className="text-xs text-primary dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 shrink-0">
            {t('seeAllJobs')}
          </Link>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href="/jobs"
              className="rounded-lg border border-slate-200 dark:border-slate-700/50 p-4 hover:border-primary/50 transition-colors block"
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white">{job.title}</h3>
                {job.salary_label && (
                  <span className="text-xs font-semibold text-orange-700 dark:text-accent whitespace-nowrap">{job.salary_label}</span>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">{job.company_name}</p>
              <div className="flex flex-wrap gap-1.5">
                {job.matchedTags.map((tag) => (
                  <Badge key={tag} variant="primary">{tag}</Badge>
                ))}
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </FadeIn>
  )
}
