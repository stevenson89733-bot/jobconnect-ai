import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Displays the ONE existing career_analysis result (Career Coach) — never
// a second/duplicate scoring system computed here. If none exists yet
// (candidate hasn't run it, or isn't Premium), shows a real prompt/link
// instead of a fabricated placeholder score.
//
// `compact` drops the explanatory copy and the "last generated" line —
// used on /candidate as a quick snapshot, so it doesn't duplicate the
// fuller version shown on /profile.
export default function CareerCoachSummary({
  isPremium,
  atsScore,
  profileStrength,
  generatedAt,
  compact = false,
}: {
  isPremium: boolean
  atsScore: number | null
  profileStrength: number | null
  generatedAt: string | null
  compact?: boolean
}) {
  const hasAnalysis = atsScore != null && profileStrength != null

  return (
    <Card>
      <CardContent className={compact ? 'p-5' : 'p-6'}>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-orange-600 dark:text-accent" strokeWidth={1.75} />
          <h2 className="font-semibold text-slate-900 dark:text-white">AI Career Coach</h2>
        </div>

        {!isPremium ? (
          <>
            {!compact && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                ATS Score and Profile Strength are computed by AI Career Coach — a Premium feature.
              </p>
            )}
            <Link href="/pricing"><Button variant="primary" size="sm" className={compact ? 'mt-3' : ''}>View Premium Plans</Button></Link>
          </>
        ) : !hasAnalysis ? (
          <>
            {!compact && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                You haven&rsquo;t run an analysis yet — generate your real ATS Score and Profile Strength from your current profile.
              </p>
            )}
            <Link href="/candidate/career-coach"><Button variant="primary" size="sm" className={compact ? 'mt-3' : ''}>Run Career Coach Analysis</Button></Link>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 mb-4 mt-3">
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{atsScore}<span className="text-sm font-normal text-slate-500">/100</span></p>
                <p className="text-xs text-slate-500 dark:text-slate-500">ATS Score</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{profileStrength}<span className="text-sm font-normal text-slate-500">/100</span></p>
                <p className="text-xs text-slate-500 dark:text-slate-500">Profile Strength</p>
              </div>
            </div>
            {!compact && generatedAt && (
              <p className="text-xs text-slate-500 dark:text-slate-500 mb-3">
                Last generated {new Date(generatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            )}
            <Link href="/candidate/career-coach"><Button variant="outline" size="sm">View Full Analysis</Button></Link>
          </>
        )}
      </CardContent>
    </Card>
  )
}
