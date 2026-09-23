import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { absoluteUrl } from '@/lib/seo'
import {
  FileText,
  Mail,
  Mic,
  Link2,
  TrendingUp,
  FileSearch,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'AI Tools | JobConnect AI',
  description: 'AI-powered tools to build your resume, write cover letters, prep for interviews, and more — all from your real profile.',
  alternates: { canonical: absoluteUrl('/ai-tools') },
  openGraph: {
    title: 'AI Tools | JobConnect AI',
    description: 'AI-powered tools to accelerate your remote job search.',
    url: absoluteUrl('/ai-tools'),
    type: 'website',
  },
}

const tools = [
  {
    href: '/ai-tools/resume-builder',
    icon: FileText,
    titleKey: 'resumeBuilder' as const,
    descKey: 'resumeBuilderDesc' as const,
    premium: true,
  },
  {
    href: '/ai-tools/cv-builder',
    icon: FileSearch,
    titleKey: 'cvBuilder' as const,
    descKey: 'cvBuilderDesc' as const,
    premium: true,
  },
  {
    href: '/ai-tools/cover-letter',
    icon: Mail,
    titleKey: 'coverLetter' as const,
    descKey: 'coverLetterDesc' as const,
    premium: true,
  },
  {
    href: '/ai-tools/interview-prep',
    icon: Mic,
    titleKey: 'interviewPrep' as const,
    descKey: 'interviewPrepDesc' as const,
    premium: true,
  },
  {
    href: '/ai-tools/linkedin-optimizer',
    icon: Link2,
    titleKey: 'linkedinOptimizer' as const,
    descKey: 'linkedinOptimizerDesc' as const,
    premium: true,
  },
  {
    href: '/ai-tools/skill-gap',
    icon: TrendingUp,
    titleKey: 'skillGap' as const,
    descKey: 'skillGapDesc' as const,
    premium: true,
  },
]

export default async function AIToolsIndexPage() {
  const t = await getTranslations('nav')

  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {t('aiTools')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base">
            AI-powered tools built from your real profile — no copy-paste needed.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tools.map(({ href, icon: Icon, titleKey, descKey, premium }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-start gap-4 p-5 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-card hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-800/40 transition-colors">
                <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-slate-900 dark:text-white text-sm">
                    {t(titleKey)}
                  </span>
                  {premium && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 leading-none">
                      Pro
                    </span>
                  )}
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                  {t(descKey)}
                </p>
              </div>
              <div className="flex-shrink-0 self-center text-slate-300 dark:text-slate-600 group-hover:text-blue-400 dark:group-hover:text-blue-500 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
