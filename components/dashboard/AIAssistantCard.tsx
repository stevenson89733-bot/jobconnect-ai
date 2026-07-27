import Link from 'next/link'
import { FileText, Mail, HelpCircle, ArrowRight, ArrowLeft } from 'lucide-react'
import { getTranslations, getLocale } from 'next-intl/server'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { isRtlLocale, type Locale } from '@/lib/i18n/config'
import FadeIn from './FadeIn'

// Intentionally just an entry point to the AI tools that actually exist
// (Resume Builder, Cover Letter Generator, Interview Prep) — no fabricated
// "AI insights" or profile analysis beyond what's real.
export default async function AIAssistantCard() {
  const t = await getTranslations('candidate')
  const rtl = isRtlLocale((await getLocale()) as Locale)
  // "Points toward reading-end" — ArrowRight in LTR, ArrowLeft in RTL — same
  // for the hover nudge, which otherwise animates toward the wrong edge.
  const ForwardArrow = rtl ? ArrowLeft : ArrowRight
  const hoverNudgeClass = rtl ? 'group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5'

  return (
    <FadeIn>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-orange-600 dark:text-accent">✦</span> {t('aiAssistantTitle')}
          </CardTitle>
          <CardDescription>{t('aiAssistantSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <Link
            href="/ai-tools/resume-builder"
            className="group rounded-lg border border-slate-200 dark:border-slate-700/50 p-4 hover:border-primary/50 transition-colors flex items-start gap-3"
          >
            <FileText className="w-5 h-5 text-primary shrink-0 mt-0.5" strokeWidth={1.75} />
            <div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                {t('resumeBuilderCardTitle')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {t('resumeBuilderCardDesc')}
              </p>
            </div>
            <ForwardArrow className={`w-4 h-4 text-slate-400 dark:text-slate-400 shrink-0 ms-auto mt-0.5 ${hoverNudgeClass} transition-transform`} />
          </Link>
          <Link
            href="/ai-tools/cover-letter"
            className="group rounded-lg border border-slate-200 dark:border-slate-700/50 p-4 hover:border-accent/50 transition-colors flex items-start gap-3"
          >
            <Mail className="w-5 h-5 text-orange-600 dark:text-accent shrink-0 mt-0.5" strokeWidth={1.75} />
            <div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-accent transition-colors">
                {t('coverLetterCardTitle')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {t('coverLetterCardDesc')}
              </p>
            </div>
            <ForwardArrow className={`w-4 h-4 text-slate-400 dark:text-slate-400 shrink-0 ms-auto mt-0.5 ${hoverNudgeClass} transition-transform`} />
          </Link>
          <Link
            href="/ai-tools/interview-prep"
            className="group rounded-lg border border-slate-200 dark:border-slate-700/50 p-4 hover:border-primary/50 transition-colors flex items-start gap-3"
          >
            <HelpCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" strokeWidth={1.75} />
            <div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                {t('interviewPrepCardTitle')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {t('interviewPrepCardDesc')}
              </p>
            </div>
            <ForwardArrow className={`w-4 h-4 text-slate-400 dark:text-slate-400 shrink-0 ms-auto mt-0.5 ${hoverNudgeClass} transition-transform`} />
          </Link>
        </CardContent>
      </Card>
    </FadeIn>
  )
}
