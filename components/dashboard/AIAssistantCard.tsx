import Link from 'next/link'
import { FileText, Mail, ArrowRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import FadeIn from './FadeIn'

// Intentionally just an entry point to the two AI tools that actually exist
// (Resume Builder, Cover Letter Generator) — no fabricated "AI insights" or
// profile analysis, since no such pipeline exists yet.
export default async function AIAssistantCard() {
  const t = await getTranslations('candidate')

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
            <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-400 shrink-0 ml-auto mt-0.5 group-hover:translate-x-0.5 transition-transform" />
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
            <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-400 shrink-0 ml-auto mt-0.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </CardContent>
      </Card>
    </FadeIn>
  )
}
