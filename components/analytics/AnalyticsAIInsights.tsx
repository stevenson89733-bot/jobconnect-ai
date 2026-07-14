import { ListChecks, FileEdit } from 'lucide-react'
import CareerCoachSummary from '@/components/shared/CareerCoachSummary'
import InsightCard from '@/components/career-coach/InsightCard'
import SkillTag from '@/components/career-coach/SkillTag'
import FadeIn from '@/components/dashboard/FadeIn'
import type { CareerAnalysis } from '@/lib/ai/careerCoach'

function BulletList({ items }: { items: string[] }) {
  if (items.length === 0) return <p className="text-slate-500 dark:text-slate-500">Nothing to show.</p>
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
export default function AnalyticsAIInsights({
  isPremium,
  analysis,
  generatedAt,
}: {
  isPremium: boolean
  analysis: CareerAnalysis | null
  generatedAt: string | null
}) {
  return (
    <div className="space-y-6">
      <FadeIn delay={0.15}>
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4">AI Insights</h2>
        <CareerCoachSummary
          isPremium={isPremium}
          atsScore={analysis?.atsScore.score ?? null}
          profileStrength={analysis?.profileStrength.score ?? null}
          generatedAt={generatedAt}
        />
      </FadeIn>

      {analysis && (
        <div className="grid sm:grid-cols-2 gap-6">
          <InsightCard icon={ListChecks} title="Missing Skills" delay={0.05}>
            <p className="text-xs text-slate-500 dark:text-slate-500 mb-3">Based on your profile</p>
            {analysis.missingSkills.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-500">Nothing significant flagged.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {analysis.missingSkills.map((s) => <SkillTag key={s} label={s} />)}
              </div>
            )}
          </InsightCard>
          <InsightCard icon={FileEdit} title="Resume Suggestions" delay={0.1}>
            <BulletList items={analysis.resumeSuggestions} />
          </InsightCard>
        </div>
      )}
    </div>
  )
}
