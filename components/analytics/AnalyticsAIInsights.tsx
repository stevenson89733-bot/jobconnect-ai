import { ListChecks, FileEdit } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import CareerCoachSummary from '@/components/shared/CareerCoachSummary'
import InsightCard from '@/components/career-coach/InsightCard'
import SkillTag from '@/components/career-coach/SkillTag'
import FadeIn from '@/components/dashboard/FadeIn'
import type { CareerAnalysis } from '@/lib/ai/careerCoach'

function BulletList({ items, emptyLabel }: { items: string[]; emptyLabel: string }) {
  if (items.length === 0) return <p className="text-slate-600 dark:text-slate-400">{emptyLabel}</p>
  return (
    <ul className="space-y-1.5 list-disc list-inside">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  )
}

// Surfaces the SAME real career_analysis row already used on /candidate and
// /candidate/career-coach — CareerCoachSummary itself is reused unchanged
// (same source of truth, same "Run Career Coach Analysis" CTA when no
// analysis exists yet), and Missing Skills / Resume Suggestions are read
// straight off the same analysis object, never recomputed here.
export default async function AnalyticsAIInsights({
  isPremium,
  analysis,
  generatedAt,
}: {
  isPremium: boolean
  analysis: CareerAnalysis | null
  generatedAt: string | null
}) {
  const t = await getTranslations('analytics')
  const tc = await getTranslations('careerCoach')

  return (
    <div className="space-y-6">
      <FadeIn delay={0.15}>
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4">{t('aiInsights')}</h2>
        <CareerCoachSummary
          isPremium={isPremium}
          atsScore={analysis?.atsScore.score ?? null}
          profileStrength={analysis?.profileStrength.score ?? null}
          generatedAt={generatedAt}
        />
      </FadeIn>

      {analysis && (
        <div className="grid sm:grid-cols-2 gap-6">
          <InsightCard icon={ListChecks} title={tc('insightMissingSkills')} delay={0.05}>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">{tc('basedOnProfile')}</p>
            {analysis.missingSkills.length === 0 ? (
              <p className="text-slate-600 dark:text-slate-400">{tc('nothingSignificantFlagged')}</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {analysis.missingSkills.map((s) => <SkillTag key={s} label={s} />)}
              </div>
            )}
          </InsightCard>
          <InsightCard icon={FileEdit} title={tc('insightResumeSuggestions')} delay={0.1}>
            <BulletList items={analysis.resumeSuggestions} emptyLabel={tc('nothingToShow')} />
          </InsightCard>
        </div>
      )}
    </div>
  )
}
