import { useTranslations } from 'next-intl'
import type { CompanyProfileSummary } from '@/lib/companyProfileSummary'

export default function CompanySummarySection({
  name,
  summary,
}: {
  name: string
  summary: CompanyProfileSummary | null
}) {
  const t = useTranslations('companyProfile')

  if (!summary) return null

  return (
    <div className="card mb-6">
      <h2 className="font-semibold text-slate-900 dark:text-white mb-2">{t('cultureOverview')}</h2>
      {summary.found ? (
        <>
          <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap mb-3">{summary.summary}</p>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-xs text-slate-600 dark:text-slate-400">✦ {t('sourcedViaWebSearch')}</p>
            {summary.sources.length > 0 && (
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {summary.sources.map((s, i) => (
                  <a
                    key={i}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    {s.title || s.url}
                  </a>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <p className="text-sm text-slate-600 dark:text-slate-400">{t('noVerifiedInfo', { name })}</p>
      )}
    </div>
  )
}
