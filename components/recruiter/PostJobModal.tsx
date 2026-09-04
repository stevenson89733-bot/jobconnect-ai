'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import type { RemotiveJob } from '@/lib/remotive'
import { mapRemotiveCategory, mapRemotiveJobType, parseRemotiveSalary } from '@/lib/remotive'
import type { ArbeitnowJob } from '@/lib/arbeitnow'
import { mapArbeitnowJobType } from '@/lib/arbeitnow'
import type { AdzunaJob, AdzunaCountryCode } from '@/lib/adzuna'
import { ADZUNA_COUNTRIES, adzunaSourceKey, formatAdzunaSalary } from '@/lib/adzuna'

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship']
const CATEGORIES = ['Engineering', 'Design', 'Data', 'Research', 'Developer Relations', 'Content']
const WORK_TYPES = ['remote', 'hybrid', 'onsite']
const VALID_JOB_TYPES = new Set(JOB_TYPES)
const VALID_CATEGORIES = new Set(CATEGORIES)
const VALID_WORK_TYPES = new Set(WORK_TYPES)
const JOB_TYPE_KEYS: Record<string, string> = {
  'Full-time': 'typeFullTime', 'Part-time': 'typePartTime', Contract: 'typeContract', Internship: 'typeInternship',
}
const CATEGORY_KEYS: Record<string, string> = {
  Engineering: 'categoryEngineering', Design: 'categoryDesign', Data: 'categoryData',
  Research: 'categoryResearch', 'Developer Relations': 'categoryDevRel', Content: 'categoryContent',
}
const WORK_TYPE_KEYS: Record<string, string> = {
  remote: 'workTypeRemote', hybrid: 'workTypeHybrid', onsite: 'workTypeOnsite',
}

const inputClass =
  'w-full bg-white dark:bg-background border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary'
const labelClass = 'block text-sm text-slate-600 dark:text-slate-400 mb-1.5'

// WWR title format: "Category: Job Title at Company Name"
// Falls back gracefully when the " at " separator or category prefix is absent.
function parseWwrTitle(raw: string): { parsedTitle: string; parsedCompany: string } {
  const withoutCategory = raw.includes(': ') ? raw.split(': ').slice(1).join(': ') : raw
  const atIdx = withoutCategory.lastIndexOf(' at ')
  if (atIdx > 0) {
    return {
      parsedTitle: withoutCategory.slice(0, atIdx).trim(),
      parsedCompany: withoutCategory.slice(atIdx + 4).trim(),
    }
  }
  return { parsedTitle: withoutCategory.trim(), parsedCompany: '' }
}

// Real POST to the existing /api/jobs endpoint (app/api/jobs/route.ts),
// which already enforces the employer role check + RLS insert policy — this
// modal is the first (and only) UI that actually calls it.
export default function PostJobModal({
  companyName,
  triggerClassName,
  triggerLabel,
  isAdmin,
}: {
  companyName: string
  triggerClassName: string
  triggerLabel: string
  isAdmin?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [planLimitReached, setPlanLimitReached] = useState(false)
  const router = useRouter()
  const t = useTranslations('postJobModal')
  // Reuses the same translated labels as the /jobs filters (typeFullTime,
  // categoryEngineering, etc.) — one consistent term per concept, per the
  // i18n approach — while keeping the underlying English values sent to the API.
  const tj = useTranslations('jobs')

  const [title, setTitle] = useState('')
  const [company, setCompany] = useState(companyName)
  const [location, setLocation] = useState('Remote')
  const [workType, setWorkType] = useState('remote')
  const [jobType, setJobType] = useState('Full-time')
  const [category, setCategory] = useState('Engineering')
  const [description, setDescription] = useState('')
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')
  const [tags, setTags] = useState('')
  const [isFeatured, setIsFeatured] = useState(false)
  const [applyUrl, setApplyUrl] = useState('')

  // Paste-and-extract — prefills the fields above from a pasted job
  // description via Mistral (lib/ai/jobExtract.ts). Never posts anything
  // itself; the employer still reviews/edits every field before the real
  // submit below, which is unchanged.
  const [pasteText, setPasteText] = useState('')
  const [pasteUrl, setPasteUrl] = useState('')
  const [pasteMode, setPasteMode] = useState<'text' | 'url'>('text')
  const [extracting, setExtracting] = useState(false)
  const [extractError, setExtractError] = useState('')
  const [showPaste, setShowPaste] = useState(false)

  const [rssJobs, setRssJobs] = useState<Array<{ title: string | null; link: string | null; description: string | null; pubDate: string | null; guid: string | null }>>([])
  const [rssLoading, setRssLoading] = useState(false)
  const [rssError, setRssError] = useState('')
  const [showRss, setShowRss] = useState(false)
  const [selectedRssItem, setSelectedRssItem] = useState<typeof rssJobs[0] | null>(null)

  const [remotiveJobs, setRemotiveJobs] = useState<RemotiveJob[]>([])
  const [remotiveLoading, setRemotiveLoading] = useState(false)
  const [remotiveError, setRemotiveError] = useState('')
  const [showRemotive, setShowRemotive] = useState(false)

  const [arbeitnowJobs, setArbeitnowJobs] = useState<ArbeitnowJob[]>([])
  const [arbeitnowLoading, setArbeitnowLoading] = useState(false)
  const [arbeitnowError, setArbeitnowError] = useState('')
  const [showArbeitnow, setShowArbeitnow] = useState(false)

  const [adzunaJobs, setAdzunaJobs] = useState<AdzunaJob[]>([])
  const [adzunaLoading, setAdzunaLoading] = useState(false)
  const [adzunaError, setAdzunaError] = useState('')
  const [showAdzuna, setShowAdzuna] = useState(false)
  const [adzunaCountry, setAdzunaCountry] = useState<AdzunaCountryCode>('gb')

  const [enrichLoading, setEnrichLoading] = useState(false)
  const [enrichResult, setEnrichResult] = useState<{ enriched: number; remaining: number } | null>(null)
  const [enrichError, setEnrichError] = useState('')

  const [source, setSource] = useState<string | null>(null)

  function applyExtracted(extracted: Record<string, unknown>) {
    if (extracted.title) setTitle(extracted.title as string)
    if (extracted.company_name) setCompany(extracted.company_name as string)
    if (extracted.location) setLocation(extracted.location as string)
    if (extracted.work_type && VALID_WORK_TYPES.has(extracted.work_type as string)) setWorkType(extracted.work_type as string)
    if (extracted.job_type && VALID_JOB_TYPES.has(extracted.job_type as string)) setJobType(extracted.job_type as string)
    if (extracted.category && VALID_CATEGORIES.has(extracted.category as string)) setCategory(extracted.category as string)
    if (extracted.description) setDescription(extracted.description as string)
    if (extracted.salary_min != null) setSalaryMin(String(extracted.salary_min))
    if (extracted.salary_max != null) setSalaryMax(String(extracted.salary_max))
    if (Array.isArray(extracted.tags) && extracted.tags.length) setTags((extracted.tags as string[]).join(', '))
  }

  async function handleExtract() {
    setExtracting(true)
    setExtractError('')
    try {
      const body = pasteMode === 'url' ? { url: pasteUrl.trim() } : { text: pasteText }
      const res = await fetch('/api/ai/extract-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('extractGenericError'))

      applyExtracted(data.extracted)
      setShowPaste(false)
      setPasteText('')
      setPasteUrl('')
    } catch (err) {
      setExtractError(err instanceof Error ? err.message : t('extractGenericError'))
    } finally {
      setExtracting(false)
    }
  }

  async function fetchRssJobs() {
    setRssLoading(true)
    setRssError('')
    try {
      const res = await fetch('/api/ai/rss-jobs', { method: 'GET' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('extractGenericError'))

      setRssJobs(data.jobs || [])
    } catch (err) {
      setRssError(err instanceof Error ? err.message : t('extractGenericError'))
    } finally {
      setRssLoading(false)
    }
  }

  async function handleRssItemSelect(item: typeof rssJobs[0]) {
    setSelectedRssItem(item)
    setExtracting(true)
    setExtractError('')
    try {
      const res = await fetch('/api/ai/extract-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: item.description || '' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('extractGenericError'))

      // AI extraction covers structured fields (category, job_type, work_type, salary, tags)
      applyExtracted(data.extracted)

      // Overwrite with structured RSS data — more reliable than AI for these fields
      const { parsedTitle, parsedCompany } = parseWwrTitle(item.title ?? '')
      if (parsedTitle) setTitle(parsedTitle)
      if (parsedCompany) setCompany(parsedCompany)
      if (item.description) setDescription(item.description)
      setLocation('Remote, Worldwide')
      if (item.link) setApplyUrl(item.link)

      setSource('wwr')
      setShowRss(false)
      setRssJobs([])
      setRssError('')
      setSelectedRssItem(null)
    } catch (err) {
      setExtractError(err instanceof Error ? err.message : t('extractGenericError'))
      setSelectedRssItem(null)
    } finally {
      setExtracting(false)
    }
  }

  async function fetchRemotiveJobsClient() {
    setRemotiveLoading(true)
    setRemotiveError('')
    try {
      const res = await fetch('/api/admin/remotive-jobs', { method: 'GET' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('extractGenericError'))
      setRemotiveJobs(data.jobs || [])
    } catch (err) {
      setRemotiveError(err instanceof Error ? err.message : t('extractGenericError'))
    } finally {
      setRemotiveLoading(false)
    }
  }

  function handleRemotiveItemSelect(item: RemotiveJob) {
    const { min, max } = parseRemotiveSalary(item.salary)
    setTitle(item.title)
    setCompany(item.company_name)
    setLocation(item.candidate_required_location || 'Remote, Worldwide')
    setWorkType('remote')
    setJobType(mapRemotiveJobType(item.job_type))
    setCategory(mapRemotiveCategory(item.category))
    setDescription(item.description)
    setSalaryMin(min)
    setSalaryMax(max)
    setTags(item.tags.join(', '))
    setApplyUrl(item.url)
    setSource('remotive')
    setShowRemotive(false)
    setRemotiveJobs([])
    setRemotiveError('')
  }

  async function runEnrichJobs() {
    setEnrichLoading(true)
    setEnrichError('')
    try {
      const res = await fetch('/api/admin/enrich-jobs', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setEnrichResult(data)
    } catch (err) {
      setEnrichError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setEnrichLoading(false)
    }
  }

  async function fetchArbeitnowJobsClient() {
    setArbeitnowLoading(true)
    setArbeitnowError('')
    try {
      const res = await fetch('/api/admin/arbeitnow-jobs', { method: 'GET' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('extractGenericError'))
      setArbeitnowJobs(data.jobs || [])
    } catch (err) {
      setArbeitnowError(err instanceof Error ? err.message : t('extractGenericError'))
    } finally {
      setArbeitnowLoading(false)
    }
  }

  function handleArbeitnowItemSelect(item: ArbeitnowJob) {
    setTitle(item.title)
    setCompany(item.company_name)
    setLocation(item.location || 'Remote, Worldwide')
    setWorkType('remote')
    setJobType(mapArbeitnowJobType(item.job_types))
    setDescription(item.description)
    setTags(item.tags.join(', '))
    setApplyUrl(item.url)
    setSource('arbeitnow')
    setShowArbeitnow(false)
    setArbeitnowJobs([])
    setArbeitnowError('')
  }

  async function fetchAdzunaJobsClient(country: AdzunaCountryCode) {
    setAdzunaLoading(true)
    setAdzunaError('')
    try {
      const res = await fetch(`/api/admin/adzuna-jobs?country=${country}`, { method: 'GET' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('extractGenericError'))
      setAdzunaJobs(data.jobs || [])
    } catch (err) {
      setAdzunaError(err instanceof Error ? err.message : t('extractGenericError'))
    } finally {
      setAdzunaLoading(false)
    }
  }

  function handleAdzunaItemSelect(item: AdzunaJob) {
    const { minStr, maxStr } = formatAdzunaSalary(item.salary_min, item.salary_max)
    setTitle(item.title)
    setCompany(item.company_name)
    setLocation(item.location || 'Remote')
    setWorkType('remote')
    setDescription(item.description)
    setSalaryMin(minStr)
    setSalaryMax(maxStr)
    setApplyUrl(item.redirect_url)
    setSource(adzunaSourceKey(item.country))
    setShowAdzuna(false)
    setAdzunaJobs([])
    setAdzunaError('')
  }

  function resetForm() {
    setTitle('')
    setCompany(companyName)
    setLocation('Remote')
    setWorkType('remote')
    setJobType('Full-time')
    setCategory('Engineering')
    setDescription('')
    setSalaryMin('')
    setSalaryMax('')
    setTags('')
    setIsFeatured(false)
    setApplyUrl('')
    setError('')
    setPasteText('')
    setPasteUrl('')
    setPasteMode('text')
    setExtractError('')
    setShowPaste(false)
    setRssJobs([])
    setRssError('')
    setShowRss(false)
    setSelectedRssItem(null)
    setRemotiveJobs([])
    setRemotiveError('')
    setShowRemotive(false)
    setArbeitnowJobs([])
    setArbeitnowError('')
    setShowArbeitnow(false)
    setAdzunaJobs([])
    setAdzunaError('')
    setShowAdzuna(false)
    setAdzunaCountry('gb')
    setSource(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setPlanLimitReached(false)

    const min = salaryMin.trim() ? parseInt(salaryMin, 10) : null
    const max = salaryMax.trim() ? parseInt(salaryMax, 10) : null
    const salaryLabel = min && max ? `$${Math.round(min / 1000)}k–$${Math.round(max / 1000)}k` : null

    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title.trim(),
        company_name: company.trim(),
        location: location.trim(),
        work_type: workType,
        job_type: jobType,
        category,
        description: description.trim(),
        salary_min: min,
        salary_max: max,
        salary_label: salaryLabel,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        is_featured: isFeatured,
        apply_url: applyUrl.trim() || null,
        source: source || null,
      }),
    })

    if (res.status === 401) {
      router.push('/login?redirectTo=/recruiter')
      return
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error || t('genericError'))
      setPlanLimitReached(data.code === 'PLAN_LIMIT_REACHED')
      setLoading(false)
      return
    }

    setLoading(false)
    setOpen(false)
    resetForm()
    router.refresh()
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className={triggerClassName}>
        {triggerLabel}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between p-6 pb-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-slate-900 dark:text-white font-bold text-lg">{t('title')}</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-xl leading-none ms-4"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {!showPaste && !showRss && !showRemotive && !showArbeitnow && !showAdzuna ? (
                isAdmin ? (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowPaste(true)}
                    className="w-full text-sm text-primary dark:text-blue-400 border border-dashed border-primary/40 rounded-lg py-2.5 hover:bg-primary/5 transition-colors"
                  >
                    {t('pasteToFillButton')}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowRss(true); fetchRssJobs() }}
                    className="w-full text-sm text-primary dark:text-blue-400 border border-dashed border-primary/40 rounded-lg py-2.5 hover:bg-primary/5 transition-colors"
                  >
                    Browse We Work Remotely
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowRemotive(true); fetchRemotiveJobsClient() }}
                    className="w-full text-sm text-primary dark:text-blue-400 border border-dashed border-primary/40 rounded-lg py-2.5 hover:bg-primary/5 transition-colors"
                  >
                    Browse Remotive
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowArbeitnow(true); fetchArbeitnowJobsClient() }}
                    className="w-full text-sm text-primary dark:text-blue-400 border border-dashed border-primary/40 rounded-lg py-2.5 hover:bg-primary/5 transition-colors"
                  >
                    Browse Arbeitnow
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowAdzuna(true); fetchAdzunaJobsClient(adzunaCountry) }}
                    className="w-full text-sm text-primary dark:text-blue-400 border border-dashed border-primary/40 rounded-lg py-2.5 hover:bg-primary/5 transition-colors"
                  >
                    Browse Adzuna
                  </button>

                  {/* Enrich Jobs — batch geo-analysis on remote jobs with null geo_analysis */}
                  <div className="rounded-lg border border-dashed border-emerald-400/50 dark:border-emerald-600/40 overflow-hidden">
                    <button
                      type="button"
                      onClick={runEnrichJobs}
                      disabled={enrichLoading}
                      className="w-full text-sm text-emerald-700 dark:text-emerald-400 py-2.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors disabled:opacity-50"
                    >
                      {enrichLoading ? '⏳ Enriching geo-analysis…' : '✦ Enrich Jobs (geo-analysis)'}
                    </button>
                    {enrichError && (
                      <p className="text-xs text-red-500 dark:text-red-400 px-3 pb-2">{enrichError}</p>
                    )}
                    {enrichResult && (
                      <div className="px-3 pb-3 space-y-1.5 border-t border-emerald-100 dark:border-emerald-800/30 pt-2">
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          ✓ Enriched: <span className="font-bold text-emerald-700 dark:text-emerald-400">{enrichResult.enriched}</span>
                          {' · '}
                          Remaining: <span className="font-bold text-slate-800 dark:text-slate-200">{enrichResult.remaining}</span>
                        </p>
                        {enrichResult.remaining > 0 && (
                          <button
                            type="button"
                            onClick={runEnrichJobs}
                            disabled={enrichLoading}
                            className="w-full text-xs text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700 rounded py-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors disabled:opacity-50"
                          >
                            Continue →
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                ) : null
              ) : showPaste ? (
                <div className="border border-primary/30 rounded-lg p-3.5 space-y-3 bg-primary/5 dark:bg-primary/10">
                  {/* Mode toggle: Text / URL */}
                  <div className="flex gap-1 p-0.5 bg-slate-200 dark:bg-slate-700 rounded-lg w-fit">
                    {(['text', 'url'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => { setPasteMode(mode); setExtractError('') }}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                          pasteMode === mode
                            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                      >
                        {mode === 'text' ? t('pasteMode') : t('urlMode')}
                      </button>
                    ))}
                  </div>

                  {pasteMode === 'text' ? (
                    <>
                      <label className={labelClass}>{t('pasteLabel')}</label>
                      <textarea
                        value={pasteText}
                        onChange={(e) => setPasteText(e.target.value)}
                        rows={5}
                        placeholder={t('pastePlaceholder')}
                        className={`${inputClass} resize-none`}
                      />
                    </>
                  ) : (
                    <>
                      <label className={labelClass}>{t('urlMode')}</label>
                      <input
                        type="url"
                        value={pasteUrl}
                        onChange={(e) => setPasteUrl(e.target.value)}
                        placeholder={t('urlPlaceholder')}
                        className={inputClass}
                      />
                    </>
                  )}

                  {extractError && (
                    <p className="text-sm text-red-600 dark:text-red-400">{extractError}</p>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleExtract}
                      disabled={
                        extracting ||
                        (pasteMode === 'text' ? pasteText.trim().length < 50 : pasteUrl.trim().length === 0)
                      }
                      className="flex-1 btn-primary py-2 text-sm disabled:opacity-50"
                    >
                      {extracting ? t('extractingButton') : t('extractButton')}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowPaste(false); setExtractError('') }}
                      className="btn-outline py-2 px-4 text-sm"
                    >
                      {t('cancel')}
                    </button>
                  </div>
                </div>
              ) : showRss ? (
                <div className="border border-primary/30 rounded-lg p-3.5 space-y-3 bg-primary/5 dark:bg-primary/10">
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white">We Work Remotely - Remote Jobs</h3>

                  {rssLoading && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">{t('extractingButton')}...</p>
                  )}

                  {rssError && (
                    <p className="text-sm text-red-600 dark:text-red-400">{rssError}</p>
                  )}

                  {!rssLoading && !rssError && rssJobs.length > 0 && (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {rssJobs.map((job, idx) => (
                        <button
                          key={job.guid || idx}
                          type="button"
                          onClick={() => handleRssItemSelect(job)}
                          disabled={selectedRssItem === job && extracting}
                          className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors text-sm disabled:opacity-50"
                        >
                          <div className="font-medium text-slate-900 dark:text-white truncate">{job.title}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{job.description?.substring(0, 80)}...</div>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setShowRss(false); setRssError(''); setRssJobs([]) }}
                      className="btn-outline py-2 px-4 text-sm w-full"
                    >
                      {t('cancel')}
                    </button>
                  </div>
                </div>
              ) : showRemotive ? (
                <div className="border border-primary/30 rounded-lg p-3.5 space-y-3 bg-primary/5 dark:bg-primary/10">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Browse Remotive</p>

                  {remotiveLoading && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">Loading…</p>
                  )}

                  {remotiveError && (
                    <p className="text-sm text-red-600 dark:text-red-400">{remotiveError}</p>
                  )}

                  {!remotiveLoading && !remotiveError && remotiveJobs.length > 0 && (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {remotiveJobs.map((job) => (
                        <button
                          key={job.id}
                          type="button"
                          onClick={() => handleRemotiveItemSelect(job)}
                          className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors text-sm"
                        >
                          <div className="font-medium text-slate-900 dark:text-white truncate">{job.title}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {job.company_name} · {job.category}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setShowRemotive(false); setRemotiveError(''); setRemotiveJobs([]) }}
                      className="btn-outline py-2 px-4 text-sm w-full"
                    >
                      {t('cancel')}
                    </button>
                  </div>
                </div>
              ) : showArbeitnow ? (
                <div className="border border-primary/30 rounded-lg p-3.5 space-y-3 bg-primary/5 dark:bg-primary/10">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Browse Arbeitnow</p>

                  {arbeitnowLoading && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">Loading…</p>
                  )}

                  {arbeitnowError && (
                    <p className="text-sm text-red-600 dark:text-red-400">{arbeitnowError}</p>
                  )}

                  {!arbeitnowLoading && !arbeitnowError && arbeitnowJobs.length > 0 && (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {arbeitnowJobs.map((job) => (
                        <button
                          key={job.slug}
                          type="button"
                          onClick={() => handleArbeitnowItemSelect(job)}
                          className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors text-sm"
                        >
                          <div className="font-medium text-slate-900 dark:text-white truncate">{job.title}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {job.company_name} · {job.location}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setShowArbeitnow(false); setArbeitnowError(''); setArbeitnowJobs([]) }}
                      className="btn-outline py-2 px-4 text-sm w-full"
                    >
                      {t('cancel')}
                    </button>
                  </div>
                </div>
              ) : showAdzuna ? (
                <div className="border border-primary/30 rounded-lg p-3.5 space-y-3 bg-primary/5 dark:bg-primary/10">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Browse Adzuna</p>
                    <select
                      value={adzunaCountry}
                      onChange={(e) => {
                        const c = e.target.value as AdzunaCountryCode
                        setAdzunaCountry(c)
                        setAdzunaJobs([])
                        fetchAdzunaJobsClient(c)
                      }}
                      className="ml-auto text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1"
                    >
                      {ADZUNA_COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  {adzunaLoading && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">Loading…</p>
                  )}

                  {adzunaError && (
                    <p className="text-sm text-red-600 dark:text-red-400">{adzunaError}</p>
                  )}

                  {!adzunaLoading && !adzunaError && adzunaJobs.length > 0 && (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {adzunaJobs.map((job) => (
                        <button
                          key={job.id}
                          type="button"
                          onClick={() => handleAdzunaItemSelect(job)}
                          className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors text-sm"
                        >
                          <div className="font-medium text-slate-900 dark:text-white truncate">{job.title}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {job.company_name} · {job.location}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setShowAdzuna(false); setAdzunaError(''); setAdzunaJobs([]) }}
                      className="btn-outline py-2 px-4 text-sm w-full"
                    >
                      {t('cancel')}
                    </button>
                  </div>
                </div>
              ) : null}

              <div>
                <label className={labelClass}>{t('jobTitle')}</label>
                <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('jobTitlePlaceholder')} className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>{t('companyName')}</label>
                <input required value={company} onChange={(e) => setCompany(e.target.value)} placeholder={t('companyNamePlaceholder')} className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>{t('location')}</label>
                <input required value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t('locationPlaceholder')} className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>{t('workType')}</label>
                <select required value={workType} onChange={(e) => setWorkType(e.target.value)} className={inputClass}>
                  {WORK_TYPES.map((wt) => <option key={wt} value={wt}>{tj(WORK_TYPE_KEYS[wt])}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>{t('jobType')}</label>
                  <select value={jobType} onChange={(e) => setJobType(e.target.value)} className={inputClass}>
                    {JOB_TYPES.map((jt) => <option key={jt} value={jt}>{tj(JOB_TYPE_KEYS[jt])}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('category')}</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{tj(CATEGORY_KEYS[c])}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>{t('description')}</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder={t('descriptionPlaceholder')}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>{t('salaryMin')} <span className="text-slate-600 dark:text-slate-400">{t('optional')}</span></label>
                  <input type="number" min="0" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} placeholder="150000" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t('salaryMax')} <span className="text-slate-600 dark:text-slate-400">{t('optional')}</span></label>
                  <input type="number" min="0" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} placeholder="190000" className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>{t('tags')} <span className="text-slate-600 dark:text-slate-400">{t('tagsHint')}</span></label>
                <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder={t('tagsPlaceholder')} className={inputClass} />
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="rounded border-slate-300 dark:border-slate-700" />
                {t('markAsFeatured')}
              </label>

              {error && (
                <div className="text-sm">
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                  {planLimitReached && (
                    <Link href="/pricing#employers" className="text-primary dark:text-blue-400 hover:underline font-medium">
                      {t('viewPlans')}
                    </Link>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 btn-outline py-2.5 text-sm">
                  {t('cancel')}
                </button>
                <button type="submit" disabled={loading} className="flex-1 btn-primary py-2.5 text-sm disabled:opacity-50">
                  {loading ? t('posting') : t('postJob')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
